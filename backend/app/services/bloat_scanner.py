from dataclasses import dataclass
from typing import Optional, List, Dict, Any

@dataclass
class BloatCheckResult:
    scheme_code: str
    scheme_name: str
    category: str
    current_aum_crores: float
    aum_threshold_crores: float
    status: str  # 'HEALTHY', 'WARNING', 'BLOATED'
    recommendation: Optional[str]

class AUMBloatScanner:
    """
    AUM Bloat Scanner
    
    Tracks mutual fund Assets Under Management (AUM). Small-cap and momentum funds
    lose agility when AUM crosses structural limits (e.g. ₹10,000 Crores).
    """

    def check_fund_bloat(
        self,
        scheme_code: str,
        scheme_name: str,
        category: str,
        current_aum_crores: float,
        threshold_crores: float = 10000.0,
        leaner_alternatives: Optional[List[Dict[str, Any]]] = None
    ) -> BloatCheckResult:
        
        ratio = current_aum_crores / threshold_crores
        
        if ratio >= 1.0:
            status = 'BLOATED'
            alt_str = ""
            if leaner_alternatives:
                alt_names = [f"{a['name']} (AUM: ₹{a['aum_crores']} Cr)" for a in leaner_alternatives]
                alt_str = f" Leaner alternatives: {', '.join(alt_names)}."
                
            rec = f"FLAG: Fund {scheme_name} has exceeded AUM bloat threshold (₹{current_aum_crores:,.0f} Cr vs ₹{threshold_crores:,.0f} Cr limit). Agility compromised.{alt_str}"
        elif ratio >= 0.85:
            status = 'WARNING'
            rec = f"WARNING: Fund {scheme_name} approaching AUM bloat threshold (₹{current_aum_crores:,.0f} Cr / ₹{threshold_crores:,.0f} Cr limit)."
        else:
            status = 'HEALTHY'
            rec = None

        return BloatCheckResult(
            scheme_code=scheme_code,
            scheme_name=scheme_name,
            category=category,
            current_aum_crores=current_aum_crores,
            aum_threshold_crores=threshold_crores,
            status=status,
            recommendation=rec
        )
