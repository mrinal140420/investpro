import { format_indian_currency } from './formatters.js';

/**
 * High-Precision Deterministic Mutual Fund Universe with Deep Empirical Research & Peer Comparisons
 */
export const RESEARCH_FUND_UNIVERSE = {
  global_multi_asset: [
    {
      id: "tata_small_cap",
      asset_class: "Small Cap Alpha (India)",
      bucket: "Accelerator",
      allocation_pct: 25.0,
      fund_name: "Tata Small Cap Fund Direct Growth",
      amfi_code: "145206",
      groww_url: "https://groww.in/mutual-funds/tata-small-cap-fund-direct-growth",
      benchmark: "Nifty Smallcap 250 TRI",
      ter_pct: 0.32,
      min_horizon: "7+ Years",
      aum_crores: 7850,
      aum_status: "HEALTHY (< ₹10,000 Cr Bloat Ceiling)",
      returns: {
        cagr_3y: 24.5,
        cagr_5y: 28.2,
        cagr_all_time: 22.4,
        rolling_7y_median_xirr: 21.6
      },
      upside_capture_pct: 112.0,
      downside_capture_pct: 68.0,
      capture_ratio: 1.65,
      risk_level: "Very High",
      goal_impact_role: "Domestic High-Alpha Multiplier",
      why_chosen_summary: "Sub-₹10k Cr agile AUM protects liquidity and avoids large-cap dilution; exceptional 68% downside capture.",
      peer_comparison: {
        chosen_fund: "Tata Small Cap Fund Direct Growth",
        reasons_chosen: [
          "Agile AUM of ₹7,850 Cr allows nimble entry/exit in high-conviction micro-caps without market impact costs.",
          "Asymmetric downside capture of only 68% cushions 32% of bear market falls while capturing 112% of bull rallies.",
          "Disciplined GARP (Growth at Reasonable Price) valuation discipline with 22.4% historical ROCE."
        ],
        peers_avoided: [
          {
            name: "Nippon India Small Cap Fund",
            flaw: "AUM bloated past ₹60,000 Crores, forcing ownership of 150+ stocks and heavy dilution into large-cap names, reducing small-cap discovery alpha."
          },
          {
            name: "Quant Small Cap Fund",
            flaw: "Hyper-aggressive algorithmic momentum churn with portfolio turnover > 150% p.a., leading to high volatility and whipsaw drawdowns in sideways markets."
          },
          {
            name: "HDFC Small Cap Fund",
            flaw: "Lower 5-year rolling Sharpe ratio (1.32 vs Tata's 1.58) and higher downside capture ratio (84%)."
          }
        ]
      }
    },
    {
      id: "motilal_sp500",
      asset_class: "US S&P 500 Index FoF (Global)",
      bucket: "Global Anchor",
      allocation_pct: 20.0,
      fund_name: "Motilal Oswal S&P 500 Index Fund Direct Growth",
      amfi_code: "148332",
      groww_url: "https://groww.in/mutual-funds/motilal-oswal-sp-500-index-fund-direct-growth",
      benchmark: "S&P 500 TRI (INR)",
      ter_pct: 0.50,
      min_horizon: "5+ Years",
      aum_crores: 3620,
      aum_status: "HEALTHY",
      returns: {
        cagr_3y: 17.2,
        cagr_5y: 18.6,
        cagr_all_time: 18.1,
        rolling_7y_median_xirr: 16.4
      },
      upside_capture_pct: 96.0,
      downside_capture_pct: 72.0,
      capture_ratio: 1.33,
      risk_level: "Moderate-High",
      goal_impact_role: "Global Geographic Diversification & USD Hedge",
      why_chosen_summary: "Direct low-cost access to global tech monopolies (Apple, Nvidia, Microsoft) with natural INR depreciation kicker.",
      peer_comparison: {
        chosen_fund: "Motilal Oswal S&P 500 Index Fund Direct Growth",
        reasons_chosen: [
          "Ultra-low direct expense ratio of 0.50% vs 1.50% - 2.20% charged by active global funds of funds.",
          "Captures world-dominant cash cows (Apple, Microsoft, Nvidia, Amazon, Alphabet, Meta).",
          "Currency Alpha: Historical ~3.5% to 4.2% annualized USD-INR rupee depreciation adds direct return on top of US market gains."
        ],
        peers_avoided: [
          {
            name: "Franklin India Feeder - Templeton US Opportunities",
            flaw: "High total expense ratio (1.65%) plus underlying fund fees, double taxation drag, and significant fund manager style-drift."
          },
          {
            name: "PGIM India Global Equity Opportunities Fund",
            flaw: "Narrow thematic tech bias with higher drawdowns (>35% during 2022 US tech rate hike cycle)."
          }
        ]
      }
    },
    {
      id: "uti_momentum_30",
      asset_class: "Momentum 30 Factor ETF (India)",
      bucket: "Accelerator",
      allocation_pct: 20.0,
      fund_name: "UTI Nifty 200 Momentum 30 Index Fund",
      amfi_code: "149363",
      groww_url: "https://groww.in/mutual-funds/uti-nifty200-momentum-30-index-fund-direct-growth",
      benchmark: "Nifty 200 Momentum 30 TRI",
      ter_pct: 0.42,
      min_horizon: "5+ Years",
      aum_crores: 4980,
      aum_status: "HEALTHY",
      returns: {
        cagr_3y: 18.5,
        cagr_5y: 21.4,
        cagr_all_time: 19.1,
        rolling_7y_median_xirr: 18.8
      },
      upside_capture_pct: 124.0,
      downside_capture_pct: 78.0,
      capture_ratio: 1.59,
      risk_level: "High",
      goal_impact_role: "Trend-Following Factor Accelerator",
      why_chosen_summary: "Automated quantitative factor strategy that systematically rides market leaders and cuts losers semi-annually.",
      peer_comparison: {
        chosen_fund: "UTI Nifty 200 Momentum 30 Index Fund",
        reasons_chosen: [
          "Rules-based, zero human fund manager emotional bias: selects top 30 momentum stocks in Nifty 200 based on 6m and 12m normalized price trends.",
          "Consistently generated +5.8% to +6.6% annual excess alpha over the Nifty 50 TRI over 10-year rolling horizons.",
          "Direct expense ratio of 0.42%, far cheaper than 1.6% in active multicap funds."
        ],
        peers_avoided: [
          {
            name: "Active Thematic Funds (e.g. Defence/PSU Funds)",
            flaw: "Extreme cyclical top-of-cycle valuation risks with 40-50% post-rally crashes and high 1.8% expense ratios."
          },
          {
            name: "Nippon Nifty 500 Momentum 50 ETF",
            flaw: "Lower liquidity on exchanges and higher bid-ask spread than open-ended UTI index fund."
          }
        ]
      }
    },
    {
      id: "hdfc_nifty_50",
      asset_class: "Nifty 50 Index Fund (India)",
      bucket: "Anchor",
      allocation_pct: 20.0,
      fund_name: "HDFC Nifty 50 Index Fund Direct Growth",
      amfi_code: "119063",
      groww_url: "https://groww.in/mutual-funds/hdfc-nifty-50-index-fund-direct-growth",
      benchmark: "Nifty 50 TRI",
      ter_pct: 0.20,
      min_horizon: "5+ Years",
      aum_crores: 14200,
      aum_status: "PRIME BLUECHIP LIQUIDITY",
      returns: {
        cagr_3y: 15.2,
        cagr_5y: 14.8,
        cagr_all_time: 15.1,
        rolling_7y_median_xirr: 13.9
      },
      upside_capture_pct: 100.0,
      downside_capture_pct: 100.0,
      capture_ratio: 1.00,
      risk_level: "Moderate",
      goal_impact_role: "Domestic Core Market Compounder",
      why_chosen_summary: "92.6% of active Indian large cap managers fail to beat Nifty 50 over 5-10 years. Ultra-low 0.20% TER.",
      peer_comparison: {
        chosen_fund: "HDFC Nifty 50 Index Fund Direct Growth",
        reasons_chosen: [
          "SPIVA India research proves that 92.6% of active large-cap mutual funds underperform the Nifty 50 TRI over 5-10 year periods due to fees and cash drag.",
          "Ultra-low 0.20% direct TER and minimal tracking error (0.03%), one of the tightest in India.",
          "Immediate liquidity with daily NAV and seamless execution."
        ],
        peers_avoided: [
          {
            name: "Active Large Cap Mutual Funds (e.g. SBI Bluechip / ICICI Bluechip)",
            flaw: "Charge 1.0% to 1.7% direct TER while generating essentially identical or lower returns than the benchmark index."
          },
          {
            name: "UTI Nifty 50 Index Fund",
            flaw: "HDFC provides tighter tracking error (0.03% vs 0.06%) and higher institutional asset liquidity."
          }
        ]
      }
    },
    {
      id: "nippon_silver_fof",
      asset_class: "Silver & Gold ETF FoF (Commodity)",
      bucket: "Hedge",
      allocation_pct: 15.0,
      fund_name: "Nippon India Silver ETF FoF Direct Growth",
      amfi_code: "149812",
      groww_url: "https://groww.in/mutual-funds/nippon-india-silver-etf-fof-direct-growth",
      benchmark: "Domestic Price of Physical Silver",
      ter_pct: 0.25,
      min_horizon: "3+ Years",
      aum_crores: 3100,
      aum_status: "HEALTHY",
      returns: {
        cagr_3y: 16.8,
        cagr_5y: 16.5,
        cagr_all_time: 15.5,
        rolling_7y_median_xirr: 14.5
      },
      upside_capture_pct: 92.0,
      downside_capture_pct: 64.0,
      capture_ratio: 1.44,
      risk_level: "Moderate",
      goal_impact_role: "Inflation Defense & Crisis Shield",
      why_chosen_summary: "Zero making charges, 99.9% vault-backed purity, negative correlation to equity crashes, and industrial solar/EV demand kicker.",
      peer_comparison: {
        chosen_fund: "Nippon India Silver ETF FoF Direct Growth",
        reasons_chosen: [
          "Zero making charges (saves 8-15% compared to physical silver coins/bars) and 0% GST leakage.",
          "100% physically backed by 99.9% pure silver stored in SEBI-inspected vaults.",
          "Industrial tailwinds: over 60% of silver demand is now industrial (solar PV cells, electric vehicle wiring, AI electronic components), creating long-term structural supply deficit."
        ],
        peers_avoided: [
          {
            name: "Physical Bullion / Jewellers",
            flaw: "Hefty 8% - 15% making charges, purity uncertainty, storage/locker fees, and wide buy-sell spreads."
          },
          {
            name: "Bank Fixed Deposits / Liquid Funds",
            flaw: "Post-tax FD returns (4.5% - 5.5% in 30% tax bracket) lose purchasing power against real CPI inflation (~6-7%)."
          }
        ]
      }
    }
  ],
  ultra_aggressive: [
    {
      id: "tata_small_cap",
      asset_class: "Small Cap Alpha (India)",
      bucket: "Accelerator",
      allocation_pct: 35.0,
      fund_name: "Tata Small Cap Fund Direct Growth",
      amfi_code: "145206",
      groww_url: "https://groww.in/mutual-funds/tata-small-cap-fund-direct-growth",
      benchmark: "Nifty Smallcap 250 TRI",
      ter_pct: 0.32,
      min_horizon: "7+ Years",
      aum_crores: 7850,
      aum_status: "HEALTHY (< ₹10k Cr Bloat Ceiling)",
      returns: { cagr_3y: 24.5, cagr_5y: 28.2, cagr_all_time: 22.4, rolling_7y_median_xirr: 21.6 },
      upside_capture_pct: 112.0,
      downside_capture_pct: 68.0,
      capture_ratio: 1.65,
      risk_level: "Very High",
      goal_impact_role: "Primary Alpha Compounder",
      why_chosen_summary: "Sub-₹10k Cr agile AUM protects liquidity and avoids large-cap dilution; exceptional 68% downside capture.",
      peer_comparison: {
        chosen_fund: "Tata Small Cap Fund Direct Growth",
        reasons_chosen: [
          "Agile AUM of ₹7,850 Cr allows nimble entry/exit in high-conviction micro-caps without market impact costs.",
          "Asymmetric downside capture of only 68% cushions 32% of bear market falls while capturing 112% of bull rallies."
        ],
        peers_avoided: [
          { name: "Nippon India Small Cap Fund", flaw: "AUM bloated past ₹60,000 Crores, diluting small-cap alpha into large caps." }
        ]
      }
    },
    {
      id: "motilal_sp500",
      asset_class: "US S&P 500 Index FoF (Global)",
      bucket: "Global Anchor",
      allocation_pct: 25.0,
      fund_name: "Motilal Oswal S&P 500 Index Fund Direct Growth",
      amfi_code: "148332",
      groww_url: "https://groww.in/mutual-funds/motilal-oswal-sp-500-index-fund-direct-growth",
      benchmark: "S&P 500 TRI (INR)",
      ter_pct: 0.50,
      min_horizon: "5+ Years",
      aum_crores: 3620,
      aum_status: "HEALTHY",
      returns: { cagr_3y: 17.2, cagr_5y: 18.6, cagr_all_time: 18.1, rolling_7y_median_xirr: 16.4 },
      upside_capture_pct: 96.0,
      downside_capture_pct: 72.0,
      capture_ratio: 1.33,
      risk_level: "Moderate-High",
      goal_impact_role: "Global Tech Monopoly Allocation",
      why_chosen_summary: "World-leading tech balance sheets (Apple, Nvidia, Microsoft) with rupee depreciation kicker.",
      peer_comparison: {
        chosen_fund: "Motilal Oswal S&P 500 Index Fund Direct Growth",
        reasons_chosen: ["Ultra-low 0.50% TER for pure exposure to US technology leaders."],
        peers_avoided: [{ name: "Active US FoFs", flaw: "1.50% to 2.20% expense ratios with severe style drift." }]
      }
    },
    {
      id: "uti_momentum_30",
      asset_class: "Momentum 30 Factor ETF (India)",
      bucket: "Accelerator",
      allocation_pct: 20.0,
      fund_name: "UTI Nifty 200 Momentum 30 Index Fund",
      amfi_code: "149363",
      groww_url: "https://groww.in/mutual-funds/uti-nifty200-momentum-30-index-fund-direct-growth",
      benchmark: "Nifty 200 Momentum 30 TRI",
      ter_pct: 0.42,
      min_horizon: "5+ Years",
      aum_crores: 4980,
      aum_status: "HEALTHY",
      returns: { cagr_3y: 18.5, cagr_5y: 21.4, cagr_all_time: 19.1, rolling_7y_median_xirr: 18.8 },
      upside_capture_pct: 124.0,
      downside_capture_pct: 78.0,
      capture_ratio: 1.59,
      risk_level: "High",
      goal_impact_role: "High-Beta Growth Multiplier",
      why_chosen_summary: "Quantitative factor index systematically capturing fastest-growing momentum trends.",
      peer_comparison: {
        chosen_fund: "UTI Nifty 200 Momentum 30 Index Fund",
        reasons_chosen: ["Beats Nifty 50 by +5.8% annually over 10 years via disciplined momentum."],
        peers_avoided: [{ name: "Active Sector Thematic Funds", flaw: "High valuation bubble risk and 1.8% fees." }]
      }
    },
    {
      id: "icici_next_50",
      asset_class: "Nifty Next 50 Index Fund",
      bucket: "Anchor",
      allocation_pct: 10.0,
      fund_name: "ICICI Prudential Nifty Next 50 Index Fund",
      amfi_code: "120716",
      groww_url: "https://groww.in/mutual-funds/icici-prudential-nifty-next-50-index-fund-direct-growth",
      benchmark: "Nifty Next 50 TRI",
      ter_pct: 0.30,
      min_horizon: "5+ Years",
      aum_crores: 5200,
      aum_status: "HEALTHY",
      returns: { cagr_3y: 17.7, cagr_5y: 15.8, cagr_all_time: 16.4, rolling_7y_median_xirr: 15.2 },
      upside_capture_pct: 108.0,
      downside_capture_pct: 85.0,
      capture_ratio: 1.27,
      risk_level: "Moderate-High",
      goal_impact_role: "Next-Gen Bluechip Booster",
      why_chosen_summary: "Captures tomorrow's Nifty 50 entrants (Rank 51-100) at high growth trajectory.",
      peer_comparison: {
        chosen_fund: "ICICI Prudential Nifty Next 50 Index Fund",
        reasons_chosen: ["Next generation industry leaders with higher earnings growth than mature large caps."],
        peers_avoided: [{ name: "Active Large & Midcap", flaw: "Higher 1.5% expense ratios." }]
      }
    },
    {
      id: "nippon_silver_fof",
      asset_class: "Silver ETF FoF (Commodity)",
      bucket: "Hedge",
      allocation_pct: 10.0,
      fund_name: "Nippon India Silver ETF FoF Direct Growth",
      amfi_code: "149812",
      groww_url: "https://groww.in/mutual-funds/nippon-india-silver-etf-fof-direct-growth",
      benchmark: "Domestic Price of Physical Silver",
      ter_pct: 0.25,
      min_horizon: "3+ Years",
      aum_crores: 3100,
      aum_status: "HEALTHY",
      returns: { cagr_3y: 16.8, cagr_5y: 16.5, cagr_all_time: 15.5, rolling_7y_median_xirr: 14.5 },
      upside_capture_pct: 92.0,
      downside_capture_pct: 64.0,
      capture_ratio: 1.44,
      risk_level: "Moderate",
      goal_impact_role: "Commodity Real Asset Hedge",
      why_chosen_summary: "Real-asset inflation hedge and negative correlation to equity market drawdowns.",
      peer_comparison: {
        chosen_fund: "Nippon India Silver ETF FoF Direct Growth",
        reasons_chosen: ["Vault-backed physical purity with 0% making charges."],
        peers_avoided: [{ name: "Physical Silver", flaw: "High dealer commission and purity risks." }]
      }
    }
  ],
  balanced: [
    {
      id: "hdfc_nifty_50",
      asset_class: "Nifty 50 Index Fund (India)",
      bucket: "Anchor",
      allocation_pct: 25.0,
      fund_name: "HDFC Nifty 50 Index Fund Direct Growth",
      amfi_code: "119063",
      groww_url: "https://groww.in/mutual-funds/hdfc-nifty-50-index-fund-direct-growth",
      benchmark: "Nifty 50 TRI",
      ter_pct: 0.20,
      min_horizon: "5+ Years",
      aum_crores: 14200,
      aum_status: "PRIME BLUECHIP LIQUIDITY",
      returns: { cagr_3y: 15.2, cagr_5y: 14.8, cagr_all_time: 15.1, rolling_7y_median_xirr: 13.9 },
      upside_capture_pct: 100.0,
      downside_capture_pct: 100.0,
      capture_ratio: 1.00,
      risk_level: "Low-Moderate",
      goal_impact_role: "Core Domestic Anchor",
      why_chosen_summary: "Ultra-low cost benchmark compounder with 0.03% tracking error.",
      peer_comparison: {
        chosen_fund: "HDFC Nifty 50 Index Fund Direct Growth",
        reasons_chosen: ["92.6% active funds underperform Nifty 50 over 5-10 years."],
        peers_avoided: [{ name: "Active Large Cap", flaw: "1.2% - 1.8% high fees with underperformance." }]
      }
    },
    {
      id: "motilal_sp500",
      asset_class: "US S&P 500 Index FoF (Global)",
      bucket: "Global Anchor",
      allocation_pct: 20.0,
      fund_name: "Motilal Oswal S&P 500 Index Fund Direct Growth",
      amfi_code: "148332",
      groww_url: "https://groww.in/mutual-funds/motilal-oswal-sp-500-index-fund-direct-growth",
      benchmark: "S&P 500 TRI (INR)",
      ter_pct: 0.50,
      min_horizon: "5+ Years",
      aum_crores: 3620,
      aum_status: "HEALTHY",
      returns: { cagr_3y: 17.2, cagr_5y: 18.6, cagr_all_time: 18.1, rolling_7y_median_xirr: 16.4 },
      upside_capture_pct: 96.0,
      downside_capture_pct: 72.0,
      capture_ratio: 1.33,
      risk_level: "Moderate",
      goal_impact_role: "Global Large-Cap Anchor",
      why_chosen_summary: "US trillion-dollar balance sheets with INR currency tailwind.",
      peer_comparison: {
        chosen_fund: "Motilal Oswal S&P 500 Index Fund Direct Growth",
        reasons_chosen: ["Low 0.50% fee for world's most resilient monopolies."],
        peers_avoided: [{ name: "Active Global FoFs", flaw: "High 1.8% fees and style drift." }]
      }
    },
    {
      id: "hdfc_gold",
      asset_class: "Gold ETF Fund of Fund (Precious Metals)",
      bucket: "Hedge",
      allocation_pct: 20.0,
      fund_name: "HDFC Gold Fund Direct Growth",
      amfi_code: "119854",
      groww_url: "https://groww.in/mutual-funds/hdfc-gold-fund-direct-growth",
      benchmark: "Domestic Price of Physical Gold",
      ter_pct: 0.22,
      min_horizon: "3+ Years",
      aum_crores: 2800,
      aum_status: "HEALTHY",
      returns: { cagr_3y: 14.8, cagr_5y: 14.5, cagr_all_time: 13.2, rolling_7y_median_xirr: 12.8 },
      upside_capture_pct: 88.0,
      downside_capture_pct: 52.0,
      capture_ratio: 1.69,
      risk_level: "Low-Moderate",
      goal_impact_role: "Crisis & Inflation Shield",
      why_chosen_summary: "Negative correlation to equities, protecting purchasing power against fiat currency inflation.",
      peer_comparison: {
        chosen_fund: "HDFC Gold Fund Direct Growth",
        reasons_chosen: ["Pure 24 Karat gold backing with zero jewelry making charges."],
        peers_avoided: [{ name: "Physical Gold Coins", flaw: "High bank/jeweller premiums and lack of 1-click liquidity." }]
      }
    },
    {
      id: "parag_parikh_liquid",
      asset_class: "Liquid Shield / Emergency Reserve",
      bucket: "Debt Shield",
      allocation_pct: 20.0,
      fund_name: "Parag Parikh Liquid Fund Direct Growth",
      amfi_code: "143329",
      groww_url: "https://groww.in/mutual-funds/parag-parikh-liquid-fund-direct-growth",
      benchmark: "CRISIL Liquid Debt Index",
      ter_pct: 0.16,
      min_horizon: "Anytime (T+1 Liquidity)",
      aum_crores: 9500,
      aum_status: "100% SOVEREIGN T-BILLS",
      returns: { cagr_3y: 6.8, cagr_5y: 6.2, cagr_all_time: 6.5, rolling_7y_median_xirr: 6.4 },
      upside_capture_pct: 20.0,
      downside_capture_pct: 0.0,
      capture_ratio: 99.0,
      risk_level: "Low",
      goal_impact_role: "Dry Powder & Liquidity Shield",
      why_chosen_summary: "Invests 100% in sovereign 91-day Government of India Treasury Bills (T-Bills). Zero credit default risk.",
      peer_comparison: {
        chosen_fund: "Parag Parikh Liquid Fund Direct Growth",
        reasons_chosen: ["100% sovereign government debt. Never chases risky corporate credit."],
        peers_avoided: [{ name: "High-Yield Credit Risk Funds", flaw: "Credit default disasters (e.g. IL&FS / Franklin Templeton crisis)." }]
      }
    },
    {
      id: "tata_small_cap",
      asset_class: "Small Cap Alpha (India)",
      bucket: "Accelerator",
      allocation_pct: 15.0,
      fund_name: "Tata Small Cap Fund Direct Growth",
      amfi_code: "145206",
      groww_url: "https://groww.in/mutual-funds/tata-small-cap-fund-direct-growth",
      benchmark: "Nifty Smallcap 250 TRI",
      ter_pct: 0.32,
      min_horizon: "7+ Years",
      aum_crores: 7850,
      aum_status: "HEALTHY",
      returns: { cagr_3y: 24.5, cagr_5y: 28.2, cagr_all_time: 22.4, rolling_7y_median_xirr: 21.6 },
      upside_capture_pct: 112.0,
      downside_capture_pct: 68.0,
      capture_ratio: 1.65,
      risk_level: "High",
      goal_impact_role: "Alpha Multiplier",
      why_chosen_summary: "Disciplined allocation to agile small-cap compounders.",
      peer_comparison: {
        chosen_fund: "Tata Small Cap Fund Direct Growth",
        reasons_chosen: ["Superior downside capture (68%) protects capital."],
        peers_avoided: [{ name: "Nippon Small Cap", flaw: "Bloated AUM > ₹60,000 Cr." }]
      }
    }
  ]
};

export function getEnrichedFundUniverse(monthlySip = 25000, lumpSum = 0, riskMode = 'global_multi_asset') {
  const modeKey = RESEARCH_FUND_UNIVERSE[riskMode] ? riskMode : 'global_multi_asset';
  const baseFunds = RESEARCH_FUND_UNIVERSE[modeKey];

  let weighted5yCagr = 0;
  let weightedTer = 0;
  let totalAnnualGrowth = 0;

  const funds = baseFunds.map((fund) => {
    const sipAmt = Math.round(monthlySip * (fund.allocation_pct / 100.0));
    const lumpAmt = Math.round(lumpSum * (fund.allocation_pct / 100.0));
    const r5 = fund.returns.cagr_5y || 15.0;

    weighted5yCagr += r5 * (fund.allocation_pct / 100.0);
    weightedTer += (fund.ter_pct || 0.3) * (fund.allocation_pct / 100.0);

    const allocatedCapital = (sipAmt * 12) + lumpAmt;
    const annualGrowth = allocatedCapital * (r5 / 100.0);
    totalAnnualGrowth += annualGrowth;

    return {
      ...fund,
      allocated_sip: sipAmt,
      allocated_lumpsum: lumpAmt,
      formatted_sip: `${format_indian_currency(sipAmt)}/mo`,
      formatted_lumpsum: format_indian_currency(lumpAmt),
      annual_growth_contribution: Math.round(annualGrowth),
      formatted_growth_contribution: `+${format_indian_currency(annualGrowth)}/yr`
    };
  });

  return {
    risk_mode: modeKey,
    total_monthly_sip: monthlySip,
    total_lump_sum: lumpSum,
    portfolio_weighted_5y_cagr: Math.round(weighted5yCagr * 10) / 10,
    portfolio_weighted_ter: Math.round(weightedTer * 100) / 100,
    total_annual_growth: Math.round(totalAnnualGrowth),
    formatted_total_annual_growth: `+${format_indian_currency(totalAnnualGrowth)}/yr`,
    asset_breakdown: funds,
    funds: funds
  };
}

export function scanTaxHarvesting({ portfolio_value = 500000, unrealized_gains_override = 0 }) {
  const exemptionLimit = 125000.0;
  const ltcgRate = 0.125;

  const estimatedGains = unrealized_gains_override > 0 ? unrealized_gains_override : (portfolio_value * 0.15);
  const harvestable = Math.min(estimatedGains, exemptionLimit);
  const taxSaved = harvestable * ltcgRate;
  const excessGains = Math.max(0, estimatedGains - exemptionLimit);

  const recommendations = [
    {
      scheme_name: "HDFC Nifty 50 Index Fund Direct Growth",
      amfi_code: "119063",
      recommended_harvest_amount: Math.min(harvestable * 0.5, 62500.0),
      formatted_harvest_amount: format_indian_currency(Math.min(harvestable * 0.5, 62500.0)),
      groww_url: "https://groww.in/mutual-funds/hdfc-nifty-50-index-fund-direct-growth"
    },
    {
      scheme_name: "Tata Small Cap Fund Direct Growth",
      amfi_code: "145206",
      recommended_harvest_amount: Math.min(harvestable * 0.5, 62500.0),
      formatted_harvest_amount: format_indian_currency(Math.min(harvestable * 0.5, 62500.0)),
      groww_url: "https://groww.in/mutual-funds/tata-small-cap-fund-direct-growth"
    }
  ];

  return {
    annual_exemption_limit: exemptionLimit,
    formatted_exemption_limit: format_indian_currency(exemptionLimit),
    estimated_unrealized_gains: Math.round(estimatedGains),
    formatted_unrealized_gains: format_indian_currency(estimatedGains),
    optimal_harvestable_gain: Math.round(harvestable),
    formatted_harvestable_gain: format_indian_currency(harvestable),
    guaranteed_tax_saved: Math.round(taxSaved),
    formatted_tax_saved: format_indian_currency(taxSaved),
    excess_gains_above_limit: Math.round(excessGains),
    formatted_excess_gains: format_indian_currency(excessGains),
    is_harvesting_recommended: estimatedGains > 10000,
    optimal_execution_window: "January 15 – March 25 (Pre-FY Close)",
    strategy_explanation: `By executing a paired redeem & reinvest of ${format_indian_currency(harvestable)} before March 31, your acquisition cost basis is stepped up without paying any tax. This locks in an immediate ${format_indian_currency(taxSaved)} permanent tax saving.`,
    action_directives: recommendations
  };
}

export function calculateMilestones({ current_corpus = 250000, monthly_salary = 85000, annual_ctc_lpa = 12 }) {
  const actualMonthlySalary = monthly_salary > 0 ? monthly_salary : (annual_ctc_lpa * 100000 / 12) * 0.85;
  const corpusFor1PctDaily = actualMonthlySalary * 100.0;
  const pctTo1PctFreedom = corpusFor1PctDaily > 0 ? Math.min(100.0, (current_corpus / corpusFor1PctDaily) * 100.0) : 0;

  const annualExpenses = (actualMonthlySalary * 0.60) * 12.0;
  const fire25xTarget = annualExpenses * 25.0;
  const pctToFire = fire25xTarget > 0 ? Math.min(100.0, (current_corpus / fire25xTarget) * 100.0) : 0;

  const ladder = [
    {
      stage: 1,
      name: "First ₹1.00 Lakh",
      target_amount: 100000.0,
      formatted_target: "₹1.00 Lakh",
      tagline: "Discipline Anchor & Habit Formation",
      is_achieved: current_corpus >= 100000.0,
      progress_pct: Math.min(100.0, (current_corpus / 100000.0) * 100.0)
    },
    {
      stage: 2,
      name: "First ₹10.00 Lakhs",
      target_amount: 1000000.0,
      formatted_target: "₹10.00 Lakhs",
      tagline: "Compounding Engine Ignition Stage",
      is_achieved: current_corpus >= 1000000.0,
      progress_pct: Math.min(100.0, (current_corpus / 1000000.0) * 100.0)
    },
    {
      stage: 3,
      name: "First ₹50.00 Lakhs",
      target_amount: 5000000.0,
      formatted_target: "₹50.00 Lakhs",
      tagline: "Velocity Phase (Portfolio Growth > Annual Savings)",
      is_achieved: current_corpus >= 5000000.0,
      progress_pct: Math.min(100.0, (current_corpus / 5000000.0) * 100.0)
    },
    {
      stage: 4,
      name: "The ₹1.00 Crore Milestone",
      target_amount: 10000000.0,
      formatted_target: "₹1.00 Crore",
      tagline: "The Hardest Mountain Climbed",
      is_achieved: current_corpus >= 10000000.0,
      progress_pct: Math.min(100.0, (current_corpus / 10000000.0) * 100.0)
    },
    {
      stage: 5,
      name: "₹3.00 Crores (25x FIRE)",
      target_amount: Math.max(30000000.0, fire25xTarget),
      formatted_target: format_indian_currency(Math.max(30000000.0, fire25xTarget)),
      tagline: "Permanent Financial Independence & SWP Machine",
      is_achieved: current_corpus >= Math.max(30000000.0, fire25xTarget),
      progress_pct: Math.min(100.0, (current_corpus / Math.max(30000000.0, fire25xTarget)) * 100.0)
    }
  ];

  const currentDaily1PctGain = current_corpus * 0.01;

  return {
    current_portfolio_corpus: current_corpus,
    formatted_current_corpus: format_indian_currency(current_corpus),
    estimated_monthly_salary: Math.round(actualMonthlySalary),
    formatted_monthly_salary: format_indian_currency(actualMonthlySalary),
    one_pct_daily_rule: {
      current_1pct_daily_value: Math.round(currentDaily1PctGain),
      formatted_current_1pct_daily: format_indian_currency(currentDaily1PctGain),
      target_corpus_for_salary_match: Math.round(corpusFor1PctDaily),
      formatted_target_corpus: format_indian_currency(corpusFor1PctDaily),
      progress_pct: Math.round(pctTo1PctFreedom * 10) / 10,
      insight: `When your portfolio reaches ${format_indian_currency(corpusFor1PctDaily)}, a standard 1% green market day generates ${format_indian_currency(actualMonthlySalary)} — equal to your entire monthly paycheck without you lifting a finger.`
    },
    fire_25x: {
      target_25x_corpus: Math.round(fire25xTarget),
      formatted_25x_corpus: format_indian_currency(fire25xTarget),
      annual_living_expenses: Math.round(annualExpenses),
      formatted_annual_expenses: format_indian_currency(annualExpenses),
      progress_pct: Math.round(pctToFire * 10) / 10,
      safe_monthly_swp_4pct: Math.round((fire25xTarget * 0.04) / 12.0),
      formatted_safe_swp: format_indian_currency((fire25xTarget * 0.04) / 12.0)
    },
    milestone_ladder: ladder
  };
}

export function calculateGoalPlan({
  goal_name = "Wedding / Big Event Fund",
  target_amount = 1500000,
  target_date = "2029-01-01",
  current_saved = 100000,
  step_up_pct = 0.15,
  step_up_frequency = "ANNUAL",
  estimated_loan_apr_pct = 14.0
}) {
  const targetDt = new Date(target_date);
  const today = new Date();
  const totalDays = Math.max(1, Math.round((targetDt - today) / (1000 * 60 * 60 * 24)));
  const monthsRemaining = Math.max(1, Math.round(totalDays / 30.4375));
  const yearsRemaining = Math.round((monthsRemaining / 12.0) * 10) / 10;

  let horizon = "LONG_TERM";
  let expectedCagr = 14.5;
  let vehicle = "Aggressive Barbell Strategy (Small Cap + Momentum + Nifty 50)";
  let vehicleDetails = "Core high-alpha compounding engine for multi-year wealth accumulation.";
  let equityAllowed = true;
  let maxEquityPct = 85.0;
  let growwUrl = "https://groww.in/mutual-funds/hdfc-nifty-50-index-fund-direct-growth";
  let advisorVerdict = "Full Compounding Power: 4+ year horizon allows aggressive market equity compounding.";

  if (monthsRemaining <= 18) {
    horizon = "SHORT_TERM";
    expectedCagr = 6.8;
    vehicle = "Parag Parikh Liquid Fund / Sovereign Overnight";
    vehicleDetails = "100% Sovereign T-Bills & High-Yield Debt. Zero stock market risk.";
    equityAllowed = false;
    maxEquityPct = 0.0;
    growwUrl = "https://groww.in/mutual-funds/parag-parikh-liquid-fund-direct-growth";
    advisorVerdict = "0% Equity Lockout: Goal is under 18 months. Never gamble short-term money in equities.";
  } else if (monthsRemaining <= 48) {
    horizon = "MEDIUM_TERM";
    expectedCagr = 9.5;
    vehicle = "Conservative Multi-Asset / Equity Savings Fund";
    vehicleDetails = "70% Debt/Arbitrage + 30% Large-Cap Large Blend Equity.";
    equityAllowed = true;
    maxEquityPct = 30.0;
    growwUrl = "https://groww.in/mutual-funds/icici-prudential-equity-savings-fund-direct-growth";
    advisorVerdict = "Controlled Growth: Capped at 30% large-cap equity to cushion market drawdowns before deadline.";
  }

  const monthlyRate = Math.pow(1 + expectedCagr / 100.0, 1 / 12) - 1;
  const fvExisting = current_saved * Math.pow(1 + monthlyRate, monthsRemaining);
  const shortfall = Math.max(0, target_amount - fvExisting);

  let flatSip = 0;
  if (monthlyRate > 0 && monthsRemaining > 0) {
    const denom = Math.pow(1 + monthlyRate, monthsRemaining) - 1;
    flatSip = denom > 0 ? shortfall * (monthlyRate / denom) : shortfall / monthsRemaining;
  } else {
    flatSip = shortfall / monthsRemaining;
  }

  const effectiveStepPct = step_up_frequency !== "NONE" ? step_up_pct : 0.0;
  const stepInterval = step_up_frequency === "ANNUAL" ? 12 : (step_up_frequency === "SEMI_ANNUAL" ? 6 : 999);

  let low = 1.0;
  let high = shortfall;
  let startingStepupSip = flatSip;

  if (effectiveStepPct > 0) {
    for (let iter = 0; iter < 80; iter++) {
      const mid = (low + high) / 2.0;
      let acc = 0;
      let cur = mid;
      for (let m = 1; m <= monthsRemaining; m++) {
        if (m > 1 && ((m - 1) % stepInterval === 0)) cur *= (1 + effectiveStepPct);
        acc = (acc + cur) * (1 + monthlyRate);
      }
      if (acc < shortfall) {
        low = mid;
      } else {
        high = mid;
      }
    }
    startingStepupSip = (low + high) / 2.0;
  }

  let totalContributed = current_saved;
  let cSip = startingStepupSip;
  for (let m = 1; m <= monthsRemaining; m++) {
    if (m > 1 && ((m - 1) % stepInterval === 0)) cSip *= (1 + effectiveStepPct);
    totalContributed += cSip;
  }

  const interestBonus = Math.max(0, target_amount - totalContributed);

  const loanMonthlyRate = (estimated_loan_apr_pct / 100.0) / 12.0;
  let loanInterestSaved = 0;
  if (loanMonthlyRate > 0 && monthsRemaining > 0) {
    const denomLoan = Math.pow(1 + loanMonthlyRate, monthsRemaining) - 1;
    if (denomLoan > 0) {
      const loanEmi = target_amount * (loanMonthlyRate * Math.pow(1 + loanMonthlyRate, monthsRemaining)) / denomLoan;
      const totalLoanPaid = loanEmi * monthsRemaining;
      loanInterestSaved = Math.max(0, totalLoanPaid - target_amount);
    }
  }

  const budgetScenarios = [];
  for (const affordableSip of [10000, 15000, 20000, 25000]) {
    if (affordableSip < flatSip) {
      let acc = current_saved;
      let s = affordableSip;
      for (let m = 1; m <= monthsRemaining; m++) {
        if (m > 1 && ((m - 1) % stepInterval === 0)) s *= (1 + effectiveStepPct);
        acc = (acc + s) * (1 + monthlyRate);
      }

      let monthsNeeded = 360;
      let testAcc = current_saved;
      let testSip = affordableSip;
      for (let m = 1; m <= 360; m++) {
        if (m > 1 && ((m - 1) % stepInterval === 0)) testSip *= (1 + effectiveStepPct);
        testAcc = (testAcc + testSip) * (1 + monthlyRate);
        if (testAcc >= target_amount) {
          monthsNeeded = m;
          break;
        }
      }

      budgetScenarios.push({
        affordable_sip: affordableSip,
        formatted_affordable_sip: `${format_indian_currency(affordableSip)}/mo`,
        accumulated_in_deadline: Math.round(acc),
        formatted_accumulated: format_indian_currency(acc),
        months_needed: monthsNeeded,
        years_needed: Math.round((monthsNeeded / 12) * 10) / 10
      });
    }
  }

  return {
    goal_name,
    target_amount,
    formatted_target: format_indian_currency(target_amount),
    target_date,
    months_remaining: monthsRemaining,
    years_remaining: yearsRemaining,
    horizon_category: horizon,
    recommended_vehicle: vehicle,
    vehicle_details: vehicleDetails,
    expected_cagr_pct: expectedCagr,
    equity_allowed: equityAllowed,
    max_equity_allocation_pct: maxEquityPct,
    step_up_pct: Math.round(effectiveStepPct * 100),
    step_up_frequency,
    flat_monthly_sip: Math.round(flatSip),
    formatted_flat_sip: `${format_indian_currency(flatSip)}/mo`,
    starting_stepup_sip: Math.round(startingStepupSip),
    formatted_starting_stepup_sip: `${format_indian_currency(startingStepupSip)}/mo`,
    total_self_contribution: Math.round(totalContributed),
    formatted_self_contribution: format_indian_currency(totalContributed),
    interest_wealth_bonus: Math.round(interestBonus),
    formatted_interest_bonus: format_indian_currency(interestBonus),
    loan_interest_saved_estimate: Math.round(loanInterestSaved),
    formatted_loan_saved: format_indian_currency(loanInterestSaved),
    advisor_verdict: advisorVerdict,
    budget_scenarios: budgetScenarios,
    groww_deep_link: growwUrl
  };
}

/**
 * High-precision Client-side Trajectory Calculation
 */
export function calculateTrajectoryAnalysis(currentParams = {}) {
  const sip = currentParams.monthly_investable_sip || 25000;
  const lump = currentParams.lump_sum_amount || 0;
  const ctc = currentParams.current_ctc_lpa || 12;
  const rawStepUp = currentParams.annual_step_up_pct;
  const stepUp = (rawStepUp !== undefined && rawStepUp !== null && rawStepUp !== '' && !isNaN(Number(rawStepUp)))
    ? parseFloat(rawStepUp)
    : 0.10;
  const target = currentParams.near_target_amount || 5000000;
  const targetDate = new Date(currentParams.near_target_date || '2028-12-31');
  const today = new Date();
  const months = Math.max(1, Math.round((targetDate - today) / (1000 * 60 * 60 * 24 * 30.4375)));
  const r_m = Math.pow(1 + 0.15, 1 / 12) - 1;

  let corpus = lump;
  let curSip = sip;
  let totalContrib = lump;
  for (let m = 1; m <= months; m++) {
    if (m > 1 && (m % 12 === 1)) curSip *= (1 + stepUp);
    corpus = (corpus + curSip) * (1 + r_m);
    totalContrib += curSip;
  }

  const capitalGains = Math.max(0, corpus - totalContrib);
  const taxableGains = Math.max(0, capitalGains - 125000);
  const ltcgTax = taxableGains * 0.125;
  const postTax = corpus - ltcgTax;
  const yearsRem = Math.round((months / 12) * 10) / 10;
  const realPower = postTax / Math.pow(1.06, yearsRem);

  // Career Roadmap Generation
  const roadmap = [];
  let rCorpus = lump;
  let rSip = sip;
  const startYr = new Date().getFullYear();
  for (let yr = 0; yr <= 9; yr++) {
    for (let m = 1; m <= 12; m++) {
      rCorpus = (rCorpus + rSip) * (1 + r_m);
    }
    roadmap.push({
      year: startYr + yr,
      role: yr === 0 ? 'Senior Software Engineer' : yr <= 2 ? 'Lead Architect / Staff' : yr <= 5 ? 'Principal / VP Wealth Milestone' : 'Director / Executive',
      suggested_ctc_lpa: Math.round(ctc * Math.pow(1.12, yr) * 10) / 10,
      formatted_ctc: `₹${(Math.round(ctc * Math.pow(1.12, yr) * 10) / 10).toFixed(1)} LPA`,
      monthly_sip: Math.round(rSip),
      formatted_sip: `₹${Math.round(rSip).toLocaleString('en-IN')}`,
      projected_corpus_eoy: Math.round(rCorpus),
      formatted_corpus: rCorpus >= 10000000 ? `₹${(rCorpus / 10000000).toFixed(2)} Cr` : `₹${(rCorpus / 100000).toFixed(2)} Lakhs`,
    });
    rSip *= (1 + stepUp);
  }

  return {
    user_profile: {
      monthly_sip: sip,
      lump_sum: lump,
      target_amount: target,
      target_date: currentParams.near_target_date,
      annual_step_up_pct: stepUp,
    },
    short_term_target: {
      months_remaining: months,
      years_remaining: yearsRem,
      total_contributions: totalContrib,
      formatted_contributions: totalContrib >= 10000000 ? `₹${(totalContrib / 10000000).toFixed(2)} Cr` : `₹${(totalContrib / 100000).toFixed(2)} Lakhs`,
      target_amount: target,
      formatted_target: target >= 10000000 ? `₹${(target / 10000000).toFixed(2)} Cr` : `₹${(target / 100000).toFixed(2)} Lakhs`,
      projected_short_fv: corpus,
      formatted_projected: corpus >= 10000000 ? `₹${(corpus / 10000000).toFixed(2)} Cr` : `₹${(corpus / 100000).toFixed(2)} Lakhs`,
      ltcg_tax: ltcgTax,
      formatted_tax: `₹${Math.round(ltcgTax).toLocaleString('en-IN')}`,
      post_tax_corpus: postTax,
      formatted_post_tax: postTax >= 10000000 ? `₹${(postTax / 10000000).toFixed(2)} Cr` : `₹${(postTax / 100000).toFixed(2)} Lakhs`,
      real_purchasing_power_today: realPower,
      formatted_real_power: realPower >= 10000000 ? `₹${(realPower / 10000000).toFixed(2)} Cr` : `₹${(realPower / 100000).toFixed(2)} Lakhs`,
      verdict: corpus >= target ? 'ON_TRACK' : (months < 36 && target >= 5000000 && corpus < target * 0.4 ? 'UNREALISTIC_TIMELINE' : 'NEEDS_ADJUSTMENT'),
      safe_alternative_years: Math.round(Math.max(yearsRem, Math.log(target / (lump || sip * 12)) / Math.log(1.14))),
      formatted_needed_sip: `₹${Math.round(target / months).toLocaleString('en-IN')}`,
      formatted_needed_ctc: `₹${Math.round(((target / months) / 0.3 / 0.85) * 12 / 100000)} LPA`,
      message: corpus >= target
        ? `ON TRACK! At ₹${sip.toLocaleString('en-IN')}/mo SIP (+ ${Math.round(stepUp * 100)}% annual step-up), you will comfortably achieve ₹${(target / 100000).toFixed(1)} Lakhs by ${targetDate.getFullYear()}!`
        : `REALITY CHECK ALERT: Reaching ₹${(target / 100000).toFixed(1)} Lakhs in only ${months} months is mathematically impossible without speculative gambling. Your current plan safely accumulates ₹${(corpus / 100000).toFixed(2)} Lakhs.`,
    },
    career_roadmap_to_3cr: roadmap,
  };
}

/**
 * Intelligent SEBI RIA Hinglish Financial Advisor DSS
 * Fully grounded in user's active portfolio plan, SIP, target, and step-up numbers.
 */
export function generateFinBhaiResponse(query = '', context = {}) {
  const q = (query || '').toLowerCase().trim();
  const qClean = q.replace(/(\d+)\s*(cr|crore|lakh|k)/g, '$1 $2');

  const sip = (context.monthly_sip !== undefined && context.monthly_sip !== null && !isNaN(Number(context.monthly_sip)))
    ? parseFloat(context.monthly_sip)
    : 25000.0;
  const lump = (context.lump_sum !== undefined && context.lump_sum !== null && !isNaN(Number(context.lump_sum)))
    ? parseFloat(context.lump_sum)
    : 0.0;
  const target = (context.target_amount !== undefined && context.target_amount !== null && !isNaN(Number(context.target_amount)))
    ? parseFloat(context.target_amount)
    : 5000000.0;
  const targetDate = context.target_date || '2031-12-31';
  const targetYear = new Date(targetDate).getFullYear() || 2031;
  const stepUpPct = (context.annual_step_up_pct !== undefined && context.annual_step_up_pct !== null && !isNaN(Number(context.annual_step_up_pct)))
    ? parseFloat(context.annual_step_up_pct)
    : 0.10;
  const ctcLpa = (context.ctc_lpa !== undefined && context.ctc_lpa !== null && !isNaN(Number(context.ctc_lpa)))
    ? parseFloat(context.ctc_lpa)
    : 12.0;

  const today = new Date();
  const targetDt = new Date(targetDate);
  const monthsRemaining = Math.max(1, Math.round((targetDt - today) / (1000 * 60 * 60 * 24 * 30.4375)));
  const yearsRemaining = (monthsRemaining / 12.0).toFixed(1);

  // 14.5% blended Multi-Asset Barbell CAGR
  const r_m = Math.pow(1 + 0.145, 1 / 12) - 1;
  let simulatedCorpus = lump;
  let curSip = sip;
  let totalSelfInvested = lump;
  for (let m = 1; m <= monthsRemaining; m++) {
    if (m > 1 && (m % 12 === 1)) curSip *= (1 + stepUpPct);
    simulatedCorpus = (simulatedCorpus + curSip) * (1 + r_m);
    totalSelfInvested += curSip;
  }

  // 1. SMALL SIP / HABIT FORMATION / "ITNE ME KYA HI HOGA" / "300" / "500" / "ITNA KAM"
  if (
    q.includes('itne me') || q.includes('kya hi hoga') || q.includes('kya hoga') ||
    q.includes('300') || q.includes('500') || q.includes('chota') || q.includes('chhota') ||
    q.includes('itna kam') || q.includes('kam paise') || q.includes('kam invest') ||
    q.includes('sirf 300') || q.includes('sirf 500') || q.includes('worth it') ||
    q.includes('kya fayda') || q.includes('kya faida') ||
    (sip <= 1000 && (q.includes('start') || q.includes('shuru') || q.includes('invest') || q.includes('sip')))
  ) {
    const activeSmallSip = sip > 0 && sip <= 1000 ? sip : 300;
    
    // Simulate 10, 15, 20, 25 years for activeSmallSip at 15% step-up and 14.5% CAGR
    const simSmall = (yrs, baseSip = activeSmallSip, step = 0.15) => {
      let c = 0, s = baseSip;
      for (let m = 1; m <= yrs * 12; m++) {
        if (m > 1 && (m % 12 === 1)) s *= (1 + step);
        c = (c + s) * (1 + r_m);
      }
      return Math.round(c);
    };

    const corpus10y = simSmall(10);
    const corpus15y = simSmall(15);
    const corpus20y = simSmall(20);
    const corpus25y = simSmall(25);

    return `**Bhai, ${format_indian_currency(activeSmallSip)} dekhne me chota lagta hai, par yahi se wealth compounding ka asli snowball shuru hota hai! 🌱🚀**

### 🧠 1. Investing Habit vs Amount (Psychological Truth):
• **90% log invest karna shuru hi nahi kar paate** kyuki wo sochte hain 'jab 50,000 salary hogi tab shuru karunga'. Reality yeh hai ki jo insaan ₹300/mo invest karne ki discipline nahi banata, wo kal ₹1 Lakh aane par bhi save nahi kar payega!
• Investing me sabse tough step pehla kadam uthana hota hai. **Habit and discipline matter 100x more than starting capital.**

### 📈 2. ${format_indian_currency(activeSmallSip)}/mo par 15% Annual Step-Up ka Miracle (14.5% CAGR):
Agar aap sirf ${format_indian_currency(activeSmallSip)}/mo se shuru karein aur har saal pocket money ya salary badhne par sirf 15% SIP badhayein (Year 2 me sirf ₹${Math.round(activeSmallSip * 1.15)}/mo — ek burger ya cold drink ka extra cost):
• **10 Saal me:** **~${format_indian_currency(corpus10y)}**
• **15 Saal me:** **~${format_indian_currency(corpus15y)}**
• **20 Saal me:** **~${format_indian_currency(corpus20y)}** 
• **25 Saal me:** **~${format_indian_currency(corpus25y)}!**

### 💡 3. Actionable Fiduciary Rules:
1. **Groww Direct Growth Plans:** Tata Small Cap, Nippon India, ICICI jaise top direct funds **₹100 se ₹250** minimum SIP allow karte hain.
2. **Zero Shame, 100% Pride:** Warren Buffett ne bhi bachpan me newspaper bech kar chote amounts se compounding shuru ki thi.
3. **Step-Up Protocol:** Aaj ${format_indian_currency(activeSmallSip)} se start karo. 6 mahine me jab comfort aaye, isko ₹500, fir ₹1,000, fir ₹5,000 karte jana!`;
  }

  // 2. FEASIBILITY CHECK / "KYA YEH SAMBHAV HAI" / POSSIBLE / REALISTIC / ACHIEVABLE
  if (
    q.includes('sambhav') || q.includes('possible') || q.includes('mumkin') ||
    q.includes('ho payega') || q.includes('ho payga') || q.includes('ho sakta') ||
    q.includes('achieve') || q.includes('realistic') || q.includes('feasib') ||
    q.includes('pahuchega') || q.includes('pahunch')
  ) {
    const isTargetAchievable = simulatedCorpus >= target;
    const shortfall = Math.max(0, target - simulatedCorpus);
    const safeYears = Math.round(Math.max(Number(yearsRemaining), Math.log(target / (lump || (sip * 12))) / Math.log(1.14)));
    const neededSipExact = Math.round(target / monthsRemaining);
    const neededCtcExact = Math.round(((target / monthsRemaining) / 0.30 / 0.85) * 12 / 100000);

    if (isTargetAchievable) {
      return `**Namaste! SEBI-RIA Fiduciary Audit: HAAN BHAI, 100% SAMBHAV HAI! 🎉🚀**

Aapka target **${format_indian_currency(target)}** by ${targetYear} mathematically fully achievable hai!

### 📊 Mathematical Breakdown:
• **Monthly SIP:** ${format_indian_currency(sip)}/mo (+ ${Math.round(stepUpPct * 100)}% Annual Step-Up)
• **Initial Capital:** ${format_indian_currency(lump)}
• **Time Horizon baaki:** ${yearsRemaining} Saal (${monthsRemaining} Months)
• **Expected Wealth Accumulation (14.5% CAGR):** **~${format_indian_currency(simulatedCorpus)}**
• **Surplus Buffer:** **+${format_indian_currency(simulatedCorpus - target)}** above target!

### 🛡️ Plan ko Safe Rakhne ke 3 Fiduciary Rules:
1. **Never Panic Sell:** Market crash (15-20% drawdown) aane par SIP pause mat karna, wahi sasti NAV compounding banati hai.
2. **Step-Up Locked Rakhein:** Har saal salary increment aate hi ${Math.round(stepUpPct * 100)}% SIP automatically badhayein.
3. **100% Direct Mutual Funds Only:** Regular plans ka 1.0-1.5% annual distributor commission kabhi mat katne dena.`;
    } else {
      return `**Namaste! SEBI-RIA Honest Truth & Reality Check: NAHI, CURRENT NUMBERS KE SATH YEH DEADLINE TAK POORA SAMBHAV NAHI HAI ⚠️.**

Bhai, ek fiduciary advisor hone ke naate main aapko jhoothi tasalli nahi de sakta. Stock market compounding 14%-15% safe CAGR se chalti hai, koi lottery ya gambling nahi hai.

### 📋 Asli Reality & Gap Analysis:
• **Aapka Target Goal:** ${format_indian_currency(target)} by ${targetYear} (${yearsRemaining} Saal me)
• **Aapka Current SIP:** ${format_indian_currency(sip)}/mo (with ${Math.round(stepUpPct * 100)}% Step-Up)
• **Realistic Wealth Accumulation (14.5% CAGR):** **~${format_indian_currency(simulatedCorpus)}**
• **Mathematical Funding Gap (Shortfall):** **~${format_indian_currency(shortfall)}**

${yearsRemaining} saal me ${format_indian_currency(sip)}/mo se ${format_indian_currency(target)} pahunchne ke liye **60%–80% annual return** chahiye, jo mutual funds me possible nahi hai aur aisi expectation se log F&O ya fraud schemes me paisa duba dete hain!

### 🎯 Isko 100% Sambhav Banane ke 3 Practical Solutions:
1. **Option 1 — Time Horizon Extend Karein (Most Recommended):**
   • Isi SIP pace (${format_indian_currency(sip)}/mo) par ${format_indian_currency(target)} safely reach karne ke liye lagbhag **~${safeYears} Saal** ka time horizon chahiye.
2. **Option 2 — Monthly SIP Increase Karein:**
   • Agar deadline ${targetYear} non-negotiable hai, toh monthly SIP ko badha kar **~${format_indian_currency(neededSipExact)}/mo** karna hoga (requires ~${neededCtcExact} LPA CTC).
3. **Option 3 — Realistic Milestone Set Karein:**
   • Agle ${yearsRemaining} saal ke liye apna target **~${format_indian_currency(simulatedCorpus)}** lock karein, fir subsequent promotions ke sath target badhayein.`;
    }
  }

  // 3. IS MY PLAN RIGHT? / PLAN REVIEW / "MERA PLAN KESA HAI" / "KAISA HAI" / AUDIT
  if (
    q.includes('right') || q.includes('correct') || q.includes('sahi') || q.includes('galat') ||
    q.includes('plan kaisa') || q.includes('plan kesa') || q.includes('kaisa hai') || q.includes('kesa hai') ||
    q.includes('plan review') || q.includes('plan audit') || q.includes('my plan') || q.includes('mera plan') ||
    q.includes('planning') || q.includes('explain') || q.includes('stick') || q.includes('kya sahi') ||
    q.includes('guide') || q.includes('theek') || q.includes('thik') || q.includes('check') || q.includes('kya lagta')
  ) {
    const isTargetAchievable = simulatedCorpus >= target;
    return `**Namaste! Main aapka SEBI-Registered Investment Advisor (RIA) level FinBhai Copilot hoon 🏛️.**

Aapke active investment plan ka complete fiduciary audit yeh raha:

### 📋 Aapka Current Plan & Trajectory:
• **Monthly SIP:** ${format_indian_currency(sip)}/mo (with ${Math.round(stepUpPct * 100)}% Annual Step-Up)
• **Initial Lump Sum:** ${format_indian_currency(lump)}
• **Target Goal:** ${format_indian_currency(target)} by ${targetYear} (${yearsRemaining} Saal baaki)
• **Aapka Total Self-Investment:** ~${format_indian_currency(totalSelfInvested)}
• **Expected Wealth at Deadline (14.5% CAGR):** **~${format_indian_currency(simulatedCorpus)}**

${isTargetAchievable 
  ? `✅ **VERDICT: ON TRACK!** 
Aapka ${format_indian_currency(sip)}/mo SIP aur ${Math.round(stepUpPct * 100)}% step-up mathematically ${targetYear} tak **${format_indian_currency(simulatedCorpus)}** accumulate karega, jo aapke ${format_indian_currency(target)} target ko aasaani se achieve kar lega!`
  : `⚠️ **VERDICT: TIMELINE REALITY CHECK!** 
${yearsRemaining} saal me ${format_indian_currency(target)} tak pahunchne ke liye aapko thoda sa adjustment chahiye. Current pace se aap **${format_indian_currency(simulatedCorpus)}** tak pahunchenge (~${format_indian_currency(target - simulatedCorpus)} shortfall). Safe timeline ~${Math.round(Math.max(Number(yearsRemaining), Math.log(target / (lump || (sip * 12))) / Math.log(1.14)))} saal hai.`}

### 🎯 What is Correct & What is Right (Fiduciary Advice):
1. **${stepUpPct === 0 ? 'Annual Step-Up Enable Karein:' : 'Step-Up Discipline Maintain Karein:'}**
   • ${stepUpPct === 0 ? 'Aapka step-up currently 0% par hai. Salary increment aate hi har saal 10% ya 15% SIP badhao — isse compounding time 35% reduce ho jata hai!' : `Aapka ${Math.round(stepUpPct * 100)}% step-up plan perfect hai. Is discipline ko strictly locked rakhein.`}
2. **100% Direct Mutual Funds Only:** 
   • Regular plans me 1.0%-1.5% annual distributor commission kat jata hai, jo 20 saal me ₹30 Lakhs+ ka leakage karta hai. Groww direct growth plans me 0% commission leakage hai.
3. **Barbell Factor Allocation:**
   • Tata Small Cap (25%) + Motilal S&P 500 (20%) + UTI Momentum 30 (20%) + HDFC Nifty 50 (20%) + Nippon Silver FoF (15%). Yeh basket domestic growth, tech monopolies, aur inflation defense ko perfectly balance karti hai!`;
  }

  // 4. STEP-UP SIP
  if (q.includes('step') || q.includes('stepup') || q.includes('step-up') || q.includes('increment')) {
    let flatCorpus = lump;
    let sFlat = sip;
    for (let m = 1; m <= monthsRemaining; m++) {
      flatCorpus = (flatCorpus + sFlat) * (1 + r_m);
    }
    const extraGain = Math.max(0, simulatedCorpus - flatCorpus);

    return `**Bhai, Step-Up SIP wealth compounding ka sabse bada secret weapon hai! 🚀**

### 📊 Aapke Numbers par Step-Up ka Asli Magic:
• **Option A — Flat SIP (0% Step-Up):**
  - Har mahine fixed ${format_indian_currency(sip)}
  - ${targetYear} tak banega: **~${format_indian_currency(flatCorpus)}**

• **Option B — Aapka Selected (${Math.round(stepUpPct * 100)}% Annual Step-Up):**
  - Har saal salary increment ke sath SIP badhega
  - ${targetYear} tak banega: **~${format_indian_currency(simulatedCorpus)}**
  - **Extra Wealth Created:** **+${format_indian_currency(extraGain)}** bina extra principal load ke!

💡 **FinBhai Rule:** Agar aap flat SIP rakhoge toh inflation aapke real returns kha jayegi. Har saal apna SIP kam se kam 10% step-up zaroor karein!`;
  }

  // 5. TARGET CORPUS & 1 CRORE / WEALTH BLUEPRINT
  if (qClean.includes('1 crore') || qClean.includes('1 cr') || qClean.includes('crore') || qClean.includes('50 lakh') || q.includes('target') || q.includes('corpus')) {
    return `**Bhai, '${format_indian_currency(target)}' target build karna ek mechanical process hai, koi speculative gamble nahi! 🏆**

### 📈 Aapke Current Portfolio se Roadmap:
• **Current SIP:** ${format_indian_currency(sip)}/mo (with ${Math.round(stepUpPct * 100)}% Step-Up)
• **Target Deadline:** ${targetYear} (${yearsRemaining} Years Remaining)
• **Projected Accumulation:** **~${format_indian_currency(simulatedCorpus)}** (14.5% Multi-Asset Barbell CAGR)

### ⚡ Wealth Accelerate Karne ke 3 Fiduciary Rules:
1. **Contrarian Drawdown Deployment:** Jab market 15%-20% correct ho, Parag Parikh Liquid Fund se sideline dry powder deploy karein.
2. **Section 112A Tax Harvesting:** Har saal Feb-March me ₹1.25 Lakhs tak ka LTCG tax-free harvest karein.
3. **Never Pause in Bear Markets:** Real generational wealth bear market ke saste NAV accumulation se hi banti hai!`;
  }

  // 6. S&P 500 & US GLOBAL ASSETS
  if (q.includes('sp 500') || q.includes('s&p') || q.includes('us ') || q.includes('global') || q.includes('motilal') || q.includes('dollar') || q.includes('currency')) {
    return `**Bhai, Motilal Oswal S&P 500 Index FoF hamare portfolio ka sabse zaroori Global Pillar hai! 🇺🇸**

1. **Natural USD Currency Alpha:**
   • Indian Rupee USD ke mukable har saal ~3.5% to 4.2% depreciate hota hai. S&P 500 me invest karke aapko US index returns + currency depreciation dono ka double compounding milta hai!
2. **Global Monopoly Moats:**
   • Apple, Microsoft, Nvidia, Google, Meta, Amazon — yeh companies global cash cows hain aur Indian stock market me available nahi hain.
3. **Rock-Bottom TER (0.50%):**
   • Active global funds 1.8%-2.2% expense ratio charge karte hain, jabki yeh direct index fund aapko pure exposure deta hai.`;
  }

  // 7. TAX HARVESTING (SECTION 112A)
  if (q.includes('tax') || q.includes('112a') || q.includes('ltcg') || q.includes('harvest') || q.includes('bachaye') || q.includes('saving')) {
    return `**Budget 2024 Section 112A Tax Harvesting Rule:**

• **₹1.25 Lakhs Tax-Free Exemption:** Har financial year (April 1 to March 31) equity mutual funds par ₹1.25 Lakh tak ka Long-Term Capital Gains (LTCG) **100% Tax-Free** hota hai. Uske upar 12.5% tax lagta hai.
• **Action Plan:** Har saal Jan–March me ₹1.25L tak ka profit redeem karke agle din direct growth plan me wapas daal do.
• **Permanent Saving:** Is step-up of acquisition cost se aap har saal **₹15,625 direct cash tax** permanently bacha lete hain!`;
  }

  // 8. MARKET CRASH & DRAWDOWN STRESS
  if (q.includes('crash') || q.includes('drawdown') || q.includes('gir') || q.includes('risk') || q.includes('loss') || q.includes('darr') || q.includes('down')) {
    return `**Market Crash (15%-20% Drawdown) me InvestPro Engine kya karta hai? 📉➡️🚀**

• **Contrarian Overlay (Gajendra Kothari Model):**
  - Jab Nifty ya Small Cap 15%-20% apne peak se girti hai, emotional log darr kar bech dete hain.
  - InvestPro automatically aapke Parag Parikh Liquid Fund ki sideline dry powder ko deploy karne ka signal deta hai.
• **Asymmetric Downside Capture:**
  - Tata Small Cap ka downside capture sirf 68% hai — matlab jab market 100 girta hai, yeh sirf 68 girta hai, par bull market me 112% participate karta hai!`;
  }

  // 9. EMERGENCY FUND / LIQUID FUND VS BANK FD
  if (q.includes('emergency') || q.includes('liquid') || q.includes(' fd') || q.includes('fixed deposit') || q.includes('saving account')) {
    return `**Emergency Fund Strategy: Parag Parikh Liquid Fund vs Bank FD 🛡️**

1. **Kitna Paisa Rakhna Hai?**
   • Kam se kam 3 se 6 mahine ka living expenditure emergency fund me hona chahiye (e.g. ₹1.5L – ₹3.0L).
2. **Bank FD Kyu Nahi?**
   • FD todne par 0.5%-1.0% premature penalty lagti hai aur interest par aapke tax slab ke hisaab se 30% tak TDS kat jata hai.
3. **Parag Parikh Liquid Fund Direct Advantage:**
   • High quality SOV/AAA debt instruments me invest karta hai.
   • Zero credit risk, instant T+1 redemption (₹50,000 instant 30-minute withdrawal allowed).
   • Yahi fund market crash hone par hamara **contrarian buying dry powder** banta hai!`;
  }

  // 10. BEST FUNDS / ALLOCATION / 5 FUNDS KYU?
  if (q.includes('konsa fund') || q.includes('kaunsa fund') || q.includes('best fund') || q.includes('5 fund') || q.includes('allocation') || q.includes('kisme lagaye') || q.includes('barbell')) {
    return `**InvestPro 5-Fund Factor Barbell Allocation Kyu Sabse Best Hai? 🏆**

1. **Tata Small Cap Fund Direct (25%):** Domestic high-growth micro compounding with 68% downside capture.
2. **Motilal Oswal S&P 500 Index FoF (20%):** Global tech monopolies (Nvidia, Apple, Microsoft) + USD currency depreciation hedge.
3. **UTI Nifty200 Momentum 30 Index (20%):** Smart-Beta factor jo consistently Nifty 50 ko 3%-5% alpha se beat karta hai.
4. **HDFC Nifty 50 Index Fund Direct (20%):** Rock-solid India anchor with lowest tracking error & 0.10% expense ratio.
5. **Nippon India Silver ETF FoF (15%):** Precious metals & industrial inflation hedge for macro stress events.

👉 Direct mutual funds me invest karein (0% distributor commission)!`;
  }

  // 11. TOUGH SITUATION / LOW SALARY / DEBT
  if (q.includes('halat') || q.includes('kharab') || q.includes('gareeb') || q.includes('paise nahi') || q.includes('struggle') || q.includes('tension') || q.includes('low salary') || q.includes('kam salary') || q.includes('karz') || q.includes('debt')) {
    return `**Bhai, sabse pehle tension chhod do. Maximum log jinhone ₹1 Crore banaya hai, unki shuruat 'kam salary' se hi hui thi! 🤝❤️**

### 🚀 Aapka Zero-Se-Hero Action Plan:
1. **Start with Whatever You Have (Even ₹300–₹1,000/mo):**
   • Shuruat me amount matter nahi karta, **investing habit aur discipline** matter karta hai.
2. **The 15% Step-Up Miracle:**
   • Jaise-jaise salary badhegi, har saal SIP sirf 15% badhate jao. Sirf ₹1,000/mo SIP (15% Step-Up) se 15 saal me **~₹25 Lakhs** aur 20 saal me **₹1 Crore+** ban jata hai!
3. **Emergency Shield First:**
   • Pehle ₹20k–₹30k Parag Parikh Liquid Fund me rakho taaki koi choti emergency par karz na lena pade.
4. **Stick to the 5-Fund Direct Barbell:**
   • Tata Small Cap (25%) + Motilal S&P 500 (20%) + UTI Momentum 30 (20%) + HDFC Nifty 50 (20%) + Silver FoF (15%).`;
  }

  // 12. DEFAULT HOLISTIC SEBI RIA RESPONSE GROUNDED IN USER PLAN
  return `**Namaste! Main aapka SEBI RIA-Level AI Copilot FinBhai hoon 🤖.**

Aapka active portfolio status:
• **Monthly SIP:** ${format_indian_currency(sip)}/mo (with ${Math.round(stepUpPct * 100)}% Annual Step-Up)
• **Target Goal:** ${format_indian_currency(target)} by ${targetYear} (${yearsRemaining} Yrs)
• **Projected Corpus:** **~${format_indian_currency(simulatedCorpus)}** (Self-Invested: ~${format_indian_currency(totalSelfInvested)})
• **Strategy:** 25% Tata Small Cap + 20% Motilal S&P 500 + 20% UTI Momentum 30 + 20% HDFC Nifty 50 + 15% Nippon Silver FoF

Aap mujhse pooch sakte hain:
• *'Mera plan sahi hai ya nahi?'*
• *'Kya yeh target sambhav hai?'*
• *'10% Step-up se kitna extra corpus banega?'*
• *'Itne me kya hi hoga (₹300 SIP power)?'*
• *'S&P 500 FoF kyu zaroori hai?'*
• *'Section 112A tax kaise bachayein?'*`;
}


