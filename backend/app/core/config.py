import os
from typing import List, Optional, Union, Any
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "REWOIX Marketplace LMS"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str = "dev_secret_key_change_in_production_super_secret_123456789"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALGORITHM: str = "HS256"

    # Database (Defaults to SQLite for instant local dev without requiring Docker PostgreSQL)
    DATABASE_URL: str = "sqlite+aiosqlite:///./rewoix.db"
    SYNC_DATABASE_URL: str = "sqlite:///./rewoix.db"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_async_db_url(cls, v: str) -> str:
        if isinstance(v, str):
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql+asyncpg://", 1)
            elif v.startswith("postgresql://") and not v.startswith("postgresql+asyncpg://"):
                return v.replace("postgresql://", "postgresql+asyncpg://", 1)
            elif v.startswith("sqlite://") and not v.startswith("sqlite+aiosqlite://"):
                return v.replace("sqlite://", "sqlite+aiosqlite://", 1)
        return v

    @field_validator("SYNC_DATABASE_URL", mode="before")
    @classmethod
    def assemble_sync_db_url(cls, v: str) -> str:
        if isinstance(v, str):
            if v.startswith("postgresql+asyncpg://"):
                return v.replace("postgresql+asyncpg://", "postgresql://", 1)
            elif v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql://", 1)
            elif v.startswith("sqlite+aiosqlite://"):
                return v.replace("sqlite+aiosqlite://", "sqlite://", 1)
        return v

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "*",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    import json
                    return json.loads(v)
                except Exception:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    # Payment (Razorpay)
    RAZORPAY_KEY_ID: str = "rzp_test_mock_key"
    RAZORPAY_KEY_SECRET: str = "rzp_test_mock_secret"
    RAZORPAY_WEBHOOK_SECRET: str = "rzp_test_webhook_secret"

    # Storage (Azure Blob / S3 / Local)
    STORAGE_PROVIDER: str = "local"
    AZURE_STORAGE_CONNECTION_STRING: Optional[str] = None
    AZURE_STORAGE_CONTAINER: str = "rewoix-media"
    AWS_S3_BUCKET: Optional[str] = None
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    LOCAL_STORAGE_DIR: str = "./media"

    # Platform Defaults
    DEFAULT_PLATFORM_COMMISSION_PERCENT: float = 30.0
    DEFAULT_TEACHER_SHARE_PERCENT: float = 70.0
    DEFAULT_CURRENCY: str = "INR"

    # AI Config
    AI_PROVIDER: str = "mock"
    AI_API_KEY: Optional[str] = None

    # SMTP / Email
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: str = "noreply@rewoix.com"
    EMAILS_FROM_NAME: str = "REWOIX Learning Platform"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
