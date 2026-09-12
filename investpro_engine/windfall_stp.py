"""
InvestPro — WindfallSTPRouter
Intercepts sudden lump-sum inflows (bonuses, asset sales, windfalls).
Directs 100% into a verified Liquid Fund and schedules a deterministic 20-week STP into Anchor Equity.
Shields the user from emotional market timing and 'all-in' regret.
"""

from datetime import date, timedelta
from typing import Dict, List, Any, Optional


class WindfallSTPRouter:
    """
    Automates rupee-cost averaging for lump-sum capital injections.
    Strategy:
    1. Initial Lump Sum -> 100% parked into Liquid Fund (generates ~6.5-7% yield).
    2. Weekly Systematic Transfer Plan (STP) over 20 weeks (5.0% per week).
    3. Destination -> Anchor India Equity (Nifty 50 Index Fund Direct Growth).
    """

    STP_DURATION_WEEKS: int = 20
    WEEKLY_TRANSFER_PCT: float = 5.0  # 5% per week = 100% over 20 weeks
    DEFAULT_PARKING_FUND: str = "Parag Parikh Liquid Fund Direct - Growth"
    DEFAULT_ANCHOR_EQUITY: str = "HDFC Nifty 50 Index Fund Direct - Growth"

    def __init__(
        self,
        parking_fund: Optional[str] = None,
        anchor_equity_fund: Optional[str] = None,
        stp_weeks: int = 20,
    ):
        self.parking_fund = parking_fund or self.DEFAULT_PARKING_FUND
        self.anchor_equity_fund = anchor_equity_fund or self.DEFAULT_ANCHOR_EQUITY
        self.stp_weeks = stp_weeks

    def route_windfall(
        self,
        lump_sum_amount: float,
        start_date: Optional[date] = None,
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Processes a lump-sum amount and builds the 20-week STP deployment schedule.

        :param lump_sum_amount: The lump-sum inflow in INR
        :param start_date: Starting date for the first transfer
        :param user_id: User identifier
        :return: Deployment plan and directives
        """
        amt = float(lump_sum_amount)
        if amt <= 0:
            return {"status": "INVALID_AMOUNT", "schedule": [], "directives": []}

        today = start_date or date.today()
        weekly_installment = round(amt / self.stp_weeks, 2)

        # Initial parking directive
        parking_directive = {
            "directive_type": "STP_TRANSFER",
            "action": "BUY",
            "source_scheme": "BANK_SAVINGS_ACCOUNT",
            "target_scheme": self.parking_fund,
            "amount_inr": amt,
            "rationale_heading": f"Windfall Intercept: Park ₹{amt:,.2f} in Liquid Fund",
            "math_rationale": (
                f"Lump sum of ₹{amt:,.2f} intercepted. Rather than risking full deployment "
                f"at a potential local peak, 100% is routed to {self.parking_fund} to accrue daily "
                f"liquid interest while initiating a deterministic 20-week STP."
            ),
            "urgency": "HIGH",
            "state": "PENDING_APPROVAL",
        }

        # 20-week schedule
        schedule: List[Dict[str, Any]] = []
        cumulative_deployed = 0.0

        for week in range(1, self.stp_weeks + 1):
            transfer_date = today + timedelta(weeks=week)
            # Adjust last week to avoid 1-2 paise rounding drift
            if week == self.stp_weeks:
                current_transfer = round(amt - cumulative_deployed, 2)
            else:
                current_transfer = weekly_installment

            cumulative_deployed += current_transfer

            schedule.append({
                "installment_number": week,
                "scheduled_date": transfer_date.isoformat(),
                "transfer_amount_inr": current_transfer,
                "source_fund": self.parking_fund,
                "destination_fund": self.anchor_equity_fund,
                "cumulative_deployed_inr": round(cumulative_deployed, 2),
                "remaining_in_liquid_inr": round(amt - cumulative_deployed, 2),
            })

        return {
            "status": "STP_SCHEDULE_GENERATED",
            "total_lump_sum_inr": amt,
            "duration_weeks": self.stp_weeks,
            "weekly_installment_inr": weekly_installment,
            "parking_fund": self.parking_fund,
            "anchor_equity_fund": self.anchor_equity_fund,
            "parking_directive": parking_directive,
            "schedule": schedule,
        }
