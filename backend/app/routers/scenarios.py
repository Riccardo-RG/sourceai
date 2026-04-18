import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.db.client import get_supabase
from app.dependencies.auth import get_user_id
from app.models.scenario import ScenarioCreate

router = APIRouter()


@router.get("/")
def list_scenarios(user_id: str = Depends(get_user_id)):
    sb = get_supabase()
    result = (
        sb.table("margin_scenarios")
        .select("*")
        .eq("session_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.post("/", status_code=201)
def create_scenario(body: ScenarioCreate, user_id: str = Depends(get_user_id)):
    sb = get_supabase()
    entry = {
        "id": str(uuid.uuid4()),
        "name": body.name,
        "supplier_name": body.supplier_name,
        "inputs": body.inputs,
        "result": body.result,
        "session_id": user_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = sb.table("margin_scenarios").insert(entry).execute()
    return result.data[0]


@router.delete("/{scenario_id}")
def delete_scenario(scenario_id: str, user_id: str = Depends(get_user_id)):
    sb = get_supabase()
    result = (
        sb.table("margin_scenarios")
        .delete()
        .eq("id", scenario_id)
        .eq("session_id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return {"ok": True}
