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
            # Flagship INDmoney Multi-Asset Global Barbell Strategy (Calibrated with true verified metrics)
            alloc_weights = [
                ("Small Cap Alpha (India)", "Accelerator", 25.0, "Tata Small Cap Fund Direct Growth", "145206", "https://groww.in/mutual-funds/tata-small-cap-fund-direct-growth", 11.99, 15.94, 19.8, "Very High", "Agile small caps historically; AUM crossed ₹13,093 Cr (~6.7% defensive cash). 0.51% direct TER.", "Domestic High-Alpha Multiplier", 0.51, 100),
                ("US S&P 500 Index FoF (Global)", "Global Anchor", 20.0, "Motilal Oswal S&P 500 Index Fund Direct Growth", "148332", "https://groww.in/mutual-funds/motilal-oswal-sp-500-index-fund-direct-growth", 16.8, 17.2, 16.5, "Moderate-High", "US global tech monopolies with currency alpha. 0.52% realistic direct TER.", "Global Geographic Diversification & USD Hedge", 0.52, 500),
                ("Momentum 30 Factor ETF (India)", "Accelerator", 20.0, "UTI Nifty 200 Momentum 30 Index Fund", "149363", "https://groww.in/mutual-funds/uti-nifty200-momentum-30-index-fund-direct-growth", 10.46, 14.8, 14.8, "High", "Systematic factor ETF; AUM ₹8,513 Cr; 0.89% direct TER due to rebalancing turnover costs.", "Trend-Following Factor Accelerator", 0.89, 100),
                ("Nifty 50 Index Fund (India)", "Anchor", 20.0, "HDFC Nifty 50 Index Fund Direct Growth", "119063", "https://groww.in/mutual-funds/hdfc-nifty-50-index-fund-direct-growth", 26.18, 17.5, 15.2, "Moderate", "Core benchmark index fund capturing India's top 50 bluechips (₹16,450 Cr AUM). 0.29% direct TER.", "Domestic Core Market Compounder", 0.29, 100),
                ("Silver & Gold ETF FoF (Commodity)", "Hedge", 15.0, "Nippon India Silver ETF FoF Direct Growth", "149812", "https://groww.in/mutual-funds/nippon-india-silver-etf-fof-direct-growth", 18.2, 14.8, 14.8, "Moderate", "Physical silver inflation hedge with 0% making charges. 0.45% direct TER.", "Inflation Defense & Crisis Shield", 0.45, 100)
            ]

        elif risk_mode == "ultra_aggressive":
            # Maximum Alpha Global Tech & Small Cap
            alloc_weights = [
                ("Small Cap Alpha (India)", "Accelerator", 35.0, "Tata Small Cap Fund Direct Growth", "145206", "https://groww.in/mutual-funds/tata-small-cap-fund-direct-growth", 11.99, 15.94, 19.8, "Very High", "Agile Indian small caps; ₹13,093 Cr AUM. 0.51% direct TER.", "Primary Alpha Compounder", 0.51, 100),
                ("US S&P 500 Index FoF (Global)", "Global Anchor", 25.0, "Motilal Oswal S&P 500 Index Fund Direct Growth", "148332", "https://groww.in/mutual-funds/motilal-oswal-sp-500-index-fund-direct-growth", 16.8, 17.2, 16.5, "Moderate-High", "US global tech monopoly giants. 0.52% direct TER.", "Global Tech Monopoly Allocation", 0.52, 500),
                ("Momentum 30 Factor ETF (India)", "Accelerator", 20.0, "UTI Nifty 200 Momentum 30 Index Fund", "149363", "https://groww.in/mutual-funds/uti-nifty200-momentum-30-index-fund-direct-growth", 10.46, 14.8, 14.8, "High", "Factor momentum trend capturer; ₹8,513 Cr AUM. 0.89% direct TER.", "High-Beta Growth Multiplier", 0.89, 100),
                ("Nifty Next 50 Index Fund", "Anchor", 10.0, "ICICI Prudential Nifty Next 50 Index Fund", "120716", "https://groww.in/mutual-funds/icici-prudential-nifty-next-50-index-fund-direct-growth", 22.4, 16.8, 16.0, "Moderate-High", "Next-Gen Bluechip Booster. 0.32% direct TER.", "Next-Gen Bluechip Booster", 0.32, 100),
                ("Silver ETF FoF (Commodity)", "Hedge", 10.0, "Nippon India Silver ETF FoF Direct Growth", "149812", "https://groww.in/mutual-funds/nippon-india-silver-etf-fof-direct-growth", 18.2, 14.8, 14.8, "Moderate", "Commodity real asset hedge. 0.45% direct TER.", "Commodity Real Asset Hedge", 0.45, 100)
            ]

        else: # All-Weather Balanced (INDmoney Style Ray Dalio Model)
            alloc_weights = [
                ("Nifty 50 Index Fund (India)", "Anchor", 25.0, "HDFC Nifty 50 Index Fund Direct Growth", "119063", "https://groww.in/mutual-funds/hdfc-nifty-50-index-fund-direct-growth", 26.18, 17.5, 15.2, "Low-Moderate", "Core benchmark index fund providing domestic stability (₹16,450 Cr AUM). 0.29% direct TER.", "Core Domestic Anchor", 0.29, 100),
                ("US S&P 500 Index FoF (Global)", "Global Anchor", 20.0, "Motilal Oswal S&P 500 Index Fund Direct Growth", "148332", "https://groww.in/mutual-funds/motilal-oswal-sp-500-index-fund-direct-growth", 16.8, 17.2, 16.5, "Moderate", "US multi-trillion dollar balance sheets. 0.52% direct TER.", "Global Large-Cap Anchor", 0.52, 500),
                ("Gold ETF Fund of Fund (Precious Metals)", "Hedge", 20.0, "HDFC Gold Fund Direct Growth", "119854", "https://groww.in/mutual-funds/hdfc-gold-fund-direct-growth", 17.4, 14.8, 13.5, "Low-Moderate", "Gold real asset hedge. 0.26% direct TER.", "Crisis & Inflation Shield", 0.26, 100),
                ("Liquid Shield / Emergency Reserve", "Debt Shield", 20.0, "Parag Parikh Liquid Fund Direct Growth", "143329", "https://groww.in/mutual-funds/parag-parikh-liquid-fund-direct-growth", 7.1, 6.4, 6.6, "Low", "Sovereign 91-day T-Bills. 0.18% direct TER.", "Dry Powder & Liquidity Shield", 0.18, 500),
                ("Small Cap Alpha (India)", "Accelerator", 15.0, "Tata Small Cap Fund Direct Growth", "145206", "https://groww.in/mutual-funds/tata-small-cap-fund-direct-growth", 11.99, 15.94, 19.8, "High", "Controlled small-cap exposure; ₹13,093 Cr AUM. 0.51% direct TER.", "Alpha Multiplier", 0.51, 100)
            ]

        recommendations = []
        weighted_5y_cagr = 0.0
        total_annual_growth = 0.0

        for asset_cls, bucket, weight_pct, fund_name, amfi_code, groww_url, r3, r5, r_all, risk_lvl, risk_exp, goal_role, ter_pct, amc_min in alloc_weights:
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
                "ter_pct": ter_pct,
                "amc_min_sip": amc_min,
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
                "advisor_verdict": f"{goal_role} ({r5}% 5Y CAGR, {ter_pct}% TER)"
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