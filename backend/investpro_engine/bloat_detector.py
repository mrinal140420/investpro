"""
InvestPro — BloatDetector
Monitors asset size of actively managed Small-Cap mutual funds.
When AUM exceeds ₹10,000 Crores, liquidity constraints force active managers to hoard large caps
or hold uninvested cash. Redirects all forward SIPs into Smart Beta factor indexes.
"""

from typing import Dict, List, Any, Optional


class BloatDetector:
    """
    Guards against AUM Bloat in high-alpha small-cap funds.
    Threshold: ₹10,000 Crores.
    Target Smart Beta Destination: Nifty Smallcap 250 Quality 50 Index Fund.
    """

    AUM_THRESHOLD_CRORES: float = 10000.0  # ₹10,000 Crores
    DEFAULT_SMART_BETA_FALLBACK: str = "UTI Nifty Smallcap 250 Quality 50 Index Fund Direct - Growth"

    def __init__(
        self,
        threshold_crores: float = 10000.0,
        smart_beta_target: Optional[str] = None,
    ):
        self.threshold_crores = threshold_crores
        self.smart_beta_target = smart_beta_target or self.DEFAULT_SMART_BETA_FALLBACK

    def scan_fund(
        self,
        scheme_code: str,
        scheme_name: str,
        current_aum_crores: float,
        monthly_sip_amount: float = 5000.0,
        fund_category: str = "small_cap",
    ) -> Dict[str, Any]:
        """
        Scans a mutual fund for AUM bloat and emits a redirect directive if bloated.

        :param scheme_code: AMFI scheme code or identifier
        :param scheme_name: Fund title
        :param current_aum_crores: Current AUM in ₹ Crores
        :param monthly_sip_amount: User's active SIP amount in this fund
        :param fund_category: Fund category (small_cap, mid_cap, etc.)
        :return: Audit report with bloat status and redirection directive
        """
        is_small_cap = "small" in fund_category.lower() or "small" in scheme_name.lower()
        is_bloated = is_small_cap and (current_aum_crores > self.threshold_crores)

        directives: List[Dict[str, Any]] = []

        if is_bloated:
            directives.append({
                "directive_type": "BLOAT_SWITCH",
                "action": "SWITCH",
                "source_scheme": scheme_name,
                "target_scheme": self.smart_beta_target,
                "amount_inr": monthly_sip_amount,
                "rationale_heading": f"AUM Bloat Alert: Freeze SIP in {scheme_name}",
                "math_rationale": (
                    f"{scheme_name} AUM has swollen to ₹{current_aum_crores:,.1f} Crores, "
                    f"surpassing the institutional liquidity ceiling of ₹{self.threshold_crores:,.0f} Crores. "
                    f"At this size, small-cap alpha degrades due to excessive impact cost and forced large-cap dilution. "
                    f"Redirecting monthly SIP of ₹{monthly_sip_amount:,.2f} into rules-based Smart Beta factor "
                    f"({self.smart_beta_target})."
                ),
                "urgency": "HIGH",
                "state": "PENDING_APPROVAL",
            })

        return {
            "scheme_code": scheme_code,
            "scheme_name": scheme_name,
            "current_aum_crores": current_aum_crores,
            "threshold_crores": self.threshold_crores,
            "is_bloated": is_bloated,
            "bloat_ratio": round(current_aum_crores / self.threshold_crores, 2),
            "smart_beta_alternative": self.smart_beta_target,
            "directives": directives,
        }
