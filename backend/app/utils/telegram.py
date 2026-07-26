import httpx
import logging
from typing import Optional, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

class TelegramNotifier:
    """
    Telegram Directive Dispatcher
    
    Pushes semi-automated trading directives directly to the user's Telegram chat.
    User manually executes the exact order on Groww app.
    """

    def __init__(self, bot_token: Optional[str] = None, chat_id: Optional[str] = None):
        self.bot_token = bot_token or settings.TELEGRAM_BOT_TOKEN
        self.chat_id = chat_id or settings.TELEGRAM_CHAT_ID
        self.api_url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage" if self.bot_token else None

    async def send_directive(
        self,
        action: str,
        scheme_name: str,
        amount_inr: float,
        reason: str,
        urgency: str = "HIGH"
    ) -> bool:
        if not self.api_url or not self.chat_id:
            logger.warning("Telegram Bot token or Chat ID not configured. Directive logged internally only.")
            return False

        emoji_map = {
            "CRITICAL": "🔴 **CIRCUIT BREAKER ALERT**",
            "HIGH": "⚡ **TRADING DIRECTIVE**",
            "INFO": "🟢 **PORTFOLIO UPDATE**",
            "WARNING": "⚠️ **AUM BLOAT WARNING**"
        }

        header = emoji_map.get(urgency, "⚡ **DIRECTIVE**")
        
        message_md = (
            f"{header}\n\n"
            f"**Action:** `{action.upper()}`\n"
            f"**Fund:** {scheme_name}\n"
            f"**Amount:** ₹{amount_inr:,.2f}\n"
            f"**Reason:** {reason}\n\n"
            f"👉 *Open Groww App & Execute Order Manually*"
        )

        payload = {
            "chat_id": self.chat_id,
            "text": message_md,
            "parse_mode": "Markdown"
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(self.api_url, json=payload)
                response.raise_for_status()
                logger.info(f"Successfully dispatched Telegram directive for {scheme_name}")
                return True
            except Exception as e:
                logger.error(f"Failed to send Telegram message: {str(e)}")
                return False
