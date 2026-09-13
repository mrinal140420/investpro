"""
InvestPro — RollingBacktester
7-Year Rolling Return & Probability Engine across 15-year lookback (2008-2026).
Computes rolling-window CAGR/XIRR to identify funds delivering Median >= 15% and Prob(<10%) <= 5%.
"""

from datetime import date, timedelta
from typing import Dict, List, Any, Tuple, Optional
import math
import numpy as np


class RollingBacktester:
    """
    Simulates rolling 7-year investment windows across AMFI/NSE historical series.
    Eliminates point-to-point start-date bias and validates long-term compounding consistency.
    """

    DEFAULT_WINDOW_DAYS: int = 2555  # 7 Years = 7 * 365 days
    MIN_TRACK_RECORD_YEARS: float = 7.0

    def __init__(self, window_years: int = 7):
        self.window_years = window_years
        self.window_days = int(window_years * 365.25)

    def calculate_rolling_returns(
        self,
        daily_nav_series: List[Tuple[date, float]],
        scheme_name: str = "Factor Strategy",
        isin: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Calculates all rolling 7-year annualized returns for a given daily NAV/index series.

        :param daily_nav_series: List of (date, nav) tuples sorted chronologically
        :param scheme_name: Fund or Strategy name
        :param isin: Fund identifier
        :return: Metrics dictionary including median, min, max, probability of return < 10%
        """
        if not daily_nav_series or len(daily_nav_series) < 500:
            return {
                "status": "INSUFFICIENT_HISTORY",
                "scheme_name": scheme_name,
                "isin": isin,
                "window_years": self.window_years,
                "passed_filters": False,
            }

        daily_nav_series.sort(key=lambda x: x[0])
        start_date = daily_nav_series[0][0]
        end_date = daily_nav_series[-1][0]
        total_days = (end_date - start_date).days

        if total_days < self.window_days:
            return {
                "status": "TRACK_RECORD_UNDER_7_YEARS",
                "scheme_name": scheme_name,
                "isin": isin,
                "total_history_days": total_days,
                "passed_filters": False,
            }

        # Date to index lookup for fast rolling window extraction
        dates = [d for d, _ in daily_nav_series]
        navs = [n for _, n in daily_nav_series]

        rolling_cagrs: List[float] = []
        n_points = len(daily_nav_series)

        for i in range(n_points):
            t0_date = dates[i]
            target_end = t0_date + timedelta(days=self.window_days)
            if target_end > end_date:
                break

            # Find matching or closest trading day near target_end
            # Binary search or search window
            idx = np.searchsorted(dates, target_end)
            if idx >= n_points:
                idx = n_points - 1

            actual_end_date = dates[idx]
            actual_days = (actual_end_date - t0_date).days

            # Ensure window is close to 7 years (within 30 days)
            if abs(actual_days - self.window_days) <= 45:
                start_nav = navs[i]
                end_nav = navs[idx]
                if start_nav > 0 and end_nav > 0:
                    years = actual_days / 365.25
                    cagr = ((end_nav / start_nav) ** (1.0 / years) - 1.0) * 100.0
                    rolling_cagrs.append(cagr)

        if not rolling_cagrs:
            return {
                "status": "NO_VALID_WINDOWS",
                "scheme_name": scheme_name,
                "passed_filters": False,
            }

        cagr_arr = np.array(rolling_cagrs)
        median_ret = float(np.median(cagr_arr))
        mean_ret = float(np.mean(cagr_arr))
        min_ret = float(np.min(cagr_arr))
        max_ret = float(np.max(cagr_arr))
        std_ret = float(np.std(cagr_arr))

        prob_under_10 = float(np.mean(cagr_arr < 10.0) * 100.0)
        prob_under_0 = float(np.mean(cagr_arr < 0.0) * 100.0)
        prob_above_15 = float(np.mean(cagr_arr >= 15.0) * 100.0)

        # Optimization Filters: Median >= 15.0% and Prob(<10%) <= 5.0%
        passed_filters = bool((median_ret >= 15.0) and (prob_under_10 <= 5.0))

        return {
            "status": "SUCCESS",
            "scheme_name": scheme_name,
            "isin": isin,
            "window_years": self.window_years,
            "rolling_windows_count": len(rolling_cagrs),
            "history_range": f"{start_date.isoformat()} to {end_date.isoformat()}",
            "median_rolling_return": round(median_ret, 2),
            "mean_rolling_return": round(mean_ret, 2),
            "min_rolling_return": round(min_ret, 2),
            "max_rolling_return": round(max_ret, 2),
            "standard_deviation": round(std_ret, 2),
            "negative_periods_pct": round(prob_under_0, 2),
            "prob_under_10pct": round(prob_under_10, 2),
            "prob_above_15pct": round(prob_above_15, 2),
            "passed_filters": passed_filters,
        }

    @classmethod
    def generate_synthetic_historical_series(
        cls,
        cagr_mean: float = 0.16,
        volatility: float = 0.18,
        years: int = 16,
        start_date: Optional[date] = None,
        seed: int = 42,
    ) -> List[Tuple[date, float]]:
        """
        Generates standard multi-year Geometric Brownian Motion NAV series for testing/backtesting.
        """
        np.random.seed(seed)
        st = start_date or date(2008, 1, 1)
        total_days = int(years * 365.25)
        dt = 1.0 / 365.25

        mu = cagr_mean
        sigma = volatility

        # Generate daily returns
        daily_returns = np.random.normal((mu - 0.5 * sigma**2) * dt, sigma * np.sqrt(dt), total_days)

        nav = 10.0
        series: List[Tuple[date, float]] = []

        curr_date = st
        for ret in daily_returns:
            nav = nav * np.exp(ret)
            series.append((curr_date, round(nav, 4)))
            curr_date += timedelta(days=1)

        return series
