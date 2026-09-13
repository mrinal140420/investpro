import {
  getEnrichedFundUniverse,
  calculateGoalPlan,
  scanTaxHarvesting,
  calculateMilestones,
  calculateTrajectoryAnalysis,
} from '../src/utils/financialCalculations.js';

const PRO_PICKS = [
  {
    id: "tech_momentum_titans",
    name: "Tech Titans & High-Alpha Momentum",
    badge: "TOP PERFORMER",
    badge_color: "emerald",
    tagline: "AI, Cloud Leaders & Nifty 200 Momentum 30",
    cagr_5y_pct: 26.8,
    benchmark_beat_pct: 14.6,
    sharpe_ratio: 1.48,
    max_drawdown_pct: -14.2,
    rebalance_cadence: "Monthly",
    holdings_count: 8,
    risk_profile: "High Alpha / Aggressive",
    top_holdings: [
      { name: "UTI Nifty200 Momentum 30 Direct Growth", weight: "35%", cagr: "21.4%", groww: "https://groww.in/mutual-funds/uti-nifty200-momentum-30-index-fund-direct-growth" },
      { name: "Tata Small Cap Fund Direct Growth", weight: "30%", cagr: "28.2%", groww: "https://groww.in/mutual-funds/tata-small-cap-fund-direct-growth" },
      { name: "Motilal Oswal S&P 500 Index Fund", weight: "20%", cagr: "18.6%", groww: "https://groww.in/mutual-funds/motilal-oswal-sp-500-index-fund-direct-growth" },
      { name: "Nippon India Silver ETF FoF", weight: "15%", cagr: "16.5%", groww: "https://groww.in/mutual-funds/nippon-india-silver-etf-fof-direct-growth" }
    ],
    strategy_thesis: "Combines systematic factor price momentum with high-ROE small cap compounders and global tech monopolies."
  },
  {
    id: "smallcap_undervalued_alpha",
    name: "Small-Cap Alpha & Quality Compounders",
    badge: "HIGH GROWTH",
    badge_color: "cyan",
    tagline: "Sub-₹10k Cr Agile Small Caps with >20% ROCE",
    cagr_5y_pct: 29.4,
    benchmark_beat_pct: 17.2,
    sharpe_ratio: 1.56,
    max_drawdown_pct: -18.5,
    rebalance_cadence: "Quarterly",
    holdings_count: 6,
    risk_profile: "Ultra Aggressive",
    top_holdings: [
      { name: "Tata Small Cap Fund Direct Growth", weight: "40%", cagr: "28.2%", groww: "https://groww.in/mutual-funds/tata-small-cap-fund-direct-growth" },
      { name: "UTI Nifty200 Momentum 30", weight: "35%", cagr: "21.4%", groww: "https://groww.in/mutual-funds/uti-nifty200-momentum-30-index-fund-direct-growth" },
      { name: "HDFC Nifty 50 Index Fund", weight: "25%", cagr: "14.8%", groww: "https://groww.in/mutual-funds/hdfc-nifty-50-index-fund-direct-growth" }
    ],
    strategy_thesis: "Captures the early compounding s-curve of domestic manufacturing, defense, and power infrastructure."
  }
];

const FAIR_VALUES = {
  NIFTY_50: {
    symbol: "NIFTY 50",
    name: "Nifty 50 Benchmark Index",
    current_price: 24850.0,
    fair_value: 26800.0,
    upside_potential_pct: 7.85,
    valuation_status: "UNDERVALUED",
    uncertainty: "LOW",
    models_used_count: 12,
    analyst_target_avg: 27200.0,
    analyst_upside_pct: 9.45,
    financial_health_score: 4.3,
    health_label: "GREAT HEALTH",
    pe_ratio: 22.4,
    forward_pe: 19.8,
    pb_ratio: 3.6,
    dividend_yield_pct: 1.25,
    protips: [
      { type: "bull", text: "Index is trading at a discount to its 5-year historical average P/E multiple (22.4x vs 24.1x)." },
      { type: "bull", text: "Net corporate earnings growth projected at 13.8% YoY across large-cap leaders." },
      { type: "bull", text: "50-Day Moving Average (24,320) remains firmly above the 200-Day SMA (23,150) — Golden Cross active." }
    ],
    health_breakdown: { relative_value: 4.1, price_momentum: 4.6, cash_flow: 4.2, profitability: 4.5, growth: 4.2 }
  }
};

const WHALE_PORTFOLIOS = [
  {
    investor_name: "Warren Buffett / Berkshire Hathaway",
    portfolio_value: "$318 Billion",
    top_sector: "Technology & Consumer (46%)",
    top_picks: [
      { name: "Apple Inc. (AAPL)", weight: "30.5%" },
      { name: "American Express (AXP)", weight: "12.8%" },
      { name: "Bank of America (BAC)", weight: "11.2%" },
      { name: "Coca-Cola (KO)", weight: "9.4%" }
    ],
    core_philosophy: "High Moat, pricing power, enormous Free Cash Flow, long-term buy-and-hold."
  },
  {
    investor_name: "India Marquee Whale (Ashish Kacholia / Vijay Kedia)",
    portfolio_value: "₹4,250 Crores",
    top_sector: "Specialty Chemicals, Precision Engineering, Defense",
    top_picks: [
      { name: "Polycab India", weight: "14.2%" },
      { name: "Gravita India", weight: "11.5%" },
      { name: "Safari Industries", weight: "9.8%" },
      { name: "Ami Organics", weight: "8.6%" }
    ],
    core_philosophy: "Sub-₹5,000 Cr market cap compounders with high ROCE (>25%) and strong domestic tailwinds."
  }
];

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname.replace(/^\/api/, '');
    const query = Object.fromEntries(url.searchParams.entries());

    let body = {};
    if (req.body) {
      if (typeof req.body === 'string') {
        try { body = JSON.parse(req.body); } catch (_) { body = {}; }
      } else {
        body = req.body;
      }
    }

    // 1. /v1/funds/barbell-universe
    if (pathname.includes('/funds/barbell-universe')) {
      const sip = parseFloat(query.monthly_sip || body.monthly_sip) || 25000.0;
      const lump = parseFloat(query.lump_sum || body.lump_sum) || 0.0;
      const risk = query.risk_mode || body.risk_mode || 'global_multi_asset';
      const result = getEnrichedFundUniverse(sip, lump, risk);
      return res.status(200).json(result);
    }

    // 2. /v1/user/trajectory-analysis
    if (pathname.includes('/user/trajectory-analysis')) {
      const result = calculateTrajectoryAnalysis(body);
      return res.status(200).json(result);
    }

    // 3. /v1/goals/reverse-emi
    if (pathname.includes('/goals/reverse-emi')) {
      const result = calculateGoalPlan({
        goal_name: body.goal_name || 'Lifestyle Goal',
        target_amount: parseFloat(body.target_amount) || 1500000,
        target_date: body.target_date || '2029-01-01',
        current_saved: parseFloat(body.current_saved) || 0,
        step_up_pct: parseFloat(body.step_up_pct) || 0.15,
        step_up_frequency: body.step_up_frequency || 'ANNUAL',
        estimated_loan_apr_pct: parseFloat(body.estimated_loan_apr_pct) || 14.0
      });
      return res.status(200).json(result);
    }

    // 4. /v1/tax/harvesting-scan
    if (pathname.includes('/tax/harvesting-scan')) {
      const portfolioVal = parseFloat(body.portfolio_value) || 500000.0;
      const result = scanTaxHarvesting({ portfolio_value: portfolioVal });
      return res.status(200).json(result);
    }

    // 5. /v1/milestones/freedom-tracker
    if (pathname.includes('/milestones/freedom-tracker')) {
      const corpus = parseFloat(body.current_corpus) || 250000.0;
      const ctc = parseFloat(body.annual_ctc_lpa) || 12.0;
      const salary = parseFloat(body.monthly_salary) || ((ctc * 100000 / 12) * 0.85);
      const result = calculateMilestones({
        current_corpus: corpus,
        annual_ctc_lpa: ctc,
        monthly_salary: salary
      });
      return res.status(200).json(result);
    }

    // 6. /v1/pro/propicks
    if (pathname.includes('/pro/propicks')) {
      return res.status(200).json(PRO_PICKS);
    }

    // 7. /v1/pro/fair-value
    if (pathname.includes('/pro/fair-value')) {
      const symbol = query.symbol || 'NIFTY_50';
      return res.status(200).json(FAIR_VALUES[symbol] || FAIR_VALUES.NIFTY_50);
    }

    // 8. /v1/pro/whale-portfolios
    if (pathname.includes('/pro/whale-portfolios')) {
      return res.status(200).json(WHALE_PORTFOLIOS);
    }

    // 9. /v1/chat/hinglish-advisor
    if (pathname.includes('/chat/hinglish-advisor')) {
      const userMsg = body.message || '';
      return res.status(200).json({
        response: `Namaste! Aapka monthly SIP plan aur 50/30/10/10 factor barbell allocation bilkul active hai. Direct plans ke through aapka compounding return 15-17% target ke path par hai. Agar aapko kisi fund me switch ya annual step-up karna hai, toh aap directly slider adjust kar sakte hain!`,
        detected_intent: "PORTFOLIO_CHECK",
        actionable_steps: [
          "Annual 10% Step-Up maintain karein",
          "Section 112A ke under ₹1.25L tax harvest plan karein",
          "Tata Small Cap me AUM bloat monitor karte rahein"
        ]
      });
    }

    // 10. /v1/directives/test-telegram
    if (pathname.includes('/directives/test-telegram')) {
      return res.status(200).json({ status: "sent", message: "Simulated Telegram directive sent successfully." });
    }

    // Health check default
    return res.status(200).json({
      status: "healthy",
      service: "InvestPro Edge API",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Edge API Handler Error:', error);
    return res.status(200).json({
      status: "fallback",
      message: error.message || "Processed with fallback",
      timestamp: new Date().toISOString()
    });
  }
}
