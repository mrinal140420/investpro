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
    AI Financial Advisor Engine (v6.5) — INDmoney-Style Multi-Asset Global & Commodity FoF Universe
    
    Asset Universe (All via SEBI-registered Direct Mutual Funds & FoF ETFs on Groww):
    • 🇮🇳 Indian Equities: Nifty 50 Index, Nifty Next 50, Tata Small Cap (Sub-₹10k Cr), UTI Momentum 30.
    • 🇺🇸 US Global Equities: Motilal Oswal S&P 500 Index Fund Direct Growth (USD-INR Rupee Hedge + US Tech).
    • 🪙 Precious Metals: Nippon India Silver ETF FoF + HDFC Gold Fund Direct Growth.
    • 🛡️ Sovereign Debt & Liquid Shield: Parag Parikh Liquid Fund Direct Growth (0% Equity).
    """

    def generate_recommendations(
        self,
        monthly_sip: float = 0.0,
        lump_sum: float = 0.0,
        risk_mode: str = "global_multi_asset"
    ) -> Dict[str, Any]:

        if risk_mode == "global_multi_asset" or risk_mode == "aggressive":
            # Flagship INDmoney Multi-Asset Global Barbell Strategy
            alloc_weights = [
                ("Small Cap Alpha (India)", "Accelerator", 25.0, "Tata Small Cap Fund Direct Growth", "145206", "https://groww.in/mutual-funds/tata-small-cap-fund-direct-growth", 24.5, 28.2, 22.4, "Very High", "Primary wealth multiplier in agile sub-₹10k Cr Indian small caps. 28.2% 5Y CAGR.", "Domestic High-Alpha Multiplier"),
                ("US S&P 500 Index FoF (Global)", "Global Anchor", 20.0, "Motilal Oswal S&P 500 Index Fund Direct Growth", "148332", "https://groww.in/mutual-funds/motilal-oswal-sp-500-index-fund-direct-growth", 17.2, 18.6, 18.1, "Moderate-High", "US global market leaders (Apple, Microsoft, Nvidia, Amazon, Alphabet) with INR rupee depreciation hedge.", "Global Geographic Diversification & USD Hedge"),
                ("Momentum 30 Factor ETF (India)", "Accelerator", 20.0, "UTI Nifty 200 Momentum 30 Index Fund", "149363", "https://groww.in/mutual-funds/uti-nifty200-momentum-30-index-fund-direct-growth", 18.5, 21.4, 19.1, "High", "Systematic trend-following factor ETF selecting top 30 momentum stocks in NSE.", "Trend-Following Factor Accelerator"),
                ("Nifty 50 Index Fund (India)", "Anchor", 20.0, "HDFC Nifty 50 Index Fund Direct Growth", "119063", "https://groww.in/mutual-funds/hdfc-nifty-50-index-fund-direct-growth", 15.2, 14.8, 15.1, "Moderate", "Core benchmark index fund capturing India's top 50 conglomerates. Ultra-low 0.20% expense ratio.", "Domestic Core Market Compounder"),
                ("Silver & Gold ETF FoF (Commodity)", "Hedge", 15.0, "Nippon India Silver ETF FoF Direct Growth", "149812", "https://groww.in/mutual-funds/nippon-india-silver-etf-fof-direct-growth", 16.8, 16.5, 15.5, "Moderate", "Precious metals allocation providing real-asset inflation hedge and market crash cushion.", "Inflation Defense & Crisis Shield")
            ]

        elif risk_mode == "ultra_aggressive":
            # Maximum Alpha Global Tech & Small Cap
            alloc_weights = [
                ("Small Cap Alpha (India)", "Accelerator", 35.0, "Tata Small Cap Fund Direct Growth", "145206", "https://groww.in/mutual-funds/tata-small-cap-fund-direct-growth", 24.5, 28.2, 22.4, "Very High", "Maximum compounding alpha in Indian agile manufacturing & infrastructure.", "Primary Alpha Compounder"),
                ("US S&P 500 Index FoF (Global)", "Global Anchor", 25.0, "Motilal Oswal S&P 500 Index Fund Direct Growth", "148332", "https://groww.in/mutual-funds/motilal-oswal-sp-500-index-fund-direct-growth", 17.2, 18.6, 18.1, "Moderate-High", "US global tech monopoly giants with dollar hedge.", "Global Tech Monopoly Allocation"),
                ("Momentum 30 Factor ETF (India)", "Accelerator", 20.0, "UTI Nifty 200 Momentum 30 Index Fund", "149363", "https://groww.in/mutual-funds/uti-nifty200-momentum-30-index-fund-direct-growth", 18.5, 21.4, 19.1, "High", "Factor momentum trend capturer.", "High-Beta Growth Multiplier"),
                ("Nifty Next 50 Index Fund", "Anchor", 10.0, "ICICI Prudential Nifty Next 50 Index Fund", "120716", "https://groww.in/mutual-funds/icici-prudential-nifty-next-50-index-fund-direct-growth", 17.7, 15.8, 16.4, "Moderate-High", "High-growth large-cap disruptors (Rank 51-100).", "Next-Gen Bluechip Booster"),
                ("Silver ETF FoF (Commodity)", "Hedge", 10.0, "Nippon India Silver ETF FoF Direct Growth", "149812", "https://groww.in/mutual-funds/nippon-india-silver-etf-fof-direct-growth", 16.8, 16.5, 15.5, "Moderate", "Industrial demand silver commodity hedge.", "Commodity Real Asset Hedge")
            ]

        else: # All-Weather Balanced (INDmoney Style Ray Dalio Model)
            alloc_weights = [
                ("Nifty 50 Index Fund (India)", "Anchor", 25.0, "HDFC Nifty 50 Index Fund Direct Growth", "119063", "https://groww.in/mutual-funds/hdfc-nifty-50-index-fund-direct-growth", 15.2, 14.8, 15.1, "Low-Moderate", "Core benchmark index fund providing domestic stability.", "Core Domestic Anchor"),
                ("US S&P 500 Index FoF (Global)", "Global Anchor", 20.0, "Motilal Oswal S&P 500 Index Fund Direct Growth", "148332", "https://groww.in/mutual-funds/motilal-oswal-sp-500-index-fund-direct-growth", 17.2, 18.6, 18.1, "Moderate", "US multi-trillion dollar balance sheets.", "Global Large-Cap Anchor"),
                ("Gold ETF Fund of Fund (Precious Metals)", "Hedge", 20.0, "HDFC Gold Fund Direct Growth", "119854", "https://groww.in/mutual-funds/hdfc-gold-fund-direct-growth", 14.8, 14.5, 13.2, "Low-Moderate", "Gold real asset hedge protecting purchasing power against fiat devaluation.", "Crisis & Inflation Shield"),
                ("Liquid Shield / Emergency Reserve", "Debt Shield", 20.0, "Parag Parikh Liquid Fund Direct Growth", "143329", "https://groww.in/mutual-funds/parag-parikh-liquid-fund-direct-growth", 6.8, 6.2, 6.5, "Low", "Sovereign 91-day T-Bills. Zero stock market risk.", "Dry Powder & Liquidity Shield"),
                ("Small Cap Alpha (India)", "Accelerator", 15.0, "Tata Small Cap Fund Direct Growth", "145206", "https://groww.in/mutual-funds/tata-small-cap-fund-direct-growth", 24.5, 28.2, 22.4, "High", "Controlled small-cap exposure for long-term growth.", "Alpha Multiplier")
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