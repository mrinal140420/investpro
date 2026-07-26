from dataclasses import dataclass
from typing import Optional, List, Dict, Any

@dataclass
class SMACrossoverResult:
    scheme_code: str
    scheme_name: str
    bucket: str
    nav_date: str
    latest_nav: float
    sma_50: Optional[float]
    sma_200: Optional[float]
    signal: str  # 'DEATH_CROSS', 'GOLDEN_CROSS', 'NEUTRAL'
    action_required: str
    alert_severity: str  # 'CRITICAL', 'INFO', 'NONE'

class CasinoExitCircuitBreaker:
    """
    Casino Exit Circuit Breaker Engine
    
    Operates strictly on the ACCELERATOR bucket (Small Cap, Mid Cap, Momentum).
    The Anchor bucket (Nifty Next 50) NEVER receives sell or pause directives.
    
    Rules:
    1. If SMA_50 crosses BELOW SMA_200 (Death Cross):
       -> Trigger CRITICAL alert
       -> Pause SIP directives for this fund
       -> Direct capital to Anchor bucket safe assets
    2. If SMA_50 crosses ABOVE SMA_200 (Golden Cross):
       -> Trigger INFO alert
       -> Resume SIP directive
    """

    def evaluate_fund(
        self,
        scheme_code: str,
        scheme_name: str,
        bucket: str,
        nav_date: str,
        latest_nav: float,
        sma_50: Optional[float],
        sma_200: Optional[float],
        previous_sma_50: Optional[float],
        previous_sma_200: Optional[float]
    ) -> SMACrossoverResult:
        
        # Rule 0: Anchor bucket is immune
        if bucket.lower() == 'anchor':
            return SMACrossoverResult(
                scheme_code=scheme_code,
                scheme_name=scheme_name,
                bucket=bucket,
                nav_date=nav_date,
                latest_nav=latest_nav,
                sma_50=sma_50,
                sma_200=sma_200,
                signal='NEUTRAL',
                action_required='HOLD (Anchor Bucket is Immune)',
                alert_severity='NONE'
            )

        if not sma_50 or not sma_200 or not previous_sma_50 or not previous_sma_200:
            return SMACrossoverResult(
                scheme_code=scheme_code,
                scheme_name=scheme_name,
                bucket=bucket,
                nav_date=nav_date,
                latest_nav=latest_nav,
                sma_50=sma_50,
                sma_200=sma_200,
                signal='INSUFFICIENT_DATA',
                action_required='ACCUMULATE_NAV_HISTORY',
                alert_severity='NONE'
            )

        # Detect Crossovers
        was_bullish = previous_sma_50 >= previous_sma_200
        is_bearish = sma_50 < sma_200
        
        was_bearish = previous_sma_50 <= previous_sma_200
        is_bullish = sma_50 > sma_200

        if was_bullish and is_bearish:
            # Death Cross detected!
            return SMACrossoverResult(
                scheme_code=scheme_code,
                scheme_name=scheme_name,
                bucket=bucket,
                nav_date=nav_date,
                latest_nav=latest_nav,
                sma_50=sma_50,
                sma_200=sma_200,
                signal='DEATH_CROSS',
                action_required=f'PAUSE_SIP: Structural momentum breakdown in {scheme_name}. Shield capital in Anchor bucket.',
                alert_severity='CRITICAL'
            )
        elif was_bearish and is_bullish:
            # Golden Cross detected!
            return SMACrossoverResult(
                scheme_code=scheme_code,
                scheme_name=scheme_name,
                bucket=bucket,
                nav_date=nav_date,
                latest_nav=latest_nav,
                sma_50=sma_50,
                sma_200=sma_200,
                signal='GOLDEN_CROSS',
                action_required=f'RESUME_SIP: Momentum restored in {scheme_name}. Resume Accelerator allocation.',
                alert_severity='INFO'
            )
        else:
            current_status = 'BULLISH' if is_bullish else 'BEARISH'
            return SMACrossoverResult(
                scheme_code=scheme_code,
                scheme_name=scheme_name,
                bucket=bucket,
                nav_date=nav_date,
                latest_nav=latest_nav,
                sma_50=sma_50,
                sma_200=sma_200,
                signal='NEUTRAL',
                action_required=f'CONTINUE_SIP ({current_status})',
                alert_severity='NONE'
            )
