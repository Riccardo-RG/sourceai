import base64
import json
import logging
from fastapi import Header, HTTPException

logger = logging.getLogger(__name__)


def _jwt_sub(token: str) -> str | None:
    """Extract sub claim from JWT payload without verifying signature."""
    try:
        payload_b64 = token.split(".")[1]
        # Add padding
        payload_b64 += "=" * (-len(payload_b64) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))
        return payload.get("sub")
    except Exception:
        return None


async def get_user_id(
    authorization: str | None = Header(None),
    x_session_id: str | None = Header(None, alias="X-Session-Id"),
) -> str:
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        try:
            from app.db.client import get_supabase
            sb = get_supabase()
            response = sb.auth.get_user(token)
            return str(response.user.id)
        except RuntimeError:
            # Supabase not configured — extract sub from JWT payload (unverified)
            logger.warning("Supabase not configured, extracting sub from JWT unverified")
            sub = _jwt_sub(token)
            if sub:
                return sub
        except Exception as e:
            logger.error("Token verification failed: %s", e)
            raise HTTPException(status_code=401, detail=f"Token non valido: {e}")

    if x_session_id:
        return x_session_id

    logger.warning("No auth header received. authorization=%r x_session_id=%r", authorization, x_session_id)
    raise HTTPException(status_code=401, detail="Autenticazione richiesta")
