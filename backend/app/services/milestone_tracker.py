from dataclasses import dataclass
from typing import Dict, Any, List
from app.services.ghost_trajectory import format_indian_currency

class FinancialFreedomEngine:
    """
    25x FIRE & "1% Daily Market Freedom Rule" Tracker
    
    Principles:
    1. Milestone Stages:
       • Stage 1: First ₹1 Lakh (Discipline Anchor)
       • Stage 2: First ₹10 Lakhs (Compounding Engine Ignited)
       • Stage 3: First ₹50 Lakhs (Velocity Stage - Capital works harder than active savings)
       • Stage 4: First ₹1.00 Crore (The Hardest Milestone achieved)
       • Stage 5: ₹3.00 Crore / 25x FIRE (Permanent Financial Independence)
    
    2. The "1% Daily Market Rule":
       Calculates the exact portfolio corpus at which a 1% standard daily market swing
       equals 1 full month of your current salary.
    """

    def calculate_milestones(
        self,
        current_corpus: float = 0.0,
        monthly_salary: float = 85000.0,
        annual_ctc_lpa: float = 12.0
    ) -> Dict[str, Any]:
        
        # Monthly take-home estimate
        actual_monthly_salary = monthly_salary if monthly_salary > 0 else (annual_ctc_lpa * 100000.0 / 12.0) * 0.85

        # 1% Daily Freedom Corpus: Corpus * 0.01 = Monthly Salary => Corpus = Monthly Salary * 100
        corpus_for_1pct_monthly = actual_monthly_salary * 100.0
        pct_to_1pct_freedom = min(100.0, (current_corpus / corpus_for_1pct_monthly) * 100.0) if corpus_for_1pct_monthly > 0 else 0.0

        # 25x Annual Expense FIRE Target (assuming 60% of monthly income is expenses)
        annual_expenses = (actual_monthly_salary * 0.60) * 12.0
        fire_25x_target = annual_expenses * 25.0
        pct_to_fire = min(100.0, (current_corpus / fire_25x_target) * 100.0) if fire_25x_target > 0 else 0.0

        milestones_ladder = [
            {
                "stage": 1,
                "name": "First ₹1.00 Lakh",
                "target_amount": 100000.0,
                "formatted_target": "₹1.00 Lakh",
                "tagline": "Discipline Anchor & Habit Formation",
                "is_achieved": current_corpus >= 100000.0,
                "progress_pct": min(100.0, (current_corpus / 100000.0) * 100.0)
            },
            {
                "stage": 2,
                "name": "First ₹10.00 Lakhs",
                "target_amount": 1000000.0,
                "formatted_target": "₹10.00 Lakhs",
                "tagline": "Compounding Engine Ignition Stage",
                "is_achieved": current_corpus >= 1000000.0,
                "progress_pct": min(100.0, (current_corpus / 1000000.0) * 100.0)
            },
            {
                "stage": 3,
                "name": "First ₹50.00 Lakhs",
                "target_amount": 5000000.0,
                "formatted_target": "₹50.00 Lakhs",
                "tagline": "Velocity Phase (Portfolio Growth > Annual Savings)",
                "is_achieved": current_corpus >= 5000000.0,
                "progress_pct": min(100.0, (current_corpus / 5000000.0) * 100.0)
            },
            {
                "stage": 4,
                "name": "The ₹1.00 Crore Milestone",
                "target_amount": 10000000.0,
                "formatted_target": "₹1.00 Crore",
                "tagline": "The Hardest Mountain Climbed",
                "is_achieved": current_corpus >= 10000000.0,
                "progress_pct": min(100.0, (current_corpus / 10000000.0) * 100.0)
            },
            {
                "stage": 5,
                "name": "₹3.00 Crores (25x FIRE)",
                "target_amount": max(30000000.0, fire_25x_target),
                "formatted_target": format_indian_currency(max(30000000.0, fire_25x_target)),
                "tagline": "Permanent Financial Independence & SWP Machine",
                "is_achieved": current_corpus >= max(30000000.0, fire_25x_target),
                "progress_pct": min(100.0, (current_corpus / max(30000000.0, fire_25x_target)) * 100.0)
            }
        ]

        current_daily_1pct_gain = current_corpus * 0.01

        return {
            "current_portfolio_corpus": current_corpus,
            "formatted_current_corpus": format_indian_currency(current_corpus),
            "estimated_monthly_salary": round(actual_monthly_salary, 2),
            "formatted_monthly_salary": format_indian_currency(actual_monthly_salary),
            "one_pct_daily_rule": {
                "current_1pct_daily_value": round(current_daily_1pct_gain, 2),
                "formatted_current_1pct_daily": format_indian_currency(current_daily_1pct_gain),
                "target_corpus_for_salary_match": round(corpus_for_1pct_monthly, 2),
                "formatted_target_corpus": format_indian_currency(corpus_for_1pct_monthly),
                "progress_pct": round(pct_to_1pct_freedom, 1),
                "insight": (
                    f"When your portfolio reaches {format_indian_currency(corpus_for_1pct_monthly)}, "
                    f"a standard 1% green market day generates {format_indian_currency(actual_monthly_salary)} "
                    f"— equal to your entire monthly paycheck without you lifting a finger."
                )
            },
            "fire_25x": {
                "target_25x_corpus": round(fire_25x_target, 2),
                "formatted_25x_corpus": format_indian_currency(fire_25x_target),
                "annual_living_expenses": round(annual_expenses, 2),
                "formatted_annual_expenses": format_indian_currency(annual_expenses),
                "progress_pct": round(pct_to_fire, 1),
                "safe_monthly_swp_4pct": round((fire_25x_target * 0.04) / 12.0, 2),
                "formatted_safe_swp": format_indian_currency((fire_25x_target * 0.04) / 12.0)
            },
            "milestone_ladder": milestones_ladder
        }
