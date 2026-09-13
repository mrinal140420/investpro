"""
InvestPro — CaptureRatioFilter
Calculates monthly Upside and Downside Capture Ratios relative to benchmark indices (Nifty 50 / 500 TRI).
Screens active funds for asymmetric alpha: Upside >= 90%, Downside <= 75%, Overall Ratio >= 1.25.
"""

from datetime import date
from typing import Dict, List, Any, Tuple, Optional
import numpy as np


class CaptureRatioFilter:
    """
    Evaluates mutual fund upside vs downside capture efficiency over monthly returns.
    Filters funds that participate in market upside while shielding downside drawdowns.
    """

    MIN_UPSIDE_CAPTURE: float = 90.0     # Captures >= 90% of bull market gains
    MAX_DOWNSIDE_CAPTURE: float = 75.0   # Cushions at least 25% of drawdowns (Downside <= 75%)
    MIN_OVERALL_RATIO: float = 1.25      # Overall Capture Ratio >= 1.25

    @classmethod
    def calculate_capture_ratios(
        cls,
        monthly_fund_returns: List[float],
        monthly_benchmark_returns: List[float],
        scheme_name: str = "Active Fund",
    ) -> Dict[str, Any]:
        """
        Calculates Upside and Downside capture ratios given synchronized monthly returns.

        :param monthly_fund_returns: List of monthly returns (e.g. 0.03 for +3%)
        :param monthly_benchmark_returns: Matching monthly benchmark returns
        :param scheme_name: Fund title
        :return: Metrics including upside capture, downside capture, and pass/fail verdict
        """
        if len(monthly_fund_returns) != len(monthly_benchmark_returns):
            raise ValueError("Fund and benchmark returns must have identical length")

        if len(monthly_fund_returns) < 12:
            return {
                "status": "INSUFFICIENT_MONTHS",
                "scheme_name": scheme_name,
                "passed_filters": False,
            }

        fund_arr = np.array(monthly_fund_returns)
        bench_arr = np.array(monthly_benchmark_returns)

        # Identify Up Months (Benchmark > 0) and Down Months (Benchmark < 0)
        up_mask = bench_arr > 0
        down_mask = bench_arr < 0

        if not np.any(up_mask) or not np.any(down_mask):
            return {
                "status": "LACKS_CYCLE_VARIETY",
                "scheme_name": scheme_name,
                "passed_filters": False,
            }

        # Geometric compound monthly return in Up periods
        # R_geo = prod(1 + r)^(1/N) - 1
        fund_up = fund_arr[up_mask]
        bench_up = bench_arr[up_mask]

        geo_fund_up = np.prod(1.0 + fund_up) ** (1.0 / len(fund_up)) - 1.0
        geo_bench_up = np.prod(1.0 + bench_up) ** (1.0 / len(bench_up)) - 1.0

        upside_capture = (geo_fund_up / geo_bench_up) * 100.0 if geo_bench_up != 0 else 100.0

        # Geometric compound monthly return in Down periods
        fund_down = fund_arr[down_mask]
        bench_down = bench_arr[down_mask]

        geo_fund_down = np.prod(1.0 + fund_down) ** (1.0 / len(fund_down)) - 1.0
        geo_bench_down = np.prod(1.0 + bench_down) ** (1.0 / len(bench_down)) - 1.0

        downside_capture = (geo_fund_down / geo_bench_down) * 100.0 if geo_bench_down != 0 else 100.0

        # Overall Capture Ratio
        overall_capture_ratio = upside_capture / downside_capture if downside_capture > 0 else 0.0

        # Filter verification
        passed_upside = bool(upside_capture >= cls.MIN_UPSIDE_CAPTURE)
        passed_downside = bool(downside_capture <= cls.MAX_DOWNSIDE_CAPTURE)
        passed_ratio = bool(overall_capture_ratio >= cls.MIN_OVERALL_RATIO)
        passed_all = bool(passed_upside and passed_downside and passed_ratio)

        return {
            "status": "SUCCESS",
            "scheme_name": scheme_name,
            "months_evaluated": len(monthly_fund_returns),
            "up_months_count": int(np.sum(up_mask)),
            "down_months_count": int(np.sum(down_mask)),
            "upside_capture_pct": round(float(upside_capture), 2),
            "downside_capture_pct": round(float(downside_capture), 2),
            "capture_ratio": round(float(overall_capture_ratio), 2),
            "passed_upside_threshold": passed_upside,
            "passed_downside_threshold": passed_downside,
            "passed_ratio_threshold": passed_ratio,
            "passed_filters": passed_all,
        }
