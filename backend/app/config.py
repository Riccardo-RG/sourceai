from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    anthropic_api_key: str = ""
    tavily_api_key: str = ""
    supabase_url: str = ""
    supabase_key: str = ""
    dataforseo_login: str = ""
    dataforseo_password: str = ""
    cors_origins: list[str] = [
        "http://localhost:3000",
        "https://frontend-black-psi-94.vercel.app",
        "https://*.vercel.app",
    ]

    model_config = ConfigDict(env_file=".env", case_sensitive=False)


settings = Settings()
