from dataclasses import dataclass
from typing import List, Dict, Any
from app.services.ghost_trajectory import format_indian_currency

@dataclass
class AssetAllocationRecommendation:
    asset_class: str
    bucket: str
    allocation_pct: float
    allocated_sip: float
    allocated_lumpsum: float
    formatted_sip: str
    formatted_lumpsum: str
    fund_name: str
    amfi_code: str
    groww_url: str
    return_3y_cagr: float
    return_5y_cagr: float
    return_all_time: float
    risk_level: str
    risk_explanation: str
    goal_impact_role: str
    annual_growth_contribution: float
    formatted_growth_contribution: str

class AIAdvisorEngine:
    """
    AI Financial Advisor Engine (v6.0)
    
    Clean Performance & Goal Contribution Model:
    • Focuses on Fund Work, 3Y/5Y CAGRs, Annual Growth Contributions, and Role in Goal.
    • Eliminates individual allocated SIP breakdown badges as requested.
    """

    def generate_recommendations(
        self,
        monthly_sip: float = 0.0,
        lump_sum: float = 0.0,
        risk_mode: str = "aggressive"
    ) -> Dict[str, Any]:

        if risk_mode == "ultra_aggressive":
            alloc_weights = [
                ("Small Cap Equity Fund", "Accelerator", 35.0, "Tata Small Cap Fund Direct Growth", "145206", "https://groww.in/mutual-funds/tata-small-cap-fund-direct-growth", 24.5, 28.2, 22.4, "Very High", "Pure aggressive small-cap alpha engine. Exceptional 28.2% 5Y CAGR. High short-term drawdown risk, maximum long-term wealth creation.", "Primary High-Alpha Multiplier for Target Corpus"),
                ("Momentum 30 Factor ETF", "Accelerator", 25.0, "UTI Nifty 200 Momentum 30 Index Fund", "149363", "https://groww.in/mutual-funds/uti-nifty200-momentum-30-index-fund-direct-growth", 18.5, 21.4, 19.1, "High", "Systematic trend-following ETF selecting top 30 momentum stocks. Monitored by 50/200 SMA circuit breaker.", "Trend-Following Growth Accelerator"),
                ("Nifty 50 Index Fund", "Anchor", 20.0, "HDFC Nifty 50 Index Fund Direct Growth", "119063", "https://groww.in/mutual-funds/hdfc-nifty-50-index-fund-direct-growth", 15.2, 14.8, 15.1, "Moderate", "Core Indian economy benchmark anchor. Ultra-low expense ratio (0.20%). Unbreakable baseline.", "Core Market Compounder & Baseline Stability"),
                ("Nifty Next 50 Index Fund", "Anchor", 10.0, "ICICI Prudential Nifty Next 50 Index Fund", "120716", "https://groww.in/mutual-funds/icici-prudential-nifty-next-50-index-fund-direct-growth", 17.7, 15.8, 16.4, "Moderate-High", "High-growth large-cap giants (Rank 51-100). Next generation bluechips.", "Large-Cap Growth Booster"),
                ("Precious Metals (Silver & Gold ETF)", "Hedge", 10.0, "Nippon India Silver ETF FoF Direct Growth", "149812", "https://groww.in/mutual-funds/nippon-india-silver-etf-fof-direct-growth", 16.8, 14.2, 15.5, "Moderate", "Commodity real asset allocation safeguarding capital against inflation and market crashes.", "Inflation Hedge & Crash Cushion")
            ]
        elif risk_mode == "balanced":
            alloc_weights = [
                ("Nifty 50 Index Fund", "Anchor", 30.0, "HDFC Nifty 50 Index Fund Direct Growth", "119063", "https://groww.in/mutual-funds/hdfc-nifty-50-index-fund-direct-growth", 15.2, 14.8, 15.1, "Low-Moderate", "Core benchmark index fund providing steady large-cap market compounding.", "Core Benchmark Compounder"),
                ("Small Cap Equity Fund", "Accelerator", 20.0, "Tata Small Cap Fund Direct Growth", "145206", "https://groww.in/mutual-funds/tata-small-cap-fund-direct-growth", 24.5, 28.2, 22.4, "High", "Controlled small cap allocation for compounding alpha.", "Alpha Growth Multiplier"),
                ("Liquid Emergency Fund", "Debt Shield", 20.0, "Parag Parikh Liquid Fund Direct Growth", "143329", "https://groww.in/mutual-funds/parag-parikh-liquid-fund-direct-growth", 6.8, 6.2, 6.5, "Low", "Instant liquidity emergency reserve investing in sovereign T-Bills. Zero credit risk.", "Downside & Liquidity Shield"),
                ("Nifty Next 50 Index Fund", "Anchor", 15.0, "ICICI Prudential Nifty Next 50 Index Fund", "120716", "https://groww.in/mutual-funds/icici-prudential-nifty-next-50-index-fund-direct-growth", 17.7, 15.8, 16.4, "Moderate", "Mid-large cap growth baseline.", "Mid-Large Cap Compounder"),
                ("Gold & Silver ETF", "Hedge", 15.0, "HDFC Gold Fund Direct Growth", "119854", "https://groww.in/mutual-funds/hdfc-gold-fund-direct-growth", 14.8, 13.5, 12.9, "Low-Moderate", "Gold & Silver real asset hedge for capital shield.", "Inflation Real Asset Defense")
            ]
        else: # Standard Aggressive Barbell (Default)
            alloc_weights = [
                ("Small Cap Equity Fund", "Accelerator", 30.0, "Tata Small Cap Fund Direct Growth", "145206", "https://groww.in/mutual-funds/tata-small-cap-fund-direct-growth", 24.5, 28.2, 22.4, "Very High", "Primary wealth multiplier. 28.2% 5Y CAGR. High short-term volatility, massive long-term compounding.", "Primary High-Alpha Wealth Multiplier"),
                ("Momentum 30 Factor ETF", "Accelerator", 25.0, "UTI Nifty 200 Momentum 30 Index Fund", "149363", "https://groww.in/mutual-funds/uti-nifty200-momentum-30-index-fund-direct-growth", 18.5, 21.4, 19.1, "High", "Quant trend-following strategy. Circuit breaker monitors 50/200 SMA to exit during crashes.", "Trend-Following Growth Accelerator"),
                ("Nifty 50 Index Fund (Direct)", "Anchor", 20.0, "HDFC Nifty 50 Index Fund Direct Growth", "119063", "https://groww.in/mutual-funds/hdfc-nifty-50-index-fund-direct-growth", 15.2, 14.8, 15.1, "Low-Moderate", "Ultra-low expense index anchor. Baseline stability across India's top 50 conglomerates.", "Core Market Anchor & Baseline Stability"),
                ("Nifty Next 50 Index Fund", "Anchor", 15.0, "ICICI Prudential Nifty Next 50 Index Fund", "120716", "https://groww.in/mutual-funds/icici-prudential-nifty-next-50-index-fund-direct-growth", 17.7, 15.8, 16.4, "Moderate", "Aggressive large-cap anchor (Rank 51-100). Never receives sell signals.", "Large-Cap Growth Booster"),
                ("Precious Metals (Silver & Gold)", "Hedge", 10.0, "Nippon India Silver ETF FoF Direct Growth", "149812", "https://groww.in/mutual-funds/nippon-india-silver-etf-fof-direct-growth", 16.8, 14.2, 15.5, "Moderate", "Commodity asset allocation providing inflation hedge and downside crash protection.", "Inflation Defense & Crash Cushion")
            ]

        recommendations = []
        weighted_5y_cagr = 0.0
        total_annual_growth = 0.0

        for asset_cls, bucket, weight_pct, fund_name, amfi_code, groww_url, r3, r5, r_all, risk_lvl, risk_exp, goal_role in alloc_weights:
            sip_amt = round(monthly_sip * (weight_pct / 100.0), 2)
            lump_amt = round(lump_sum * (weight_pct / 100.0), 2)
            weighted_5y_cagr += r5 * (weight_pct / 100.0)

            allocated_capital = (sip_amt * 12) + lump_amt
            annual_growth = allocated_capital * (r5 / 100.0)
            total_annual_growth += annual_growth

            recommendations.append({
                "asset_class": asset_cls,
                "bucket": bucket,
                "allocation_pct": weight_pct,
                "allocated_sip": sip_amt,
                "allocated_lumpsum": lump_amt,
                "formatted_sip": f"{format_indian_currency(sip_amt)}/mo",
                "formatted_lumpsum": format_indian_currency(lump_amt),
                "fund_name": fund_name,
                "amfi_code": amfi_code,
                "groww_url": groww_url,
                "returns": {
                    "cagr_3y": r3,
                    "cagr_5y": r5,
                    "cagr_all_time": r_all
                },
                "risk_level": risk_lvl,
                "risk_explanation": risk_exp,
                "goal_impact_role": goal_role,
                "annual_growth_contribution": round(annual_growth, 2),
                "formatted_growth_contribution": f"+ {format_indian_currency(annual_growth)}/yr",
                "advisor_verdict": f"{goal_role} ({r5}% 5Y CAGR)"
            })

        return {
            "risk_mode": risk_mode,
            "total_monthly_sip": monthly_sip,
            "total_lump_sum": lump_sum,
            "portfolio_weighted_5y_cagr": round(weighted_5y_cagr, 2),
            "total_annual_growth": round(total_annual_growth, 2),
            "formatted_total_annual_growth": f"+ {format_indian_currency(total_annual_growth)}/yr",
            "asset_breakdown": recommendations
        }