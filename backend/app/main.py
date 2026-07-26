from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from datetime import date
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from app.config import settings
from app.services.ghost_trajectory import GhostTrajectoryEngine, TrajectoryRequest
from app.services.circuit_breaker import CasinoExitCircuitBreaker
from app.services.bloat_scanner import AUMBloatScanner
from app.services.financial_advisor import AIAdvisorEngine
from app.utils.telegram import TelegramNotifier

app = FastAPI(
    title=settings.APP_NAME,
    version="3.1.0",
    description="Wealth Command Center Decision Support System API"
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

class UserProfileUpdatePayload(BaseModel):
    dob: Optional[str] = "2005-04-14"
    current_ctc_lpa: Optional[float] = 2.88
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

@app.get("/")
async def health_check():
    return {
        "status": "online",
        "system": "InvestPro Wealth Command Center DSS",
        "version": "3.1.0"
    }

@app.post("/api/v1/user/trajectory-analysis")
@app.get("/api/v1/user/trajectory-analysis")
async def analyze_trajectory(payload: Optional[UserProfileUpdatePayload] = None):
    if payload is None:
        payload = UserProfileUpdatePayload()

    # Fail-safe sanitization for every field
    raw_ctc = payload.current_ctc_lpa if payload.current_ctc_lpa is not None else 2.88
    if raw_ctc > 500.0:
        raw_ctc = (raw_ctc * 12.0) / 100000.0
    ctc = max(0.01, raw_ctc)

    sip = max(10.0, payload.monthly_investable_sip if payload.monthly_investable_sip is not None else 25000.0)
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
        "financial_advisor": advisor_recommendations
    }

@app.post("/api/v1/funds/barbell-universe")
@app.get("/api/v1/funds/barbell-universe")
async def get_barbell_universe(monthly_sip: float = 25000.0, lump_sum: float = 0.0, risk_mode: str = "aggressive"):
    sip = max(10.0, monthly_sip)
    lump = max(0.0, lump_sum)
    advisor_data = advisor_engine.generate_recommendations(
        monthly_sip=sip,
        lump_sum=lump,
        risk_mode=risk_mode
    )
    return advisor_data

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
