from fastapi import Header, HTTPException


async def get_user_id(
    authorization: str | None = Header(None),
    x_session_id: str | None = Header(None, alias="X-Session-Id"),
) -> str:
    """
    Extract user identity from either:
    - Authorization: Bearer <supabase_jwt>  → verifies via Supabase and returns user.id
    - X-Session-Id: <uuid>                 → anonymous session fallback
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        try:
            from app.db.client import get_supabase
            sb = get_supabase()
            response = sb.auth.get_user(token)
            return str(response.user.id)
        except Exception:
            raise HTTPException(status_code=401, detail="Token non valido")

    if x_session_id:
        return x_session_id

    raise HTTPException(status_code=401, detail="Autenticazione richiesta")
