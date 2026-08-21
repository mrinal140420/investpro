from dataclasses import dataclass
from datetime import date
from typing import List, Dict, Any, Optional

def format_indian_currency(amount: float) -> str:
    """Format numbers into clean Indian currency: Thousands, Lakhs, Crores."""
    if amount < 0:
        return f"-{format_indian_currency(abs(amount))}"
    if amount < 100000: # < 1 Lakh
        return f"₹{amount:,.0f}"
    elif amount < 10000000: # 1 Lakh to 1 Crore
        lakhs = amount / 100000.0
        return f"₹{lakhs:.2f} Lakhs"
    else: # >= 1 Crore
        crores = amount / 10000000.0
        return f"₹{crores:.2f} Crores"

def get_real_world_equivalent_note(real_power: float, year: int, post_tax_amount: float) -> str:
    """Generate dynamic purchasing power real-world equivalent text matching the exact corpus."""
    formatted_post_tax = format_indian_currency(post_tax_amount)
    formatted_power = format_indian_currency(real_power)

    if real_power < 100000:
        equivalent = "high-end tech equipment or 3 months of emergency reserves"
    elif real_power < 1000000:
        equivalent = "1 year of full living expenses or a new electric vehicle"
    elif real_power < 5000000:
        equivalent = "3 years of full living expenses or down payment for a prime property"
    elif real_power < 15000000:
        equivalent = "a premium 2BHK apartment or 8 years of full financial freedom"
    elif real_power < 50000000:
        equivalent = "luxury real estate acquisition or 15+ years of full financial independence"
    else:
        equivalent = "generational wealth portfolio, commercial real estate asset, or permanent financial independence"

    return f"In today's 2026 money, your post-tax {formatted_post_tax} in {year} buys what {formatted_power} buys today (e.g., {equivalent})."

@dataclass
class TrajectoryRequest:
    dob: date
    current_ctc_annual: float        # INR
    monthly_take_home: float         # INR
    monthly_investable_sip: float    # INR
    lump_sum_amount: float = 0.0     # Upfront initial lump sum (INR)
    annual_step_up_pct: float = 0.10  # 10% annual SIP step-up
    current_portfolio: float = 0.0    # Current existing portfolio (INR)
    near_target_amount: float = 5000000.0  # ₹50 Lakhs
    near_target_date: date = date(2028, 12, 31) # 2028 Target
    far_target_amount: float = 30000000.0  # ₹3 Crore
    far_target_date: date = date(2035, 4, 14)
    assumed_cagr: float = 0.15       # 15% baseline CAGR
    savings_rate: float = 0.30       # 30% savings rate assumption
    risk_mode: str = "aggressive"

@dataclass
class CareerMilestoneProjection:
    year: int
    role: str
    suggested_ctc_lpa: float
    monthly_sip: float
    projected_corpus_eoy: float
    formatted_ctc: str
    formatted_sip: str
    formatted_corpus: str

class GhostTrajectoryEngine:
    """
    Ghost Trajectory & Dynamic Timeline Engine (v6.0)
    Integrated with Reality Governor & Sanity Guardrails.
    """

    def calculate_short_term_reality(self, req: TrajectoryRequest) -> Dict[str, Any]:
        today = date.today()
        months_remaining = max(1, (req.near_target_date.year - today.year) * 12 + (req.near_target_date.month - today.month))
        years_remaining = months_remaining / 12.0
        
        # Use the same CAGR the user configured (default 15%), not a hardcoded value
        effective_cagr = req.assumed_cagr
        r_m = (1 + effective_cagr) ** (1/12) - 1
        
        # ── Step-Up SIP Projection (consistent with Career Roadmap & _solve_safe_months) ──
        corpus = req.current_portfolio + req.lump_sum_amount
        current_sip = req.monthly_investable_sip
        total_contributions = req.current_portfolio + req.lump_sum_amount
        
        for m in range(1, months_remaining + 1):
            if m > 1 and (m % 12 == 1):
                current_sip = current_sip * (1 + req.annual_step_up_pct)
            corpus = (corpus + current_sip) * (1 + r_m)
            total_contributions += current_sip
        
        projected_short_fv = corpus

        capital_gains = max(0.0, projected_short_fv - total_contributions)
        taxable_gains = max(0.0, capital_gains - 125000.0)
        ltcg_tax = taxable_gains * 0.125
        post_tax_corpus = projected_short_fv - ltcg_tax

        inflation_discount = (1.06) ** years_remaining
        real_purchasing_power_today = post_tax_corpus / inflation_discount

        purchasing_power_note = get_real_world_equivalent_note(
            real_power=real_purchasing_power_today,
            year=req.near_target_date.year,
            post_tax_amount=post_tax_corpus
        )

        # 1. Target On Track Scenario
        if projected_short_fv >= req.near_target_amount or total_contributions >= req.near_target_amount:
            return {
                "months_remaining": months_remaining,
                "years_remaining": round(years_remaining, 1),
                "total_contributions": round(total_contributions, 2),
                "formatted_contributions": format_indian_currency(total_contributions),
                "target_amount": req.near_target_amount,
                "formatted_target": format_indian_currency(req.near_target_amount),
                "projected_short_fv": round(projected_short_fv, 2),
                "formatted_projected": format_indian_currency(projected_short_fv),
                "ltcg_tax": round(ltcg_tax, 2),
                "formatted_tax": format_indian_currency(ltcg_tax),
                "post_tax_corpus": round(post_tax_corpus, 2),
                "formatted_post_tax": format_indian_currency(post_tax_corpus),
                "real_purchasing_power_today": round(real_purchasing_power_today, 2),
                "formatted_real_power": format_indian_currency(real_purchasing_power_today),
                "purchasing_power_note": purchasing_power_note,
                "required_cagr": 0.0,
                "career_leverage_needed": False,
                "needed_sip_at_15pct": 0.0,
                "verdict": "ON_TRACK",
                "message": f"ON TRACK FOR {req.near_target_date.year}! At your current {format_indian_currency(req.monthly_investable_sip)}/mo SIP" + 
                           (f" + {format_indian_currency(req.lump_sum_amount)} lump sum" if req.lump_sum_amount > 0 else "") +
                           f", you will build a gross portfolio of {format_indian_currency(projected_short_fv)} ({format_indian_currency(post_tax_corpus)} post-tax) by {req.near_target_date.strftime('%b %Y')}, hitting your {format_indian_currency(req.near_target_amount)} goal!"
            }

        # 2. Calculate Required Growth
        required_cagr = self._solve_required_cagr(
            current_pv=req.current_portfolio + req.lump_sum_amount,
            monthly_sip=req.monthly_investable_sip,
            target_fv=req.near_target_amount,
            months=months_remaining
        )
        
        fv_existing = (req.current_portfolio + req.lump_sum_amount) * ((1 + r_m) ** months_remaining)
        rem_target = max(0, req.near_target_amount - fv_existing)
        factor = ((1 + r_m) ** months_remaining - 1) / r_m if r_m > 0 else months_remaining
        needed_sip_at_15pct = max(req.monthly_investable_sip, rem_target / factor) if factor > 0 else req.monthly_investable_sip
        
        needed_take_home = needed_sip_at_15pct / req.savings_rate
        needed_ctc_annual = (needed_take_home / 0.85) * 12
        needed_ctc_lpa = needed_ctc_annual / 100000.0

        # 3. REALITY CHECK GOVERNOR (Detect impossible / gambling targets)
        # e.g., Target requiring > 40% CAGR, or > ₹100 LPA CTC in < 3 years for multi-crore goals
        is_unrealistic = (
            required_cagr > 0.40 or 
            (needed_ctc_lpa > 150.0 and months_remaining < 36 and req.near_target_amount >= 10000000.0) or
            (months_remaining <= 12 and req.near_target_amount >= 5000000.0 and total_contributions < (req.near_target_amount * 0.20))
        )

        if is_unrealistic:
            # Calculate safe realistic horizon using the user's configured CAGR with step-up SIP
            safe_months = self._solve_safe_months(
                current_pv=req.current_portfolio + req.lump_sum_amount,
                initial_sip=req.monthly_investable_sip,
                target_fv=req.near_target_amount,
                step_up_pct=req.annual_step_up_pct,
                safe_cagr=effective_cagr
            )
            safe_years = round(safe_months / 12.0, 1)

            return {
                "months_remaining": months_remaining,
                "years_remaining": round(years_remaining, 1),
                "total_contributions": round(total_contributions, 2),
                "formatted_contributions": format_indian_currency(total_contributions),
                "target_amount": req.near_target_amount,
                "formatted_target": format_indian_currency(req.near_target_amount),
                "projected_short_fv": round(projected_short_fv, 2),
                "formatted_projected": format_indian_currency(projected_short_fv),
                "ltcg_tax": round(ltcg_tax, 2),
                "formatted_tax": format_indian_currency(ltcg_tax),
                "post_tax_corpus": round(post_tax_corpus, 2),
                "formatted_post_tax": format_indian_currency(post_tax_corpus),
                "real_purchasing_power_today": round(real_purchasing_power_today, 2),
                "formatted_real_power": format_indian_currency(real_purchasing_power_today),
                "purchasing_power_note": purchasing_power_note,
                "required_cagr": round(required_cagr, 4),
                "career_leverage_needed": True,
                "needed_sip_at_15pct": round(needed_sip_at_15pct, 2),
                "formatted_needed_sip": format_indian_currency(needed_sip_at_15pct),
                "needed_ctc_annual_lpa": round(needed_ctc_lpa, 2),
                "formatted_needed_ctc": f"₹{needed_ctc_lpa:.1f} LPA",
                "verdict": "UNREALISTIC_TIMELINE",
                "safe_alternative_years": safe_years,
                "message": (
                    f"REALITY CHECK ALERT: Reaching {format_indian_currency(req.near_target_amount)} in only {months_remaining} months "
                    f"is mathematically impossible without speculative gambling. No mutual fund or safe asset generates a required {required_cagr*100:.0f}% CAGR. "
                    f"In {months_remaining} months, your current plan will safely accumulate {format_indian_currency(projected_short_fv)}. "
                    f"To reach {format_indian_currency(req.near_target_amount)} safely at 14% market CAGR, extend your horizon to approximately {safe_years} years."
                )
            }

        # 4. Standard Career Leverage Required Scenario
        return {
            "months_remaining": months_remaining,
            "years_remaining": round(years_remaining, 1),
            "total_contributions": round(total_contributions, 2),
            "formatted_contributions": format_indian_currency(total_contributions),
            "target_amount": req.near_target_amount,
            "formatted_target": format_indian_currency(req.near_target_amount),
            "projected_short_fv": round(projected_short_fv, 2),
            "formatted_projected": format_indian_currency(projected_short_fv),
            "ltcg_tax": round(ltcg_tax, 2),
            "formatted_tax": format_indian_currency(ltcg_tax),
            "post_tax_corpus": round(post_tax_corpus, 2),
            "formatted_post_tax": format_indian_currency(post_tax_corpus),
            "real_purchasing_power_today": round(real_purchasing_power_today, 2),
            "formatted_real_power": format_indian_currency(real_purchasing_power_today),
            "purchasing_power_note": purchasing_power_note,
            "required_cagr": round(required_cagr, 4),
            "career_leverage_needed": True,
            "needed_sip_at_15pct": round(needed_sip_at_15pct, 2),
            "formatted_needed_sip": format_indian_currency(needed_sip_at_15pct),
            "needed_ctc_annual_lpa": round(needed_ctc_lpa, 2),
            "formatted_needed_ctc": f"₹{needed_ctc_lpa:.1f} LPA",
            "verdict": "CAREER_LEVERAGE_REQUIRED",
            "message": f"BLUNT ADVISOR VERDICT: To hit {format_indian_currency(req.near_target_amount)} by {req.near_target_date.year} (in {months_remaining} months), your current {format_indian_currency(req.monthly_investable_sip)}/mo SIP falls short. Market returns alone cannot bridge the gap without an unrealistic {required_cagr*100:.0f}% CAGR. You MUST scale your monthly SIP to {format_indian_currency(needed_sip_at_15pct)}/mo (requires CTC jump to ~₹{needed_ctc_lpa:.1f} LPA)."
        }

    def generate_career_roadmap(self, req: TrajectoryRequest) -> List[CareerMilestoneProjection]:
        start_year = date.today().year
        end_year = max(start_year + 1, req.near_target_date.year)
        
        base_ctc = req.current_ctc_annual / 100000.0
        r_m = (1 + req.assumed_cagr) ** (1/12) - 1
        portfolio = req.current_portfolio + req.lump_sum_amount
        projections = []
        current_sip = req.monthly_investable_sip

        roles = [
            "Entry Level Specialist",
            "Mid-Level Professional (Skill Jump)",
            "Senior Specialist / Lead",
            "Staff Lead / Technical Lead",
            "Manager / Senior Architect",
            "Principal / Practice Lead",
            "Director / Department Head",
            "Vice President / Business Leader",
            "Executive / Enterprise Founder",
            "Partner / Strategic Investor",
            "Managing Director / Angel Backer",
            "Principal Partner / Board Member",
            "Family Office Founder / Chairman"
        ]

        for idx, year in enumerate(range(start_year, end_year + 1)):
            role_idx = min(idx, len(roles) - 1)
            role = roles[role_idx]

            if idx == 0:
                ctc_lpa = base_ctc
                monthly_sip = req.monthly_investable_sip
            else:
                growth_factor = 1.10 + min(0.04, idx * 0.005) # Realistic 10-14% CTC growth
                base_ctc = base_ctc * growth_factor
                ctc_lpa = base_ctc
                current_sip = current_sip * (1 + req.annual_step_up_pct)
                monthly_sip = current_sip

            for _ in range(12):
                try:
                    portfolio = (portfolio + monthly_sip) * (1 + r_m)
                except OverflowError:
                    portfolio = 1e12

            projections.append(CareerMilestoneProjection(
                year=year,
                role=role,
                suggested_ctc_lpa=round(ctc_lpa, 2),
                monthly_sip=round(monthly_sip, 2),
                projected_corpus_eoy=round(portfolio, 2),
                formatted_ctc=f"₹{ctc_lpa:.1f} LPA",
                formatted_sip=f"{format_indian_currency(monthly_sip)}/mo",
                formatted_corpus=format_indian_currency(portfolio)
            ))

        return projections

    def _solve_required_cagr(self, current_pv: float, monthly_sip: float, target_fv: float, months: int) -> float:
        low, high = 0.0, 50.0
        for _ in range(100):
            mid = (low + high) / 2
            r = mid
            if r == 0:
                fv = current_pv + monthly_sip * months
            else:
                try:
                    fv = current_pv * ((1 + r) ** months) + monthly_sip * (((1 + r) ** months - 1) / r)
                except OverflowError:
                    fv = float('inf')
            if fv < target_fv:
                low = mid
            else:
                high = mid
        req_monthly = (low + high) / 2
        try:
            return ((1 + req_monthly) ** 12) - 1
        except OverflowError:
            return 999.0

    def _solve_safe_months(self, current_pv: float, initial_sip: float, target_fv: float, step_up_pct: float, safe_cagr: float) -> int:
        r_m = (1 + safe_cagr) ** (1/12) - 1
        corpus = current_pv
        current_sip = initial_sip
        
        for m in range(1, 360):  # max 30 years
            if m > 1 and (m % 12 == 1):
                current_sip = current_sip * (1 + step_up_pct)
            corpus = (corpus + current_sip) * (1 + r_m)
            if corpus >= target_fv:
                return m
        return 180  # fallback 15 years