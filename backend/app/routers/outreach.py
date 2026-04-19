import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.db.client import get_supabase
from app.dependencies.auth import get_user_id
from app.models.outreach import CreateOutreachRequest, UpdateOutreachRequest

router = APIRouter()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _sb():
    try:
        return get_supabase()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {e}")


@router.get("")
def list_outreach(user_id: str = Depends(get_user_id)):
    try:
        result = _sb().table("outreach_entries").select("*").eq("session_id", user_id).order("sent_at", desc=True).execute()
        return result.data
    except HTTPException:
        raise
    except Exception:
        return []


@router.post("", status_code=201)
def create_outreach(req: CreateOutreachRequest, user_id: str = Depends(get_user_id)):
    now = _now()
    entry = {
        "id": str(uuid.uuid4()),
        "supplier_id": req.supplier_id,
        "supplier_name": req.supplier_name,
        "product_query": req.product_query,
        "status": "inviato",
        "session_id": user_id,
        "sent_at": now,
        "last_update": now,
    }
    try:
        result = _sb().table("outreach_entries").insert(entry).execute()
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.patch("/{entry_id}")
def update_outreach(entry_id: str, req: UpdateOutreachRequest, user_id: str = Depends(get_user_id)):
    updates: dict = {"last_update": _now()}
    if req.status is not None:
        updates["status"] = req.status
    if req.note is not None:
        updates["note"] = req.note
    try:
        result = _sb().table("outreach_entries").update(updates).eq("id", entry_id).eq("session_id", user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Entry not found")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.delete("/{entry_id}")
def delete_outreach(entry_id: str, user_id: str = Depends(get_user_id)):
    try:
        _sb().table("outreach_entries").delete().eq("id", entry_id).eq("session_id", user_id).execute()
    except HTTPException:
        raise
    except Exception:
        pass
    return {"ok": True}
