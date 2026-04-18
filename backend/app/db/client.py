from functools import lru_cache
from supabase import create_client, Client
from app.config import settings


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    if not settings.supabase_url or not settings.supabase_key:
        raise RuntimeError("Supabase credentials not configured (SUPABASE_URL / SUPABASE_KEY)")
    return create_client(settings.supabase_url, settings.supabase_key)
