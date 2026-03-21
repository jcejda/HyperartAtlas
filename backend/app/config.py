from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "HyperartAtlas"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "sqlite:///./hyperart_atlas.db"

    # JWT
    SECRET_KEY: str = "change-me-in-production-use-a-real-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    # Storage
    STORAGE_BACKEND: str = "local"  # "local" or "s3"
    UPLOAD_DIR: str = "uploads"

    # S3 (only needed if STORAGE_BACKEND=s3)
    S3_BUCKET: Optional[str] = None
    S3_REGION: Optional[str] = None
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    S3_ENDPOINT_URL: Optional[str] = None
    CLOUDFRONT_DOMAIN: Optional[str] = None

    # Base URL for constructing file URLs in local storage mode
    BASE_URL: str = "http://localhost:8000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


settings = Settings()
