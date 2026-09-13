"""
InvestPro — XIRRCalculator
High-precision Extended Internal Rate of Return (XIRR) calculator.
Processes irregular cash flows from the reconciliation ledger and terminal portfolio valuation.
Implements Newton-Raphson with bisection fallback and optional SciPy optimization pipeline.
"""

from datetime import date, datetime
from typing import List, Tuple, Union, Optional
import math


class XIRRCalculator:
    """
    Computes annualized internal rate of return over irregular cash flow dates.
    Zero external dependency core (pure Python Newton-Raphson) with SciPy fallback.
    """

    DEFAULT_GUESS: float = 0.10
    MAX_ITERATIONS: int = 100
    TOLERANCE: float = 1e-7

    @classmethod
    def calculate_xirr(
        cls,
        cash_flows: List[Tuple[Union[date, datetime, str], float]],
        guess: float = 0.10,
    ) -> Optional[float]:
        """
        Calculates XIRR given a list of (date, amount) tuples.
        Amounts: Negative for inflows/purchases, positive for redemptions/terminal valuation.

        :param cash_flows: List of (date, cash_flow_amount)
        :param guess: Initial rate of return guess (e.g. 0.10 for 10%)
        :return: Annualized return as a decimal (e.g. 0.154 for 15.4%), or None if non-convergent
        """
        if not cash_flows or len(cash_flows) < 2:
            return None

        # Normalize and sort dates
        normalized_flows: List[Tuple[date, float]] = []
        for d, amt in cash_flows:
            if isinstance(d, str):
                dt = date.fromisoformat(d)
            elif isinstance(d, datetime):
                dt = d.date()
            else:
                dt = d
            normalized_flows.append((dt, float(amt)))

        normalized_flows.sort(key=lambda x: x[0])

        # Validate that we have at least one positive and one negative cash flow
        has_pos = any(amt > 0 for _, amt in normalized_flows)
        has_neg = any(amt < 0 for _, amt in normalized_flows)
        if not (has_pos and has_neg):
            return None

        d0 = normalized_flows[0][0]

        # Convert to fractional year intervals
        # t_i = (d_i - d_0) / 365.0
        intervals: List[Tuple[float, float]] = []
        for dt, amt in normalized_flows:
            t = (dt - d0).days / 365.0
            intervals.append((t, amt))

        # Try Newton-Raphson method first
        rate = cls._newton_raphson(intervals, guess)
        if rate is not None:
            return round(rate, 6)

        # Fallback to Bisection search method in range [-0.99, 10.0]
        rate = cls._bisection_search(intervals, low=-0.99, high=10.0)
        if rate is not None:
            return round(rate, 6)

        # Fallback to SciPy optimize if available
        try:
            from scipy import optimize

            def npv_func(r):
                return sum(amt / ((1.0 + r) ** t) for t, amt in intervals)

            scipy_rate = optimize.newton(npv_func, guess, tol=cls.TOLERANCE, maxiter=cls.MAX_ITERATIONS)
            return round(float(scipy_rate), 6)
        except Exception:
            return None

    @classmethod
    def _newton_raphson(cls, intervals: List[Tuple[float, float]], guess: float) -> Optional[float]:
        r = guess
        for _ in range(cls.MAX_ITERATIONS):
            if r <= -1.0:
                r = -0.99

            npv = 0.0
            d_npv = 0.0

            for t, amt in intervals:
                base = 1.0 + r
                if base <= 0:
                    return None
                denom = base ** t
                npv += amt / denom
                if t > 0:
                    d_npv -= (t * amt) / (base ** (t + 1.0))

            if abs(npv) < cls.TOLERANCE:
                return r

            if abs(d_npv) < 1e-12:
                # Derivative too close to zero, Newton-Raphson failed
                return None

            step = npv / d_npv
            r = r - step

            if abs(step) < cls.TOLERANCE:
                return r

        return None

    @classmethod
    def _bisection_search(
        cls,
        intervals: List[Tuple[float, float]],
        low: float = -0.99,
        high: float = 10.0,
    ) -> Optional[float]:
        def npv(r: float) -> float:
            val = 0.0
            for t, amt in intervals:
                base = 1.0 + r
                if base <= 0:
                    return float("inf")
                val += amt / (base ** t)
            return val

        f_low = npv(low)
        f_high = npv(high)

        if f_low * f_high > 0:
            # Root is not bracketed in [low, high]
            return None

        for _ in range(cls.MAX_ITERATIONS):
            mid = (low + high) / 2.0
            f_mid = npv(mid)

            if abs(f_mid) < cls.TOLERANCE or (high - low) / 2.0 < cls.TOLERANCE:
                return mid

            if f_low * f_mid < 0:
                high = mid
                f_high = f_mid
            else:
                low = mid
                f_low = f_mid

        return (low + high) / 2.0
