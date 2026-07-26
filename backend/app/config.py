from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional

class Settings(BaseSettings):
    APP_NAME: str = "InvestPro Wealth Command Center"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    
    # Supabase Settings
    SUPABASE_URL: str = "https://your-project-ref.supabase.co"
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    # Database Settings
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"
    DATABASE_URL_DIRECT: Optional[str] = None
    
    # Telegram Bot
    TELEGRAM_BOT_TOKEN: Optional[str] = None
    TELEGRAM_CHAT_ID: Optional[str] = None
    
    # Financial Engine Defaults
    AUM_BLOAT_THRESHOLD_CRORES: float = 10000.0  # ₹10,000 Crores
    MAX_ACCEPTABLE_CAGR: float = 0.25           # 25% CAGR cutoff for career leverage trigger
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
