import asyncio
from app.utils.telegram import TelegramNotifier
from app.config import settings
import sys
import logging

logging.basicConfig(level=logging.INFO, stream=sys.stdout)

async def main():
    print(f"Loaded BOT_TOKEN: {bool(settings.TELEGRAM_BOT_TOKEN)}")
    print(f"Loaded CHAT_ID: {bool(settings.TELEGRAM_CHAT_ID)}")
    
    notifier = TelegramNotifier()
    success = await notifier.send_directive(
        action="TEST_CONNECTION",
        scheme_name="InvestPro System Check",
        amount_inr=0.0,
        reason="Testing if Telegram configuration is correctly set up from .env.",
        urgency="INFO"
    )
    if success:
        print("SUCCESS! Alert sent to your Telegram.")
    else:
        print("FAILED to send alert. Check logs or token correctness.")

if __name__ == "__main__":
    asyncio.run(main())
