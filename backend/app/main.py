from fastapi import FastAPI, HTTPException, Depends, Body, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from datetime import date
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from app.config import settings
from app.services.ghost_trajectory import GhostTrajectoryEngine, TrajectoryRequest
from app.services.circuit_breaker import CasinoExitCircuitBreaker
from app.services.bloat_scanner import AUMBloatScanner
from app.services.financial_advisor import AIAdvisorEngine
from app.services.goal_slicing import GoalSlicingEngine
from app.services.tax_harvesting import TaxAlphaEngine
from app.services.milestone_tracker import FinancialFreedomEngine
from app.services.investing_pro import InvestingProEngine
from app.services.hinglish_advisor import HinglishAdvisorService
from app.services.cas_parser import CASParser
from app.utils.telegram import TelegramNotifier

from investpro_engine.tax_harvesting import TaxHarvestingEngine
from investpro_engine.tactical_alloc import TacticalAllocEngine
from investpro_engine.glide_path import GlidePathEngine
from investpro_engine.windfall_stp import WindfallSTPRouter
from investpro_engine.bloat_detector import BloatDetector
from investpro_engine.xirr_calculator import XIRRCalculator
from investpro_engine.rolling_backtester import RollingBacktester
from investpro_engine.capture_ratio_filter import CaptureRatioFilter
from investpro_engine.factor_rotator import FactorRotator

app = FastAPI(
    title=settings.APP_NAME,
    version="3.4.0",
    description="Wealth Command Center & Hinglish AI Financial Advisor API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ghost_engine = GhostTrajectoryEngine()
circuit_breaker = CasinoExitCircuitBreaker()
bloat_scanner = AUMBloatScanner()
advisor_engine = AIAdvisorEngine()
goal_slicing_engine = GoalSlicingEngine()
tax_alpha_engine = TaxAlphaEngine()
freedom_engine = FinancialFreedomEngine()
investing_pro_engine = InvestingProEngine()
hinglish_advisor = HinglishAdvisorService()

# InvestPro Multi-Agent Rule Decision Engines
tax_harvesting_engine = TaxHarvestingEngine()
tactical_alloc_engine = TacticalAllocEngine()
glide_path_engine = GlidePathEngine()
windfall_stp_router = WindfallSTPRouter()
bloat_detector = BloatDetector()
xirr_calculator = XIRRCalculator()
rolling_backtester = RollingBacktester()
capture_ratio_filter = CaptureRatioFilter()
factor_rotator = FactorRotator()

# In-memory Directive Queue for Directive Command Center
ACTIVE_DIRECTIVES: List[Dict[str, Any]] = [
    {
        "id": "dir-contrarian-01",
        "directive_type": "DEPLOY_DRY_POWDER",
        "action": "BUY",
        "source_scheme": "Parag Parikh Liquid Fund Direct - Growth (Debt/Liquid Bucket)",
        "target_scheme": "Tata Small Cap Fund Direct - Growth (India Equity Bucket)",
        "amount_inr": 75000.0,
        "units_estimated": 625.5,
        "rationale_heading": "Nifty Smallcap 250 Drawdown at -18.2%: Contrarian Trigger Activated",
        "math_rationale": "Nifty Smallcap 250 has corrected 18.2% from 52-week high (Breached >= 15% threshold). As per Gajendra Kothari contrarian model, deploying 50% of sideline Liquid Debt dry powder (₹75,000) to capture asymmetric recovery compounding.",
        "urgency": "CRITICAL",
        "state": "PENDING_APPROVAL",
        "created_at": "2026-09-12T10:00:00Z",
    },
    {
        "id": "dir-tax-harvest-02",
        "directive_type": "HARVEST_TAX",
        "action": "SELL",
        "source_scheme": "HDFC Nifty 50 Index Fund Direct - Growth",
        "target_scheme": "LIQUID_SETTLEMENT",
        "amount_inr": 284000.0,
        "units_estimated": 1250.0,
        "rationale_heading": "Section 112A Tax Gain Harvest: ₹1,24,850 tax-free",
        "math_rationale": "Holding period is 412 days (> 365 days). Realizes ₹1,24,850 LTCG under Budget 2024 annual ₹1.25L exemption. Selling and immediately repurchasing resets purchase NAV from ₹127.30 to ₹227.20, wiping out ₹15,606 in future taxes.",
        "urgency": "HIGH",
        "state": "PENDING_APPROVAL",
        "created_at": "2026-09-12T10:00:00Z",
    },
    {
        "id": "dir-rebalance-03",
        "directive_type": "TRIM_AND_SWEEP",
        "action": "SELL",
        "source_scheme": "India Equity Bucket (Current: 56.4%)",
        "target_scheme": "Gold / Sovereign Gold Bonds (Current: 14.1%)",
        "amount_inr": 64000.0,
        "units_estimated": None,
        "rationale_heading": "Multi-Asset Drift: India Equity Drift +6.4% (> ±5% Limit)",
        "math_rationale": "Portfolio 50/20/20/10 audit: India Equity has expanded to 56.4% (Target: 50.0%, Drift: +6.4%), while Gold has shrunk to 14.1% (Target: 20.0%, Deficit: -5.9%). Trimming ₹64,000 from Equity and sweeping into Gold to re-anchor risk posture.",
        "urgency": "MEDIUM",
        "state": "PENDING_APPROVAL",
        "created_at": "2026-09-12T10:00:00Z",
    }
]

class UserProfileUpdatePayload(BaseModel):
    dob: Optional[str] = "2005-04-14"
    current_ctc_lpa: Optional[float] = 12.0
    monthly_investable_sip: Optional[float] = 25000.0
    lump_sum_amount: Optional[float] = 0.0
    annual_step_up_pct: Optional[float] = 0.10
    current_portfolio: Optional[float] = 0.0
    near_target_amount: Optional[float] = 5000000.0
    near_target_date: Optional[str] = "2028-12-31"
    far_target_amount: Optional[float] = 30000000.0
    far_target_date: Optional[str] = "2035-04-14"
    assumed_cagr: Optional[float] = 0.15
    savings_rate: Optional[float] = 0.30
    risk_mode: Optional[str] = "aggressive"

class GoalSlicingPayload(BaseModel):
    goal_name: str = "MacBook Pro / Bike Fund"
    target_amount: float = 150000.0
    target_date: str = "2027-06-30"
    current_saved: Optional[float] = 0.0
    step_up_pct: Optional[float] = 0.10
    step_up_frequency: Optional[str] = "ANNUAL"
    estimated_loan_apr_pct: Optional[float] = 14.0

class TaxHarvestScanPayload(BaseModel):
    portfolio_value: Optional[float] = 500000.0
    unrealized_gains_override: Optional[float] = 0.0

class MilestoneFreedomPayload(BaseModel):
    current_corpus: Optional[float] = 250000.0
    monthly_salary: Optional[float] = 85000.0
    annual_ctc_lpa: Optional[float] = 12.0

class ChatAdvisorPayload(BaseModel):
    message: str = "Bhai S&P 500 FoF kyu zaroori hai?"
    portfolio_context: Optional[Dict[str, Any]] = None
    conversation_history: Optional[List[Dict[str, str]]] = None
    custom_gemini_key: Optional[str] = None

@app.get("/")
async def health_check():
    return {
        "status": "online",
        "system": "InvestPro Wealth Command Center & InvestingPro DSS",
        "version": "3.4.0"
    }

# ── InvestingPro Institutional Endpoints ──
@app.get("/api/v1/pro/propicks")
@app.post("/api/v1/pro/propicks")
async def get_propicks_strategies():
    strategies = investing_pro_engine.get_propicks_strategies()
    return {"strategies": strategies}

@app.get("/api/v1/pro/fair-value")
@app.post("/api/v1/pro/fair-value")
async def get_fair_value_analysis(symbol: str = Query("NIFTY_50")):
    analysis = investing_pro_engine.get_fair_value_analysis(symbol)
    return analysis

@app.get("/api/v1/pro/whale-portfolios")
@app.post("/api/v1/pro/whale-portfolios")
async def get_whale_portfolios():
    whales = investing_pro_engine.get_institutional_whale_portfolios()
    return {"whales": whales}

# ── User Trajectory Analysis Endpoint ──
@app.post("/api/v1/user/trajectory-analysis")
@app.get("/api/v1/user/trajectory-analysis")
async def analyze_trajectory(payload: Optional[UserProfileUpdatePayload] = None):
    if payload is None:
        payload = UserProfileUpdatePayload()

    # Fail-safe sanitization for every field
    raw_ctc = payload.current_ctc_lpa if payload.current_ctc_lpa is not None else 12.0
    if raw_ctc > 500.0:
        raw_ctc = (raw_ctc * 12.0) / 100000.0
    ctc = max(0.01, raw_ctc)

    sip = max(0.0, payload.monthly_investable_sip if payload.monthly_investable_sip is not None else 25000.0)
    lump = max(0.0, payload.lump_sum_amount if payload.lump_sum_amount is not None else 0.0)
    near_target = max(100.0, payload.near_target_amount if payload.near_target_amount is not None else 5000000.0)
    annual_step_up = max(0.0, payload.annual_step_up_pct if payload.annual_step_up_pct is not None else 0.10)
    cagr = max(0.01, payload.assumed_cagr if payload.assumed_cagr is not None else 0.15)
    sav_rate = max(0.05, min(0.95, payload.savings_rate if payload.savings_rate is not None else 0.30))
    risk = payload.risk_mode if payload.risk_mode else "aggressive"

    dob_str = payload.dob if payload.dob else "2005-04-14"
    near_str = payload.near_target_date if payload.near_target_date else "2028-12-31"
    far_str = payload.far_target_date if payload.far_target_date else "2035-04-14"

    try:
        dob_parsed = date.fromisoformat(dob_str)
    except Exception:
        dob_parsed = date(2005, 4, 14)

    try:
        near_date_parsed = date.fromisoformat(near_str)
    except Exception:
        near_date_parsed = date(2028, 12, 31)

    try:
        far_date_parsed = date.fromisoformat(far_str)
    except Exception:
        far_date_parsed = date(2035, 4, 14)

    req = TrajectoryRequest(
        dob=dob_parsed,
        current_ctc_annual=ctc * 100000.0,
        monthly_take_home=(ctc * 100000.0 / 12) * 0.85,
        monthly_investable_sip=sip,
        lump_sum_amount=lump,
        annual_step_up_pct=annual_step_up,
        current_portfolio=max(0.0, payload.current_portfolio or 0.0),
        near_target_amount=near_target,
        near_target_date=near_date_parsed,
        far_target_amount=max(1000.0, payload.far_target_amount or 30000000.0),
        far_target_date=far_date_parsed,
        assumed_cagr=cagr,
        savings_rate=sav_rate,
        risk_mode=risk
    )

    short_term_analysis = ghost_engine.calculate_short_term_reality(req)
    career_roadmap = ghost_engine.generate_career_roadmap(req)
    advisor_recommendations = advisor_engine.generate_recommendations(
        monthly_sip=sip,
        lump_sum=lump,
        risk_mode=risk
    )

    # Calculate Milestones & Freedom metrics
    freedom_metrics = freedom_engine.calculate_milestones(
        current_corpus=max(0.0, payload.current_portfolio or 0.0) + lump,
        monthly_salary=(ctc * 100000.0 / 12) * 0.85,
        annual_ctc_lpa=ctc
    )

    return {
        "user_profile": {
            "dob": dob_str,
            "age": date.today().year - dob_parsed.year,
            "current_ctc_lpa": ctc,
            "monthly_investable_sip": sip,
            "lump_sum_amount": lump,
            "annual_step_up_pct": annual_step_up * 100,
            "savings_rate_pct": sav_rate * 100,
            "assumed_cagr_pct": cagr * 100,
            "risk_mode": risk
        },
        "short_term_target": short_term_analysis,
        "career_roadmap_to_3cr": [
            {
                "year": m.year,
                "role": m.role,
                "suggested_ctc_lpa": m.suggested_ctc_lpa,
                "monthly_sip": m.monthly_sip,
                "projected_corpus_eoy": m.projected_corpus_eoy,
                "formatted_ctc": m.formatted_ctc,
                "formatted_sip": m.formatted_sip,
                "formatted_corpus": m.formatted_corpus
            } for m in career_roadmap
        ],
        "financial_advisor": advisor_recommendations,
        "freedom_metrics": freedom_metrics
    }

@app.post("/api/v1/funds/barbell-universe")
@app.get("/api/v1/funds/barbell-universe")
async def get_barbell_universe(monthly_sip: float = 25000.0, lump_sum: float = 0.0, risk_mode: str = "aggressive"):
    sip = max(0.0, monthly_sip)
    lump = max(0.0, lump_sum)
    advisor_data = advisor_engine.generate_recommendations(
        monthly_sip=sip,
        lump_sum=lump,
        risk_mode=risk_mode
    )
    return advisor_data

@app.post("/api/v1/goals/reverse-emi")
async def calculate_goal_reverse_emi(payload: GoalSlicingPayload):
    plan = goal_slicing_engine.calculate_goal_plan(
        goal_name=payload.goal_name,
        target_amount=max(100.0, payload.target_amount),
        target_date_str=payload.target_date,
        current_saved=max(0.0, payload.current_saved or 0.0),
        step_up_pct=max(0.0, payload.step_up_pct if payload.step_up_pct is not None else 0.10),
        step_up_frequency=payload.step_up_frequency or "ANNUAL",
        estimated_loan_apr_pct=max(1.0, payload.estimated_loan_apr_pct or 14.0)
    )
    return plan

@app.post("/api/v1/tax/harvesting-scan")
async def scan_tax_harvesting(payload: Optional[TaxHarvestScanPayload] = None):
    if payload is None:
        payload = TaxHarvestScanPayload()
    result = tax_alpha_engine.scan_tax_harvesting(
        portfolio_value=max(0.0, payload.portfolio_value or 0.0),
        unrealized_gains_override=max(0.0, payload.unrealized_gains_override or 0.0)
    )
    return result

@app.post("/api/v1/milestones/freedom-tracker")
async def track_milestones(payload: Optional[MilestoneFreedomPayload] = None):
    if payload is None:
        payload = MilestoneFreedomPayload()
    result = freedom_engine.calculate_milestones(
        current_corpus=max(0.0, payload.current_corpus or 0.0),
        monthly_salary=max(1000.0, payload.monthly_salary or 85000.0),
        annual_ctc_lpa=max(0.1, payload.annual_ctc_lpa or 12.0)
    )
    return result

@app.post("/api/v1/directives/test-telegram")
async def test_telegram_directive(scheme_code: str = "145206", amount: float = 100.0):
    notifier = TelegramNotifier()
    message_reason = f"SMA 50 crossed below SMA 200 (Death Cross). Execute on Groww: https://groww.in/mutual-funds/tata-small-cap-fund-direct-growth"
    
    success = await notifier.send_directive(
        action="PAUSE_SIP",
        scheme_name="Tata Small Cap Fund - Direct Growth",
        amount_inr=amount,
        reason=message_reason,
        urgency="CRITICAL"
    )
    return {
        "status": "sent" if success else "failed",
        "groww_url": "https://groww.in/mutual-funds/tata-small-cap-fund-direct-growth"
    }

@app.post("/api/v1/chat/hinglish-advisor")
async def chat_hinglish_advisor(payload: ChatAdvisorPayload):
    ctx = payload.portfolio_context or {
        "monthly_sip": 25000.0,
        "lump_sum": 50000.0,
        "target_amount": 5000000.0,
        "target_date": "2028-12-31",
        "ctc_lpa": 12.0,
        "risk_mode": "global_multi_asset"
    }

    result = await hinglish_advisor.generate_response(
        user_message=payload.message,
        portfolio_context=ctx,
        conversation_history=payload.conversation_history or [],
        custom_api_key=payload.custom_gemini_key
    )
    return result


# ─────────────────────────────────────────────────────────────────────────────
# INVESTPRO MULTI-AGENT DIGITAL FAMILY OFFICE ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

class CasRawTextPayload(BaseModel):
    raw_text: str
    password: Optional[str] = None

class AllocAuditPayload(BaseModel):
    india_equity: float = 564000.0
    global_equity: float = 200000.0
    gold_precious: float = 141000.0
    debt_liquid: float = 95000.0

class DrawdownCheckPayload(BaseModel):
    index_symbol: str = "NIFTY_SMALLCAP_250"
    current_price: float = 15800.0
    high_52_week: float = 19320.0
    debt_dry_powder_inr: float = 150000.0

class TaxHarvestPayload(BaseModel):
    tax_lots: Optional[List[Dict[str, Any]]] = None
    current_nav_lookup: Optional[Dict[str, float]] = None
    already_realized_ltcg: Optional[float] = 0.0

class GoalGlidePayload(BaseModel):
    goal_id: str = "goal-downpayment-01"
    goal_name: str = "Home Down Payment"
    target_amount: float = 2500000.0
    target_date: str = "2028-06-30"
    current_equity_corpus: float = 1800000.0
    current_debt_corpus: float = 300000.0

class WindfallSTPPayload(BaseModel):
    lump_sum_amount: float = 500000.0
    start_date: Optional[str] = None

class BloatScanPayload(BaseModel):
    scheme_code: str = "120503"
    scheme_name: str = "Nippon India Small Cap Fund - Direct Plan - Growth"
    current_aum_crores: float = 52500.0
    monthly_sip_amount: float = 10000.0
    fund_category: str = "small_cap"

class XIRRComputePayload(BaseModel):
    cash_flows: List[Dict[str, Any]]

class DirectiveApprovePayload(BaseModel):
    directive_id: str


@app.post("/api/v1/ingestion/cas-upload")
async def upload_cas_statement(
    file: Optional[UploadFile] = File(None),
    password: Optional[str] = Form(None),
    payload: Optional[CasRawTextPayload] = Body(None)
):
    """
    Ingests password-protected Consolidated Account Statement (CAS) PDF.
    Extracts, normalizes, excludes regular plans, and categorizes into 50/20/20/10 buckets.
    """
    parser = CASParser(password=password or (payload.password if payload else None))
    
    if file and file.filename:
        file_bytes = await file.read()
        try:
            result = parser.parse_pdf(file_bytes)
            return result
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"CAS PDF Parsing failed: {str(e)}")
    
    if payload and payload.raw_text:
        result = parser.parse_extracted_content(payload.raw_text)
        return result

    # Default synthetic CAS demonstration
    sample_text = (
        "Folio No: 1204859/91\n"
        "Tata Small Cap Fund - Direct Plan - Growth ISIN: INF277K01423\n"
        "15-Jan-2024 SIP Purchase 5000.00 45.123 110.8080 45.123\n"
        "15-Feb-2024 Systematic Investment 5000.00 44.500 112.3595 89.623\n"
        "10-Mar-2024 Purchase 10000.00 88.000 113.6363 177.623\n\n"
        "Folio No: 8847291/02\n"
        "Motilal Oswal S&P 500 Index Fund - Direct Plan - Growth ISIN: INF247L01AU4\n"
        "20-Jan-2024 Purchase 15000.00 750.000 20.0000 750.000\n\n"
        "Folio No: 3349102/55\n"
        "Nippon India Silver ETF FoF - Regular Plan - Growth ISIN: INF204K01844\n"
        "05-Feb-2024 Purchase 5000.00 350.000 14.2857 350.000\n"
    )
    result = parser.parse_extracted_content(sample_text)
    return result


@app.get("/api/v1/directives/pending")
async def get_pending_directives():
    """
    Returns the queue of engine-generated actionable directives for Directive Command Center.
    """
    pending = [d for d in ACTIVE_DIRECTIVES if d.get("state") == "PENDING_APPROVAL"]
    return {
        "count": len(pending),
        "directives": pending
    }


@app.post("/api/v1/directives/approve")
async def approve_directive(payload: DirectiveApprovePayload):
    """
    Approves an engine directive from the Directive Command Center.
    """
    for d in ACTIVE_DIRECTIVES:
        if d.get("id") == payload.directive_id:
            d["state"] = "APPROVED"
            d["approved_at"] = date.today().isoformat()
            return {
                "status": "SUCCESS",
                "message": f"Directive {payload.directive_id} approved for execution.",
                "directive": d
            }
    raise HTTPException(status_code=404, detail="Directive not found")


@app.post("/api/v1/allocations/audit")
async def audit_allocations(payload: Optional[AllocAuditPayload] = None):
    """
    Gajendra Kothari 50/20/20/10 multi-asset allocation and drift rebalancing audit.
    """
    p = payload or AllocAuditPayload()
    holdings = {
        "INDIA_EQUITY": p.india_equity,
        "GLOBAL_EQUITY": p.global_equity,
        "GOLD_PRECIOUS": p.gold_precious,
        "DEBT_LIQUID": p.debt_liquid,
    }
    result = tactical_alloc_engine.audit_rebalance(holdings)
    return result


@app.post("/api/v1/allocations/drawdown-check")
async def check_drawdown(payload: Optional[DrawdownCheckPayload] = None):
    """
    Contrarian tactical trigger evaluation for 15-20% market drawdowns.
    """
    p = payload or DrawdownCheckPayload()
    result = tactical_alloc_engine.evaluate_drawdown_trigger(
        index_symbol=p.index_symbol,
        current_price=p.current_price,
        high_52_week=p.high_52_week,
        available_dry_powder_debt_inr=p.debt_dry_powder_inr,
    )
    return result


@app.post("/api/v1/tax/harvest-simulation")
async def simulate_tax_harvesting(payload: Optional[TaxHarvestPayload] = None):
    """
    Simulates Section 112A LTCG tax harvesting up to ₹1,25,000 limit.
    """
    p = payload or TaxHarvestPayload()
    tax_lots = p.tax_lots or [
        {
            "lot_id": "lot-01",
            "scheme_name": "Tata Small Cap Fund Direct - Growth",
            "isin": "INF277K01423",
            "purchase_date": "2024-06-15",
            "purchase_nav": 110.0,
            "units_remaining": 600.0,
        },
        {
            "lot_id": "lot-02",
            "scheme_name": "HDFC Nifty 50 Index Fund Direct - Growth",
            "isin": "INF179K01BE2",
            "purchase_date": "2024-04-10",
            "purchase_nav": 150.0,
            "units_remaining": 1200.0,
        }
    ]
    curr_navs = p.current_nav_lookup or {
        "Tata Small Cap Fund Direct - Growth": 165.0,
        "HDFC Nifty 50 Index Fund Direct - Growth": 220.0,
    }
    result = tax_harvesting_engine.scan_and_generate_directives(
        tax_lots=tax_lots,
        current_nav_lookup=curr_navs,
        already_realized_ltcg=p.already_realized_ltcg or 0.0,
    )
    return result


@app.post("/api/v1/goals/glide-path-check")
async def check_goal_glide_path(payload: Optional[GoalGlidePayload] = None):
    """
    Evaluates goal glide path (Neeraj Arora model) for automated T-24m 4%/month SWP into debt.
    """
    p = payload or GoalGlidePayload()
    try:
        t_date = date.fromisoformat(p.target_date)
    except Exception:
        t_date = date(2028, 6, 30)

    result = glide_path_engine.evaluate_goal(
        goal_id=p.goal_id,
        goal_name=p.goal_name,
        target_amount=p.target_amount,
        target_date=t_date,
        current_equity_corpus=p.current_equity_corpus,
        current_debt_corpus=p.current_debt_corpus,
    )
    return result


@app.post("/api/v1/windfall/stp-plan")
async def generate_windfall_stp(payload: Optional[WindfallSTPPayload] = None):
    """
    Intercepts lump sum and generates 20-week deterministic STP plan.
    """
    p = payload or WindfallSTPPayload()
    st_date = date.fromisoformat(p.start_date) if p.start_date else None
    result = windfall_stp_router.route_windfall(
        lump_sum_amount=p.lump_sum_amount,
        start_date=st_date,
    )
    return result


@app.post("/api/v1/funds/bloat-scan")
async def scan_smallcap_bloat(payload: Optional[BloatScanPayload] = None):
    """
    Monitors small cap fund AUM against ₹10k Cr limit, redirecting to smart beta if bloated.
    """
    p = payload or BloatScanPayload()
    result = bloat_detector.scan_fund(
        scheme_code=p.scheme_code,
        scheme_name=p.scheme_name,
        current_aum_crores=p.current_aum_crores,
        monthly_sip_amount=p.monthly_sip_amount,
        fund_category=p.fund_category,
    )
    return result


@app.post("/api/v1/portfolio/xirr")
async def compute_portfolio_xirr(payload: XIRRComputePayload):
    """
    Computes high-precision Newton-Raphson XIRR over irregular cash flow ledger dates.
    """
    flows = []
    for f in payload.cash_flows:
        dt = f.get("date") or f.get("transaction_date")
        amt = f.get("amount") or f.get("net_amount", 0.0)
        if dt is not None and amt is not None:
            flows.append((dt, float(amt)))

    rate = xirr_calculator.calculate_xirr(flows)
    return {
        "xirr_decimal": rate,
        "xirr_percentage": round(rate * 100.0, 2) if rate is not None else None,
        "status": "CONVERGED" if rate is not None else "NON_CONVERGENT",
        "cash_flow_count": len(flows),
    }


# ─────────────────────────────────────────────────────────────────────────────
# ADVANCED FACTOR OPTIMIZATION & BACKTESTING ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

class StepUpMatrixPayload(BaseModel):
    target_amount: Optional[float] = 10000000.0
    starting_sip: Optional[float] = 25000.0
    factor_cagr: Optional[float] = 15.8
    baseline_cagr: Optional[float] = 12.0

class RollingBacktestPayload(BaseModel):
    scheme_name: Optional[str] = "InvestPro 50/30/10/10 Factor Barbell"
    cagr_mean: Optional[float] = 0.16
    volatility: Optional[float] = 0.18
    years: Optional[int] = 16


@app.get("/api/v1/backtest/factor-models")
async def get_factor_models():
    """
    Returns available multi-tiered factor model blueprints (Conservative, Factor Barbell, Momentum).
    """
    return {
        "models": [
            factor_rotator.get_portfolio_blend("conservative_index"),
            factor_rotator.get_portfolio_blend("investpro_factor_barbell"),
            factor_rotator.get_portfolio_blend("aggressive_momentum"),
        ]
    }


@app.post("/api/v1/backtest/step-up-matrix")
async def get_step_up_comparison(payload: Optional[StepUpMatrixPayload] = None):
    """
    Calculates timeline reduction to target corpus with 15.8% Factor XIRR vs 12% Baseline + Step-Up SIP.
    """
    p = payload or StepUpMatrixPayload()
    matrix = factor_rotator.calculate_step_up_timeline_matrix(
        target_amount=p.target_amount or 10000000.0,
        starting_sip=p.starting_sip or 25000.0,
        cagr_rate=p.factor_cagr or 15.8,
        baseline_cagr=p.baseline_cagr or 12.0,
    )
    return matrix


@app.post("/api/v1/backtest/rolling-window")
async def run_rolling_backtest(payload: Optional[RollingBacktestPayload] = None):
    """
    Simulates rolling 7-year backtest windows across 15+ years lookback (2008-2026).
    """
    p = payload or RollingBacktestPayload()
    series = rolling_backtester.generate_synthetic_historical_series(
        cagr_mean=p.cagr_mean or 0.16,
        volatility=p.volatility or 0.18,
        years=p.years or 16,
        start_date=date(2008, 1, 1),
    )
    results = rolling_backtester.calculate_rolling_returns(series, scheme_name=p.scheme_name or "Factor Barbell")
    return results


@app.post("/api/v1/backtest/capture-ratios")
async def run_capture_ratios():
    """
    Evaluates asymmetric capture ratios (Upside >= 90%, Downside <= 75%, Ratio >= 1.25).
    """
    # 36-month sample historical return series (Bull & Bear cycles)
    fund_monthly = [
        0.045, 0.032, -0.015, 0.051, -0.022, 0.038, 0.041, -0.018, 0.029, 0.035,
        -0.012, 0.048, 0.055, -0.025, 0.031, 0.042, -0.014, 0.028, 0.039, -0.020,
        0.046, 0.033, -0.017, 0.050, 0.043, -0.019, 0.034, 0.047, -0.016, 0.030,
        0.052, -0.021, 0.037, 0.044, -0.013, 0.049
    ]
    bench_monthly = [
        0.040, 0.030, -0.035, 0.045, -0.040, 0.032, 0.035, -0.038, 0.025, 0.030,
        -0.032, 0.040, 0.048, -0.045, 0.028, 0.036, -0.030, 0.024, 0.033, -0.042,
        0.038, 0.029, -0.036, 0.042, 0.037, -0.039, 0.030, 0.041, -0.034, 0.027,
        0.045, -0.041, 0.031, 0.038, -0.029, 0.043
    ]
    results = capture_ratio_filter.calculate_capture_ratios(
        fund_monthly,
        bench_monthly,
        scheme_name="InvestPro Alpha Factor Blend"
    )
    return results
