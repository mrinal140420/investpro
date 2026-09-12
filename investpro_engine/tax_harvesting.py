"""
InvestPro — TaxHarvestingEngine
Deterministic tax-loss/gain harvesting under Section 112A (Budget 2024 ₹1.25 Lakh exemption).
Runs on an annual schedule (February audit) to step-up cost basis with zero tax leakage.
"""

from datetime import date, datetime
from typing import Dict, List, Any, Optional
from decimal import Decimal, ROUND_DOWN


class TaxHarvestingEngine:
    """
    Automates Section 112A Long-Term Capital Gains (LTCG) tax harvesting.
    Strictly caps realized gains at <= ₹1,25,000 to maintain 0% tax liability.
    Generates synchronized SELL + immediate REINVEST directives.
    """

    LTCG_EXEMPTION_CAP_INR: float = 125000.0  # Budget 2024 Section 112A limit
    HOLDING_PERIOD_DAYS_THRESHOLD: int = 365

    def __init__(self, exemption_cap: float = 125000.0):
        self.exemption_cap = float(exemption_cap)

    def scan_and_generate_directives(
        self,
        tax_lots: List[Dict[str, Any]],
        current_nav_lookup: Dict[str, float],
        as_of_date: Optional[date] = None,
        already_realized_ltcg: float = 0.0,
    ) -> Dict[str, Any]:
        """
        Scans tax lots held > 365 days with unrealized gains.
        Selects exact fractional units to harvest up to the remaining exemption cap.

        :param tax_lots: List of dicts representing unexhausted lots from `tax_lots_fifo`
                         Keys: lot_id, scheme_name, isin, purchase_date, purchase_nav, units_remaining
        :param current_nav_lookup: Dict mapping scheme_name to current live NAV
        :param as_of_date: Date of simulation (defaults to today)
        :param already_realized_ltcg: Any LTCG already booked in the current financial year
        :return: Harvest plan with directives, total gain harvested, and tax saved
        """
        today = as_of_date or date.today()
        remaining_cap = max(0.0, self.exemption_cap - float(already_realized_ltcg))

        # Filter candidate lots: held > 365 days and current_nav > purchase_nav
        candidates: List[Dict[str, Any]] = []
        for lot in tax_lots:
            units = float(lot.get("units_remaining", 0.0))
            if units <= 0:
                continue

            p_date_raw = lot.get("purchase_date")
            if isinstance(p_date_raw, str):
                p_date = date.fromisoformat(p_date_raw)
            elif isinstance(p_date_raw, datetime):
                p_date = p_date_raw.date()
            else:
                p_date = p_date_raw

            holding_days = (today - p_date).days
            if holding_days <= self.HOLDING_PERIOD_DAYS_THRESHOLD:
                continue  # Short term capital gain (STCG) excluded from 112A

            scheme = lot.get("scheme_name", "")
            curr_nav = current_nav_lookup.get(scheme)
            if not curr_nav or curr_nav <= 0:
                continue

            purchase_nav = float(lot.get("purchase_nav", 0.0))
            gain_per_unit = curr_nav - purchase_nav

            if gain_per_unit > 0:
                candidates.append({
                    "lot_id": lot.get("lot_id"),
                    "scheme_name": scheme,
                    "isin": lot.get("isin"),
                    "purchase_date": p_date.isoformat(),
                    "holding_days": holding_days,
                    "purchase_nav": purchase_nav,
                    "current_nav": curr_nav,
                    "gain_per_unit": gain_per_unit,
                    "units_available": units,
                    "max_lot_gain": units * gain_per_unit,
                })

        # Sort candidate lots: Highest gain density or oldest lots first (FIFO compliant)
        candidates.sort(key=lambda x: (x["purchase_date"], -x["gain_per_unit"]))

        harvested_lots: List[Dict[str, Any]] = []
        cumulative_gain = 0.0
        directives: List[Dict[str, Any]] = []

        for c in candidates:
            if cumulative_gain >= remaining_cap:
                break

            max_lot_gain = c["max_lot_gain"]
            space_left = remaining_cap - cumulative_gain

            if max_lot_gain <= space_left:
                # Fully harvest this lot
                units_to_sell = c["units_available"]
                gain_from_lot = max_lot_gain
            else:
                # Partially harvest exact fractional units to reach remaining_cap without exceeding
                gain_from_lot = space_left
                units_to_sell = gain_from_lot / c["gain_per_unit"]
                # Round units down to 4 decimals to ensure gain strictly never exceeds space_left
                units_to_sell = float(Decimal(str(units_to_sell)).quantize(Decimal("0.0001"), rounding=ROUND_DOWN))
                gain_from_lot = units_to_sell * c["gain_per_unit"]

            if units_to_sell <= 0:
                continue

            redemption_amount = round(units_to_sell * c["current_nav"], 2)
            cumulative_gain += gain_from_lot

            harvested_record = {
                "lot_id": c["lot_id"],
                "scheme_name": c["scheme_name"],
                "isin": c["isin"],
                "purchase_nav": c["purchase_nav"],
                "current_nav": c["current_nav"],
                "units_to_harvest": units_to_sell,
                "redemption_amount_inr": redemption_amount,
                "gain_harvested_inr": round(gain_from_lot, 2),
                "purchase_date": c["purchase_date"],
            }
            harvested_lots.append(harvested_record)

            # Generate Paired Directives: SELL + Immediate REINVEST
            # 1. Redemption directive
            directives.append({
                "directive_type": "HARVEST_TAX",
                "action": "SELL",
                "source_scheme": c["scheme_name"],
                "target_scheme": "LIQUID_SETTLEMENT",
                "amount_inr": redemption_amount,
                "units_estimated": units_to_sell,
                "rationale_heading": f"Tax-Free LTCG Harvest: {c['scheme_name']}",
                "math_rationale": (
                    f"Harvesting ₹{round(gain_from_lot, 2):,.2f} unrealized LTCG tax-free under "
                    f"Section 112A (Cumulative: ₹{round(cumulative_gain, 2):,.2f} / ₹{self.exemption_cap:,.2f}). "
                    f"Selling {units_to_sell:.4f} units bought at ₹{c['purchase_nav']} at current NAV ₹{c['current_nav']}."
                ),
                "urgency": "HIGH",
                "state": "PENDING_APPROVAL",
            })

            # 2. Immediate Reinvestment directive to step-up cost basis
            directives.append({
                "directive_type": "HARVEST_TAX",
                "action": "BUY",
                "source_scheme": "LIQUID_SETTLEMENT",
                "target_scheme": c["scheme_name"],
                "amount_inr": redemption_amount,
                "units_estimated": round(redemption_amount / c["current_nav"], 4),
                "rationale_heading": f"Step-Up Reinvestment: {c['scheme_name']}",
                "math_rationale": (
                    f"Immediately repurchasing ₹{redemption_amount:,.2f} in {c['scheme_name']}. "
                    f"Resets cost basis from ₹{c['purchase_nav']} to ₹{c['current_nav']}, permanently wiping out "
                    f"₹{round(gain_from_lot, 2):,.2f} of future capital gains tax liability."
                ),
                "urgency": "HIGH",
                "state": "PENDING_APPROVAL",
            })

        # Calculate tax saved under Budget 2024 (12.5% LTCG on equity)
        tax_saved_inr = round(cumulative_gain * 0.125, 2)

        return {
            "status": "OPPORTUNITY_FOUND" if cumulative_gain > 0 else "NO_ELIGIBLE_LOTS",
            "as_of_date": today.isoformat(),
            "target_exemption_cap_inr": self.exemption_cap,
            "total_gain_harvested_inr": round(cumulative_gain, 2),
            "tax_saved_inr": tax_saved_inr,
            "exemption_utilized_pct": round((cumulative_gain / self.exemption_cap) * 100, 2),
            "harvested_lots_count": len(harvested_lots),
            "harvested_lots_detail": harvested_lots,
            "directives": directives,
            "is_within_statutory_limit": cumulative_gain <= self.exemption_cap,
        }
