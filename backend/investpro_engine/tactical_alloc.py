"""
InvestPro — TacticalAllocEngine (Gajendra Kothari Model)
Combines passive multi-asset discipline (50/20/20/10) with contrarian tactical triggers.
Deploys sidelined dry powder during 15-20% market drawdowns and executes annual drift rebalancing.
"""

from datetime import date
from typing import Dict, List, Any, Optional


class TacticalAllocEngine:
    """
    Implements the Gajendra Kothari Multi-Asset & Contrarian Rebalancing Model:
    - Baseline Weights: 50% India Equity, 20% Global Equity, 20% Gold, 10% Debt/Liquid.
    - Drift Trigger: +/- 5% deviation triggers TRIM_AND_SWEEP.
    - Drawdown Trigger: Market drop >= 15% from 52-week high triggers TACTICAL_LUMPSUM_DEPLOY.
    """

    DEFAULT_TARGET_WEIGHTS = {
        "INDIA_EQUITY": 50.0,
        "GLOBAL_EQUITY": 20.0,
        "GOLD_PRECIOUS": 20.0,
        "DEBT_LIQUID": 10.0,
    }

    DRIFT_THRESHOLD_PCT: float = 5.0
    DRAWDOWN_TRIGGER_PCT: float = -15.0  # -15% or deeper drop from 52w high

    def __init__(self, target_weights: Optional[Dict[str, float]] = None):
        self.target_weights = target_weights or self.DEFAULT_TARGET_WEIGHTS.copy()
        # Verify 100% allocation
        total = sum(self.target_weights.values())
        if abs(total - 100.0) > 0.01:
            raise ValueError(f"Target allocations must sum to 100%, got {total}%")

    def audit_rebalance(
        self,
        current_holdings_by_class: Dict[str, float],
        as_of_date: Optional[date] = None,
        is_annual_audit: bool = True,
    ) -> Dict[str, Any]:
        """
        Calculates portfolio drift across all 4 asset classes and generates TRIM_AND_SWEEP directives.

        :param current_holdings_by_class: Current INR valuation per asset class
               Keys: 'INDIA_EQUITY', 'GLOBAL_EQUITY', 'GOLD_PRECIOUS', 'DEBT_LIQUID'
        :param as_of_date: Date of calculation
        :param is_annual_audit: Whether this is the scheduled Jan 1st audit
        :return: Audit report with drift analysis and actionable directives
        """
        audit_date = as_of_date or date.today()
        total_valuation = sum(current_holdings_by_class.values())

        if total_valuation <= 0:
            return {
                "status": "EMPTY_PORTFOLIO",
                "total_valuation": 0.0,
                "directives": [],
                "drift_report": {},
            }

        drift_report = {}
        overweight_classes: List[Dict[str, Any]] = []
        underweight_classes: List[Dict[str, Any]] = []
        rebalance_needed = False

        for ac, target_pct in self.target_weights.items():
            curr_val = current_holdings_by_class.get(ac, 0.0)
            curr_pct = (curr_val / total_valuation) * 100.0
            drift_pct = curr_pct - target_pct
            drift_val = (drift_pct / 100.0) * total_valuation

            exceeds_threshold = abs(drift_pct) >= self.DRIFT_THRESHOLD_PCT
            if exceeds_threshold:
                rebalance_needed = True

            class_info = {
                "asset_class": ac,
                "current_valuation_inr": round(curr_val, 2),
                "current_pct": round(curr_pct, 2),
                "target_pct": target_pct,
                "drift_pct": round(drift_pct, 2),
                "drift_valuation_inr": round(drift_val, 2),
                "is_breached": exceeds_threshold,
            }
            drift_report[ac] = class_info

            if drift_pct >= self.DRIFT_THRESHOLD_PCT:
                overweight_classes.append(class_info)
            elif drift_pct <= -self.DRIFT_THRESHOLD_PCT:
                underweight_classes.append(class_info)

        directives: List[Dict[str, Any]] = []

        if rebalance_needed:
            # Generate TRIM_AND_SWEEP directives
            for ow in overweight_classes:
                trim_amt = ow["drift_valuation_inr"]
                directives.append({
                    "directive_type": "TRIM_AND_SWEEP",
                    "action": "SELL",
                    "source_scheme": ow["asset_class"],
                    "target_scheme": "LIQUID_BUFFER",
                    "amount_inr": trim_amt,
                    "rationale_heading": f"Annual Rebalancing: Trim {ow['asset_class']} (+{ow['drift_pct']}%)",
                    "math_rationale": (
                        f"{ow['asset_class']} weight has drifted to {ow['current_pct']}% "
                        f"(Target: {ow['target_pct']}%, Drift: +{ow['drift_pct']}%). "
                        f"Exceeds ±{self.DRIFT_THRESHOLD_PCT}% threshold. Trimming ₹{trim_amt:,.2f} "
                        f"to lock gains and restore risk posture."
                    ),
                    "urgency": "MEDIUM",
                    "state": "PENDING_APPROVAL",
                })

            for uw in underweight_classes:
                sweep_amt = abs(uw["drift_valuation_inr"])
                directives.append({
                    "directive_type": "TRIM_AND_SWEEP",
                    "action": "BUY",
                    "source_scheme": "LIQUID_BUFFER",
                    "target_scheme": uw["asset_class"],
                    "amount_inr": sweep_amt,
                    "rationale_heading": f"Annual Rebalancing: Sweep into {uw['asset_class']} ({uw['drift_pct']}%)",
                    "math_rationale": (
                        f"{uw['asset_class']} allocation is at {uw['current_pct']}% "
                        f"(Target: {uw['target_pct']}%, Deficit: {uw['drift_pct']}%). "
                        f"Sweeping ₹{sweep_amt:,.2f} from trimmed assets to restore 50/20/20/10 equilibrium."
                    ),
                    "urgency": "MEDIUM",
                    "state": "PENDING_APPROVAL",
                })

        return {
            "status": "REBALANCE_REQUIRED" if rebalance_needed else "PORTFOLIO_BALANCED",
            "audit_date": audit_date.isoformat(),
            "total_valuation_inr": round(total_valuation, 2),
            "rebalance_triggered": rebalance_needed,
            "drift_tolerance_pct": self.DRIFT_THRESHOLD_PCT,
            "drift_report": drift_report,
            "directives": directives,
        }

    def evaluate_drawdown_trigger(
        self,
        index_symbol: str,
        current_price: float,
        high_52_week: float,
        available_dry_powder_debt_inr: float,
    ) -> Dict[str, Any]:
        """
        Contrarian Trigger: When Nifty 50 or Nifty Smallcap 250 suffers a >= 15% drawdown,
        issue TACTICAL_LUMPSUM_DEPLOY to sweep sideline dry powder into discounted equity.

        :param index_symbol: e.g. 'NIFTY_50' or 'NIFTY_SMALLCAP_250'
        :param current_price: Current market closing or live price
        :param high_52_week: 52-week peak price
        :param available_dry_powder_debt_inr: Balance in 10% Liquid/Debt bucket
        :return: Trigger evaluation and contrarian directive
        """
        if high_52_week <= 0:
            return {"status": "INVALID_HIGH", "is_triggered": False}

        drawdown_pct = ((current_price - high_52_week) / high_52_week) * 100.0
        is_triggered = drawdown_pct <= self.DRAWDOWN_TRIGGER_PCT

        directives: List[Dict[str, Any]] = []

        if is_triggered and available_dry_powder_debt_inr > 0:
            # Contrarian deployment rule: Deploy 50% of available dry powder on -15% drawdown,
            # and up to 100% if drawdown hits -20% or worse
            deploy_ratio = 1.0 if drawdown_pct <= -20.0 else 0.50
            deploy_amount = round(available_dry_powder_debt_inr * deploy_ratio, 2)

            target_asset = "INDIA_SMALL_CAP" if "SMALLCAP" in index_symbol.upper() else "INDIA_LARGE_CAP"

            directives.append({
                "directive_type": "DEPLOY_DRY_POWDER",
                "action": "BUY",
                "source_scheme": "LIQUID_DEBT_DRY_POWDER",
                "target_scheme": target_asset,
                "amount_inr": deploy_amount,
                "rationale_heading": f"Contrarian Trigger: {index_symbol} Drawdown ({drawdown_pct:.1f}%)",
                "math_rationale": (
                    f"{index_symbol} is trading at {current_price:,.2f}, down {abs(drawdown_pct):.2f}% "
                    f"from 52-week high of {high_52_week:,.2f} (Breaching -15.0% contrarian trigger). "
                    f"Deploying {int(deploy_ratio * 100)}% (₹{deploy_amount:,.2f}) of sideline dry powder "
                    f"from Liquid Funds into discounted {target_asset} to capture asymmetric recovery alpha."
                ),
                "urgency": "CRITICAL",
                "state": "PENDING_APPROVAL",
            })

        return {
            "status": "CONTRARIAN_TRIGGER_ACTIVATED" if is_triggered else "NORMAL_MARKET_CONDITIONS",
            "index_symbol": index_symbol,
            "current_price": current_price,
            "high_52_week": high_52_week,
            "drawdown_pct": round(drawdown_pct, 2),
            "is_triggered": is_triggered,
            "directives": directives,
        }
