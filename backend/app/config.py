import os
from pydantic import BaseSettings, AnyHttpUrl
from typing import List


class Settings(BaseSettings):
    app_name: str = "Apar Intelligent Transportation"
    backend_host: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    backend_port: int = int(os.getenv("BACKEND_PORT", "8000"))
    database_url: str = os.getenv(
        "DATABASE_URL",
        f"postgresql://{os.getenv('POSTGRES_USER','apar')}:"
        f"{os.getenv('POSTGRES_PASSWORD','apar_password')}@"
        f"{os.getenv('POSTGRES_HOST','localhost')}:{os.getenv('POSTGRES_PORT','5432')}/"
        f"{os.getenv('POSTGRES_DB','apar_db')}",
    )
    jwt_secret: str = os.getenv("JWT_SECRET", "supersecretjwt")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_expire_minutes: int = int(os.getenv("JWT_EXPIRE_MINUTES", "120"))
    cors_origins: List[AnyHttpUrl] = []
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    seed_demo: bool = os.getenv("SEED_DEMO", "true").lower() == "true"

    class Config:
        env_file = ".env"
        fields = {"cors_origins": {"env": "BACKEND_CORS_ORIGINS"}}


settings = Settings()
