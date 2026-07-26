import logging
from datetime import datetime, date
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

class NAVIngestionPipeline:
    """
    End-of-Day AMFI NAV Ingestion Pipeline using mftool
    
    1. Fetches latest NAV for tracked schemes.
    2. Upserts into Supabase `nav_history` table (append-only ledger).
    3. Triggers SMA signal recalculation & materialized view refresh.
    """

    def __init__(self):
        try:
            from mftool import Mftool
            self.mf = Mftool()
        except ImportError:
            self.mf = None
            logger.warning("mftool library not installed. Pipeline running in mock mode.")

    def fetch_latest_nav(self, scheme_code: str) -> Optional[Dict[str, Any]]:
        if not self.mf:
            logger.error("mftool is not available.")
            return None

        try:
            quote = self.mf.get_scheme_quote(scheme_code)
            if quote and "nav" in quote:
                nav_val = float(quote["nav"])
                # Parse date format '24-Jul-2026' or '24-07-2026'
                date_str = quote["last_updated"]
                try:
                    nav_date = datetime.strptime(date_str, "%d-%b-%Y").date()
                except ValueError:
                    nav_date = datetime.strptime(date_str, "%d-%m-%Y").date()

                return {
                    "scheme_code": scheme_code,
                    "scheme_name": quote.get("scheme_name", ""),
                    "nav": nav_val,
                    "nav_date": nav_date
                }
        except Exception as e:
            logger.error(f"Error fetching NAV for scheme {scheme_code}: {e}")
            return None
        return None
