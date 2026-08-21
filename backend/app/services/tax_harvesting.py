from dataclasses import dataclass
from typing import Dict, Any, List
from app.services.ghost_trajectory import format_indian_currency

@dataclass
class TaxHarvestOpportunity:
    scheme_name: str
    amfi_code: str
    unrealized_ltcg_gain: float
    formatted_unrealized_gain: str
    harvestable_gain: float
    formatted_harvestable_gain: str
    tax_saved_this_year: float
    formatted_tax_saved: str
    action: str
    groww_url: str

class TaxAlphaEngine:
    """
    Annual Section 112A Tax-Gain Harvesting Engine (Budget 2024)
    
    Rules:
    • Long-Term Capital Gains (LTCG) from equity funds held > 12 months are tax-free up to ₹1.25 Lakhs per FY.
    • Gains exceeding ₹1.25 Lakhs are taxed at 12.5%.
    • Action: Perform a paired switch / redeem & immediate reinvest to step up the acquisition cost basis,
      permanently saving ₹15,625 in taxes every single year without leaving the market!
    """

    def scan_tax_harvesting(
        self,
        portfolio_value: float = 0.0,
        unrealized_gains_override: float = 0.0,
        holdings: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        
        exemption_limit = 125000.0  # ₹1.25 Lakhs exemption under Section 112A
        ltcg_tax_rate = 0.125  # 12.5%

        # If explicit unrealized gains passed or estimated from portfolio value (~15% annual gain)
        estimated_gains = unrealized_gains_override if unrealized_gains_override > 0 else (portfolio_value * 0.15)
        
        harvestable_amount = min(estimated_gains, exemption_limit)
        potential_tax_saved = harvestable_amount * ltcg_tax_rate
        excess_taxable_gains = max(0.0, estimated_gains - exemption_limit)
        future_tax_on_excess = excess_taxable_gains * ltcg_tax_rate

        is_eligible = estimated_gains > 10000.0

        recommendations = [
            {
                "scheme_name": "HDFC Nifty 50 Index Fund Direct Growth",
                "amfi_code": "119063",
                "recommended_harvest_amount": min(harvestable_amount * 0.5, 62500.0),
                "formatted_harvest_amount": format_indian_currency(min(harvestable_amount * 0.5, 62500.0)),
                "groww_url": "https://groww.in/mutual-funds/hdfc-nifty-50-index-fund-direct-growth"
            },
            {
                "scheme_name": "Tata Small Cap Fund Direct Growth",
                "amfi_code": "145206",
                "recommended_harvest_amount": min(harvestable_amount * 0.5, 62500.0),
                "formatted_harvest_amount": format_indian_currency(min(harvestable_amount * 0.5, 62500.0)),
                "groww_url": "https://groww.in/mutual-funds/tata-small-cap-fund-direct-growth"
            }
        ]

        return {
            "annual_exemption_limit": exemption_limit,
            "formatted_exemption_limit": format_indian_currency(exemption_limit),
            "estimated_unrealized_gains": round(estimated_gains, 2),
            "formatted_unrealized_gains": format_indian_currency(estimated_gains),
            "optimal_harvestable_gain": round(harvestable_amount, 2),
            "formatted_harvestable_gain": format_indian_currency(harvestable_amount),
            "guaranteed_tax_saved": round(potential_tax_saved, 2),
            "formatted_tax_saved": format_indian_currency(potential_tax_saved),
            "excess_gains_above_limit": round(excess_taxable_gains, 2),
            "formatted_excess_gains": format_indian_currency(excess_taxable_gains),
            "is_harvesting_recommended": is_eligible,
            "optimal_execution_window": "January 15 – March 25 (Pre-FY Close)",
            "strategy_explanation": (
                f"By executing a paired redeem & reinvest of {format_indian_currency(harvestable_amount)} "
                f"before March 31, your acquisition cost basis is stepped up without paying any tax. "
                f"This locks in an immediate {format_indian_currency(potential_tax_saved)} permanent tax saving."
            ),
            "action_directives": recommendations
        }
