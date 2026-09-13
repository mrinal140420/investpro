"""
InvestPro — DataIngestionAgent: Consolidated Account Statement (CAS) Parser
Exported into investpro_engine for unified package distribution.
"""

import sys
import os

try:
    from app.services.cas_parser import CASParser
except ImportError:
    backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)
    from app.services.cas_parser import CASParser

__all__ = ["CASParser"]
