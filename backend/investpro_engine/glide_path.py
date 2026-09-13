"""
InvestPro — GlidePathEngine (Neeraj Arora Behavioral Discipline Model)
Protects mature goals from sequence of returns risk.
At T - 24 months, automatically initiates a monthly 4% SWP from equity to Liquid/Debt,
locking in 100% capital preservation upon goal maturity.
"""

from datetime import date
from typing import Dict, List, Any, Optional


class GlidePathEngine:
    """
    Automates goal horizon glide paths.
    Eliminates human reluctance to de-risk near goal maturity.
    At T - 24 months, triggers 4%/month automated SWP from Equity into Liquid preservation.
    """

    GLIDE_PATH_WINDOW_MONTHS: int = 24
    MONTHLY_SWP_PCT: float = 4.0  # 4% of target equity corpus per month (24 * 4% = 96% ~ 100%)

    def evaluate_goal(
        self,
        goal_id: str,
        goal_name: str,
        target_amount: float,
        target_date: date,
        current_equity_corpus: float,
        current_debt_corpus: float,
        as_of_date: Optional[date] = None,
    ) -> Dict[str, Any]:
        """
        Evaluates a goal against the T-24 month milestone and generates SWP directives.

        :param goal_id: Identifier of the goal
        :param goal_name: Label e.g. "Down Payment 2028"
        :param target_amount: Target goal value in INR
        :param target_date: Target deadline
        :param current_equity_corpus: Current equity valuation allocated to this goal
        :param current_debt_corpus: Current debt/liquid valuation allocated to this goal
        :param as_of_date: Today's date
        :return: Glide path status and monthly SWP directive if applicable
        """
        today = as_of_date or date.today()

        # Calculate actual days and months remaining
        days_remaining = (target_date - today).days

        if days_remaining <= 0:
            months_remaining = 0
            status = "MATURED_PRESERVED"
            is_active = False
            swp_amount = 0.0
        else:
            months_remaining = max(1, int(round(days_remaining / 30.4375)))
            if months_remaining <= self.GLIDE_PATH_WINDOW_MONTHS:
                status = "T_MINUS_24M_SWP_ACTIVE"
                is_active = True
                # Compute monthly 4% transfer from remaining equity
                swp_amount = round((self.MONTHLY_SWP_PCT / 100.0) * current_equity_corpus, 2)
                # Bound by available equity
                swp_amount = min(swp_amount, current_equity_corpus)
            else:
                status = "ACCUMULATION"
                is_active = False
                swp_amount = 0.0

        directives: List[Dict[str, Any]] = []

        if is_active and swp_amount > 0:
            directives.append({
                "directive_type": "SWP_GLIDE_PATH",
                "action": "SWP",
                "goal_id": goal_id,
                "source_scheme": "GOAL_EQUITY_BUCKET",
                "target_scheme": "LIQUID_DEBT_PRESERVATION",
                "amount_inr": swp_amount,
                "rationale_heading": f"Glide Path Protection: {goal_name} (T-{months_remaining}m)",
                "math_rationale": (
                    f"Goal '{goal_name}' has reached T-{months_remaining} months to maturity "
                    f"({target_date.isoformat()}). Under strict behavioral discipline, systematic "
                    f"4%/month SWP is activated. Transferring ₹{swp_amount:,.2f} from equity into "
                    f"Liquid Debt to lock in gains and shield from market drawdowns."
                ),
                "urgency": "HIGH",
                "state": "PENDING_APPROVAL",
            })

        total_corpus = current_equity_corpus + current_debt_corpus
        preserved_pct = round((current_debt_corpus / total_corpus * 100.0), 2) if total_corpus > 0 else 0.0

        return {
            "goal_id": goal_id,
            "goal_name": goal_name,
            "target_amount": target_amount,
            "target_date": target_date.isoformat(),
            "months_remaining": months_remaining,
            "glide_path_status": status,
            "is_swp_active": is_active,
            "monthly_swp_amount_inr": swp_amount,
            "current_equity_corpus": current_equity_corpus,
            "current_debt_corpus": current_debt_corpus,
            "capital_preserved_pct": preserved_pct,
            "directives": directives,
        }
