from dataclasses import dataclass
from typing import Dict, Any, Optional, List
from datetime import date, datetime
from app.services.ghost_trajectory import format_indian_currency

class GoalSlicingEngine:
    """
    Goal Slicing & Reverse-EMI Engine (v6.2)
    
    Supports:
    • Flat SIP vs Step-Up SIP (10%, 15%, 20% Annual / Semi-Annual Step-Up)
    • Horizon rules (0% equity for <18m, 30% for 18-48m, Barbell for 48m+)
    • Affordability & Feasibility Engine (Realistic monthly starting SIPs)
    • Loan interest savings vs 14% personal loan/credit card EMI
    """

    def calculate_goal_plan(
        self,
        goal_name: str,
        target_amount: float,
        target_date_str: str,
        current_saved: float = 0.0,
        step_up_pct: float = 0.10,  # 10% default step-up
        step_up_frequency: str = "ANNUAL", # "ANNUAL", "SEMI_ANNUAL", "NONE"
        estimated_loan_apr_pct: float = 14.0
    ) -> Dict[str, Any]:
        
        # Parse target date
        try:
            target_dt = datetime.strptime(target_date_str, "%Y-%m-%d").date()
        except ValueError:
            target_dt = date.today()

        today = date.today()
        total_days = max(1, (target_dt - today).days)
        months_remaining = max(1, total_days // 30)
        years_remaining = round(months_remaining / 12.0, 2)

        # Horizon Asset-Liability Rules
        if months_remaining <= 18:
            horizon = "SHORT_TERM"
            expected_cagr = 6.8  # Liquid / Overnight / Arbitrage
            vehicle = "Parag Parikh Liquid Fund / Sovereign Overnight"
            vehicle_details = "100% Sovereign T-Bills & High-Yield Debt. Zero stock market risk."
            equity_allowed = False
            max_equity_pct = 0.0
            groww_url = "https://groww.in/mutual-funds/parag-parikh-liquid-fund-direct-growth"
            advisor_verdict = "0% Equity Lockout: Goal is under 18 months. Never gamble short-term money in equities."

        elif months_remaining <= 48:
            horizon = "MEDIUM_TERM"
            expected_cagr = 9.5  # Conservative Equity Savings / Arbitrage Hybrid
            vehicle = "Conservative Multi-Asset / Equity Savings Fund"
            vehicle_details = "70% Debt/Arbitrage + 30% Large-Cap Large Blend Equity."
            equity_allowed = True
            max_equity_pct = 30.0
            groww_url = "https://groww.in/mutual-funds/icici-prudential-equity-savings-fund-direct-growth"
            advisor_verdict = "Controlled Growth: Capped at 30% large-cap equity to cushion market drawdowns before deadline."

        else:
            horizon = "LONG_TERM"
            expected_cagr = 14.5  # Core Barbell Multi-Asset
            vehicle = "Aggressive Barbell Strategy (Small Cap + Momentum + Nifty 50)"
            vehicle_details = "Core high-alpha compounding engine for multi-year wealth accumulation."
            equity_allowed = True
            max_equity_pct = 85.0
            groww_url = "https://groww.in/mutual-funds/hdfc-nifty-50-index-fund-direct-growth"
            advisor_verdict = "Full Compounding Power: 4+ year horizon allows aggressive market equity compounding."

        monthly_rate = (expected_cagr / 100.0) / 12.0
        fv_existing = current_saved * ((1 + monthly_rate) ** months_remaining)
        shortfall = max(0.0, target_amount - fv_existing)

        # 1. Flat SIP calculation (No Step-Up)
        if monthly_rate > 0 and months_remaining > 0:
            denom_flat = ((1 + monthly_rate) ** months_remaining) - 1
            flat_monthly_sip = shortfall * (monthly_rate / denom_flat) if denom_flat > 0 else shortfall / months_remaining
        else:
            flat_monthly_sip = shortfall / months_remaining
        flat_monthly_sip = round(flat_monthly_sip, 2)

        # 2. Step-Up Starting SIP calculation (Annual Step-Up)
        # Solve for starting_sip S such that compounding sum with step-up equals shortfall
        effective_step_pct = step_up_pct if step_up_frequency != "NONE" else 0.0
        starting_step_up_sip = self._solve_starting_sip_with_stepup(
            shortfall=shortfall,
            months=months_remaining,
            monthly_rate=monthly_rate,
            step_up_pct=effective_step_pct,
            frequency=step_up_frequency
        )

        # Total self contributions
        total_self_contribution_flat = round((flat_monthly_sip * months_remaining) + current_saved, 2)
        total_self_contribution_stepup = round(self._calculate_total_contributed(starting_step_up_sip, months_remaining, effective_step_pct, step_up_frequency) + current_saved, 2)
        
        interest_bonus = max(0.0, target_amount - total_self_contribution_stepup)

        # Loan interest saved vs 14% loan
        loan_monthly_rate = (estimated_loan_apr_pct / 100.0) / 12.0
        if loan_monthly_rate > 0 and months_remaining > 0:
            denom_loan = ((1 + loan_monthly_rate) ** months_remaining) - 1
            if denom_loan > 0:
                loan_emi = target_amount * (loan_monthly_rate * ((1 + loan_monthly_rate) ** months_remaining)) / denom_loan
                total_loan_paid = loan_emi * months_remaining
                loan_interest_saved = max(0.0, total_loan_paid - target_amount)
            else:
                loan_interest_saved = 0.0
        else:
            loan_interest_saved = 0.0

        # Alternative Realistic Scenarios (If user can only afford e.g. ₹15,000/mo or ₹20,000/mo)
        budget_scenarios = []
        for affordable_sip in [10000.0, 15000.0, 20000.0, 25000.0]:
            if affordable_sip < flat_monthly_sip:
                accumulated_with_affordable = self._calculate_future_value(current_saved, affordable_sip, months_remaining, monthly_rate, effective_step_pct, step_up_frequency)
                months_needed_for_full_target = self._calculate_months_needed(current_saved, affordable_sip, target_amount, monthly_rate, effective_step_pct, step_up_frequency)
                budget_scenarios.append({
                    "affordable_sip": affordable_sip,
                    "formatted_affordable_sip": f"{format_indian_currency(affordable_sip)}/mo",
                    "accumulated_in_deadline": round(accumulated_with_affordable, 2),
                    "formatted_accumulated": format_indian_currency(accumulated_with_affordable),
                    "months_needed": months_needed_for_full_target,
                    "years_needed": round(months_needed_for_full_target / 12.0, 1)
                })

        return {
            "goal_name": goal_name,
            "target_amount": target_amount,
            "formatted_target": format_indian_currency(target_amount),
            "target_date": target_date_str,
            "months_remaining": months_remaining,
            "years_remaining": years_remaining,
            "horizon_category": horizon,
            "recommended_vehicle": vehicle,
            "vehicle_details": vehicle_details,
            "expected_cagr_pct": expected_cagr,
            "equity_allowed": equity_allowed,
            "max_equity_allocation_pct": max_equity_pct,
            "step_up_pct": effective_step_pct * 100,
            "step_up_frequency": step_up_frequency,
            "flat_monthly_sip": flat_monthly_sip,
            "formatted_flat_sip": f"{format_indian_currency(flat_monthly_sip)}/mo",
            "starting_stepup_sip": round(starting_step_up_sip, 2),
            "formatted_starting_stepup_sip": f"{format_indian_currency(starting_step_up_sip)}/mo",
            "total_self_contribution": total_self_contribution_stepup,
            "formatted_self_contribution": format_indian_currency(total_self_contribution_stepup),
            "interest_wealth_bonus": round(interest_bonus, 2),
            "formatted_interest_bonus": format_indian_currency(interest_bonus),
            "loan_interest_saved_estimate": round(loan_interest_saved, 2),
            "formatted_loan_saved": format_indian_currency(loan_interest_saved),
            "advisor_verdict": advisor_verdict,
            "budget_scenarios": budget_scenarios,
            "groww_deep_link": groww_url
        }

    def _solve_starting_sip_with_stepup(self, shortfall: float, months: int, monthly_rate: float, step_up_pct: float, frequency: str) -> float:
        if shortfall <= 0:
            return 0.0
        if step_up_pct == 0 or frequency == "NONE":
            if monthly_rate > 0 and months > 0:
                d = ((1 + monthly_rate) ** months) - 1
                return shortfall * (monthly_rate / d) if d > 0 else shortfall / months
            return shortfall / months

        low, high = 1.0, shortfall
        for _ in range(100):
            mid = (low + high) / 2.0
            fv = self._calculate_future_value(0.0, mid, months, monthly_rate, step_up_pct, frequency)
            if fv < shortfall:
                low = mid
            else:
                high = mid
        return round((low + high) / 2.0, 2)

    def _calculate_future_value(self, current_saved: float, starting_sip: float, months: int, monthly_rate: float, step_up_pct: float, frequency: str) -> float:
        corpus = current_saved
        sip = starting_sip
        step_interval = 12 if frequency == "ANNUAL" else (6 if frequency == "SEMI_ANNUAL" else (3 if frequency == "QUARTERLY" else 999))

        for m in range(1, months + 1):
            if m > 1 and ((m - 1) % step_interval == 0):
                sip = sip * (1 + step_up_pct)
            corpus = (corpus + sip) * (1 + monthly_rate)
        return corpus

    def _calculate_total_contributed(self, starting_sip: float, months: int, step_up_pct: float, frequency: str) -> float:
        total = 0.0
        sip = starting_sip
        step_interval = 12 if frequency == "ANNUAL" else (6 if frequency == "SEMI_ANNUAL" else (3 if frequency == "QUARTERLY" else 999))
        for m in range(1, months + 1):
            if m > 1 and ((m - 1) % step_interval == 0):
                sip = sip * (1 + step_up_pct)
            total += sip
        return total

    def _calculate_months_needed(self, current_saved: float, starting_sip: float, target: float, monthly_rate: float, step_up_pct: float, frequency: str) -> int:
        corpus = current_saved
        sip = starting_sip
        step_interval = 12 if frequency == "ANNUAL" else 6
        for m in range(1, 360):
            if m > 1 and ((m - 1) % step_interval == 0):
                sip = sip * (1 + step_up_pct)
            corpus = (corpus + sip) * (1 + monthly_rate)
            if corpus >= target:
                return m
        return 360
