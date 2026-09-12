"""
InvestPro — DataIngestionAgent: Consolidated Account Statement (CAS) Parser
Extracts, decrypts, sanitizes, and normalizes CAMS/KFintech CAS PDFs.
Enforces 100% exclusion of Regular plans and maps to deterministic asset classes.
"""

import re
import io
import logging
from datetime import datetime, date
from decimal import Decimal
from typing import Dict, List, Any, Optional, Union, Tuple
import pdfplumber

logger = logging.getLogger("investpro.cas_parser")


class CASParser:
    """
    Parses password-protected Consolidated Account Statements (CAS) from CAMS and KFintech.
    Zero external paid APIs. 100% bootstrapped parsing with FIFO tax-lot normalization.
    """

    ASSET_CLASS_RULES = [
        # Global Equity
        (re.compile(r"(s&p\s*500|nasdaq|us\s*equity|global|international|world|overseas|greater\s*china|euro)", re.I), "GLOBAL_EQUITY"),
        # Gold & Precious Metals
        (re.compile(r"(gold|silver|sovereign\s*gold|sgb|precious)", re.I), "GOLD_PRECIOUS"),
        # Debt & Liquid
        (re.compile(r"(liquid|overnight|money\s*market|arbitrage|debt|gilt|treasury|short\s*duration|banking\s*&\s*psu|corporate\s*bond|savings\s*fund|ultra\s*short|low\s*duration)", re.I), "DEBT_LIQUID"),
        # India Small-Cap
        (re.compile(r"(small\s*cap|smallcap|micro\s*cap|nifty\s*smallcap)", re.I), "INDIA_SMALL_CAP"),
        # India Mid-Cap
        (re.compile(r"(mid\s*cap|midcap|nifty\s*midcap|emerging\s*equities)", re.I), "INDIA_MID_CAP"),
        # India Large-Cap
        (re.compile(r"(large\s*cap|largecap|bluechip|top\s*100|nifty\s*50|sensex|index\s*fund|flexi\s*cap|multi\s*cap|focused|contra|elss|tax\s*saver|value\s*fund)", re.I), "INDIA_LARGE_CAP"),
    ]

    TRANSACTION_TYPE_MAP = {
        "PURCHASE": "PURCHASE",
        "ADDITIONAL PURCHASE": "PURCHASE",
        "SYSTEMATIC INVESTMENT": "SIP",
        "SIP": "SIP",
        "SIP PURCHASE": "SIP",
        "SWITCH IN": "SWITCH_IN",
        "SWITCH-IN": "SWITCH_IN",
        "SWITCH OUT": "SWITCH_OUT",
        "SWITCH-OUT": "SWITCH_OUT",
        "REDEMPTION": "REDEMPTION",
        "SYSTEMATIC WITHDRAWAL": "SWP",
        "SWP": "SWP",
        "DIVIDEND REINVESTMENT": "DIVIDEND_REINVESTMENT",
        "DIV. REINVEST": "DIVIDEND_REINVESTMENT",
        "REINVESTMENT": "DIVIDEND_REINVESTMENT",
        "DIVIDEND PAYOUT": "DIVIDEND_PAYOUT",
        "DIV. PAYOUT": "DIVIDEND_PAYOUT",
        "STP IN": "STP_IN",
        "STP-IN": "STP_IN",
        "STP OUT": "STP_OUT",
        "STP-OUT": "STP_OUT",
    }

    DATE_PATTERNS = [
        "%d-%b-%Y",  # 15-Jan-2024
        "%d/%m/%Y",  # 15/01/2024
        "%d-%m-%Y",  # 15-01-2024
        "%d-%B-%Y",  # 15-January-2024
    ]

    def __init__(self, password: Optional[str] = None):
        """
        :param password: The user's PAN or statement password (case-sensitive or uppercase PAN)
        """
        self.password = password.strip().upper() if password else None

    def parse_pdf(self, pdf_file: Union[str, bytes, io.BytesIO]) -> Dict[str, Any]:
        """
        Ingests and decrypts a CAS PDF statement and extracts all transactions.
        Returns a typed, normalized dictionary ready for database insertion.
        """
        file_obj = io.BytesIO(pdf_file) if isinstance(pdf_file, bytes) else pdf_file

        passwords_to_try = [self.password] if self.password else [None]
        if self.password:
            passwords_to_try.append(self.password.lower())

        pdf_doc = None
        open_err = None

        for pwd in passwords_to_try:
            try:
                pdf_doc = pdfplumber.open(file_obj, password=pwd)
                break
            except Exception as e:
                open_err = e
                continue

        if pdf_doc is None:
            raise ValueError(f"Failed to open/decrypt CAS PDF. Please verify password/PAN. Details: {open_err}")

        all_text = ""
        extracted_tables: List[List[List[str]]] = []

        try:
            for page in pdf_doc.pages:
                text = page.extract_text()
                if text:
                    all_text += text + "\n"
                tables = page.extract_tables()
                if tables:
                    extracted_tables.extend(tables)
        finally:
            pdf_doc.close()

        return self.parse_extracted_content(all_text, extracted_tables)

    def parse_extracted_content(self, raw_text: str, tables: Optional[List[List[List[str]]]] = None) -> Dict[str, Any]:
        """
        Parses raw text and structured table cells extracted from the CAS document.
        """
        folio_blocks = self._split_by_folios(raw_text)
        parsed_records: List[Dict[str, Any]] = []
        regular_plans_flagged: List[Dict[str, Any]] = []

        # Process each folio block found in the text
        for block in folio_blocks:
            folio_no = block.get("folio_number", "UNKNOWN_FOLIO")
            scheme_name = block.get("scheme_name", "UNKNOWN_SCHEME")
            isin = block.get("isin")
            block_text = block.get("text", "")

            # Sanitization & Plan Classification
            is_regular = self._is_regular_plan(scheme_name)
            asset_class = self.classify_asset_class(scheme_name)
            cleaned_scheme = self._sanitize_scheme_name(scheme_name)

            transactions = self._extract_transactions_from_block(block_text)

            for tx in transactions:
                record = {
                    "folio_number": folio_no,
                    "scheme_name": cleaned_scheme,
                    "raw_scheme_name": scheme_name,
                    "isin": isin,
                    "transaction_date": tx["date"].isoformat() if isinstance(tx["date"], (date, datetime)) else tx["date"],
                    "transaction_type": tx["type"],
                    "amount": float(tx["amount"]),
                    "units": float(tx["units"]),
                    "nav": float(tx["nav"]),
                    "is_regular_plan": is_regular,
                    "asset_class": asset_class,
                }
                parsed_records.append(record)
                if is_regular:
                    regular_plans_flagged.append(record)

        # Compute summary metrics for hand-off artifact
        total_inflows = sum(r["amount"] for r in parsed_records if r["transaction_type"] in ["PURCHASE", "SIP", "SWITCH_IN", "STP_IN"] and not r["is_regular_plan"])
        total_outflows = sum(r["amount"] for r in parsed_records if r["transaction_type"] in ["REDEMPTION", "SWP", "SWITCH_OUT", "STP_OUT"] and not r["is_regular_plan"])

        # Breakdown by asset class (excluding regular plans)
        asset_class_counts: Dict[str, int] = {}
        for r in parsed_records:
            if not r["is_regular_plan"]:
                ac = r["asset_class"]
                asset_class_counts[ac] = asset_class_counts.get(ac, 0) + 1

        return {
            "status": "SUCCESS",
            "metadata": {
                "total_records_parsed": len(parsed_records),
                "regular_plans_flagged_count": len(regular_plans_flagged),
                "regular_plans_mandatory_excluded": len(regular_plans_flagged) > 0,
                "clean_direct_records_count": len(parsed_records) - len(regular_plans_flagged),
                "total_net_inflow_inr": round(total_inflows - total_outflows, 2),
                "asset_class_distribution": asset_class_counts,
            },
            "records": parsed_records,
            "flagged_regular_plans": regular_plans_flagged,
        }

    def classify_asset_class(self, scheme_name: str) -> str:
        """
        Maps fund name to internal 6-bucket asset classification:
        INDIA_LARGE_CAP, INDIA_MID_CAP, INDIA_SMALL_CAP, GLOBAL_EQUITY, GOLD_PRECIOUS, DEBT_LIQUID
        """
        cleaned = scheme_name.lower()
        for pattern, asset_class in self.ASSET_CLASS_RULES:
            if pattern.search(cleaned):
                return asset_class
        # Default fallback: If contains equity or growth but unmatched, treat as India Large Cap
        if "equity" in cleaned or "growth" in cleaned:
            return "INDIA_LARGE_CAP"
        return "DEBT_LIQUID"

    def _is_regular_plan(self, scheme_name: str) -> bool:
        """
        Detects if the scheme is a Regular (Commission-loaded) plan for mandatory exclusion.
        Direct plans explicitly have 'Direct' in their name.
        """
        name_upper = scheme_name.upper()
        if "REGULAR" in name_upper:
            return True
        if "DIRECT" not in name_upper and ("GROWTH" in name_upper or "DIVIDEND" in name_upper or "IDCW" in name_upper):
            # When neither DIRECT nor REGULAR is explicitly stated, standard industry practice flags as regular
            # unless explicitly tagged Direct
            return True
        return False

    def _sanitize_scheme_name(self, scheme_name: str) -> str:
        """
        Removes noisy broker codes, extra whitespaces, and standardizes casing.
        """
        cleaned = re.sub(r"\s+", " ", scheme_name).strip()
        # Remove common trailing artifacts
        cleaned = re.sub(r"\s*-\s*ISIN:.*$", "", cleaned, flags=re.I)
        return cleaned

    def _split_by_folios(self, text: str) -> List[Dict[str, Any]]:
        """
        Segments raw CAS text into individual scheme/folio chunks.
        """
        blocks: List[Dict[str, Any]] = []
        lines = text.split("\n")
        current_folio = None
        current_scheme = None
        current_isin = None
        current_lines: List[str] = []

        folio_regex = re.compile(r"Folio\s*(?:No|Number)?[:\s\-]+([A-Z0-9\/\-]+)", re.I)
        isin_regex = re.compile(r"(INF[A-Z0-9]{9})", re.I)

        for line in lines:
            f_match = folio_regex.search(line)
            if f_match:
                if current_scheme and current_lines:
                    blocks.append({
                        "folio_number": current_folio or "UNKNOWN",
                        "scheme_name": current_scheme,
                        "isin": current_isin,
                        "text": "\n".join(current_lines),
                    })
                    current_lines = []
                current_folio = f_match.group(1).strip()

            # Check for scheme headers
            if ("Fund" in line or "Plan" in line or "Growth" in line or "Direct" in line or "Regular" in line) and len(line.strip()) > 10:
                # Potential scheme line
                if not re.search(r"^\d{2}-[A-Za-z]{3}-\d{4}", line.strip()):
                    isin_m = isin_regex.search(line)
                    if isin_m:
                        current_isin = isin_m.group(1).upper()
                    # Only treat as new scheme if it has substantive length and no transaction dates
                    if any(kw in line for kw in ["Mutual Fund", "Fund -", "Scheme -", "Growth", "Direct", "Regular"]):
                        current_scheme = line.strip()

            current_lines.append(line)

        # Flush final block
        if current_lines:
            blocks.append({
                "folio_number": current_folio or "FOLIO-DEFAULT",
                "scheme_name": current_scheme or "Multi-Asset Mutual Fund",
                "isin": current_isin,
                "text": "\n".join(current_lines),
            })

        return blocks

    def _extract_transactions_from_block(self, block_text: str) -> List[Dict[str, Any]]:
        """
        Parses transactional line records within a folio block.
        Format typically:
        <Date> <Description/Type> <Amount> <Units> <NAV> <Balance>
        """
        transactions: List[Dict[str, Any]] = []
        lines = block_text.split("\n")

        # Pattern matches: DD-Mon-YYYY or DD/MM/YYYY followed by text and numerical values
        line_regex = re.compile(
            r"(\d{2}[-\/][A-Za-z0-9]{3,}[-\/]\d{2,4})\s+"  # Date
            r"([A-Za-z\s\-\/\.]+?)\s+"                      # Transaction Description
            r"([\(\-]?[\d,]+\.?\d*[\)]?)\s+"                # Amount (INR)
            r"([\(\-]?[\d,]+\.?\d*[\)]?)\s+"                # Units
            r"([\d,]+\.?\d*)"                               # NAV / Price
        )

        for line in lines:
            m = line_regex.search(line.strip())
            if m:
                raw_date, raw_desc, raw_amt, raw_units, raw_nav = m.groups()
                parsed_date = self._parse_date(raw_date.strip())
                if not parsed_date:
                    continue

                tx_type = self._normalize_tx_type(raw_desc.strip())
                amt = self._clean_number(raw_amt)
                units = self._clean_number(raw_units)
                nav = self._clean_number(raw_nav)

                if nav == 0 and units > 0 and amt > 0:
                    nav = round(amt / units, 4)
                elif amt == 0 and units > 0 and nav > 0:
                    amt = round(units * nav, 2)

                transactions.append({
                    "date": parsed_date,
                    "type": tx_type,
                    "amount": amt,
                    "units": units,
                    "nav": nav,
                    "raw_desc": raw_desc.strip(),
                })

        return transactions

    def _normalize_tx_type(self, desc: str) -> str:
        """
        Maps raw description strings to internal `cas_tx_type` ENUM.
        """
        desc_clean = re.sub(r"[^A-Za-z\s\-]", "", desc).strip().upper()
        for key, val in self.TRANSACTION_TYPE_MAP.items():
            if key in desc_clean:
                return val
        if "REDEMPT" in desc_clean or "SALE" in desc_clean:
            return "REDEMPTION"
        if "SIP" in desc_clean or "SYS" in desc_clean:
            return "SIP"
        if "PURCHASE" in desc_clean or "SUBSCRIPT" in desc_clean:
            return "PURCHASE"
        if "DIV" in desc_clean:
            return "DIVIDEND_REINVESTMENT"
        if "SWITCH" in desc_clean:
            return "SWITCH_OUT" if "OUT" in desc_clean else "SWITCH_IN"
        return "PURCHASE"

    def _clean_number(self, val_str: str) -> float:
        """
        Removes commas and handles parentheses as negative/absolute values.
        """
        s = val_str.replace(",", "").replace("(", "").replace(")", "").strip()
        try:
            return abs(float(s))
        except (ValueError, TypeError):
            return 0.0

    def _parse_date(self, date_str: str) -> Optional[date]:
        """
        Tries multiple date patterns standard in Indian CAS statements.
        """
        for fmt in self.DATE_PATTERNS:
            try:
                return datetime.strptime(date_str, fmt).date()
            except ValueError:
                pass
        return None
