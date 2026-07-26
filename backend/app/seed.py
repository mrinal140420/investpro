import asyncio
import logging
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import AsyncSessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initial 3 Barbell Schemes
BARBELL_FUNDS = [
    {
        "scheme_code": "120716",
        "scheme_name": "ICICI Prudential Nifty Next 50 Index Fund - Direct Growth",
        "fund_house": "ICICI Prudential Mutual Fund",
        "scheme_category": "nifty_next_50",
        "bucket": "anchor",
        "is_tracked": True,
        "aum_threshold": 100000000000.0  # ₹10,000 Cr
    },
    {
        "scheme_code": "145206",
        "scheme_name": "Tata Small Cap Fund - Direct Growth",
        "fund_house": "Tata Mutual Fund",
        "scheme_category": "small_cap",
        "bucket": "accelerator",
        "is_tracked": True,
        "aum_threshold": 100000000000.0  # ₹10,000 Cr
    },
    {
        "scheme_code": "149363",
        "scheme_name": "UTI Nifty 200 Momentum 30 Index Fund - Direct Growth",
        "fund_house": "UTI Mutual Fund",
        "scheme_category": "momentum",
        "bucket": "accelerator",
        "is_tracked": True,
        "aum_threshold": 100000000000.0  # ₹10,000 Cr
    }
]

async def seed_database():
    logger.info("Starting database seeding...")
    async with AsyncSessionLocal() as session:
        try:
            # 1. Seed MF Schemes
            for fund in BARBELL_FUNDS:
                sql = text("""
                    INSERT INTO mf_schemes (
                        scheme_code, scheme_name, fund_house, scheme_category, bucket, is_tracked, aum_threshold
                    ) VALUES (
                        :scheme_code, :scheme_name, :fund_house, :scheme_category::fund_category, :bucket::bucket_type, :is_tracked, :aum_threshold
                    )
                    ON CONFLICT (scheme_code) DO UPDATE SET
                        scheme_name = EXCLUDED.scheme_name,
                        bucket = EXCLUDED.bucket,
                        is_tracked = EXCLUDED.is_tracked;
                """)
                await session.execute(sql, fund)
                logger.info(f"Seeded scheme: {fund['scheme_name']} ({fund['scheme_code']})")

            await session.commit()
            logger.info("Database seeding completed successfully!")
        except Exception as e:
            await session.rollback()
            logger.error(f"Error during seeding: {e}")
            raise

if __name__ == "__main__":
    asyncio.run(seed_database())
