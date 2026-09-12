"""
InvestPro — Quantitative & Rules Decision Engine Package
Core deterministic rules-based family office modules.
"""

from .tax_harvesting import TaxHarvestingEngine
from .tactical_alloc import TacticalAllocEngine
from .glide_path import GlidePathEngine
from .windfall_stp import WindfallSTPRouter
from .bloat_detector import BloatDetector
from .xirr_calculator import XIRRCalculator
from .cas_parser import CASParser
from .rolling_backtester import RollingBacktester
from .capture_ratio_filter import CaptureRatioFilter
from .factor_rotator import FactorRotator

__all__ = [
    "TaxHarvestingEngine",
    "TacticalAllocEngine",
    "GlidePathEngine",
    "WindfallSTPRouter",
    "BloatDetector",
    "XIRRCalculator",
    "CASParser",
    "RollingBacktester",
    "CaptureRatioFilter",
    "FactorRotator",
]
