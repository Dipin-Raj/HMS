from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "HMS-AI"
    API_V1_STR: str = "/api/v1"

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    DATABASE_URL: Optional[str] = None
    DATABASE_URL1: str
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: Optional[str] = None
    SMTP_FROM_NAME: str = "HMS-AI"
    SMTP_USE_TLS: bool = True
    DOCTOR_INVITE_BASE_URL: str = "http://localhost:5173/set-password"
    DOCTOR_INVITE_EXPIRY_HOURS: int = 24

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    def model_post_init(self, __context) -> None:
        object.__setattr__(self, "DATABASE_URL", self.DATABASE_URL1)

@lru_cache()
def get_settings():
    return Settings()
