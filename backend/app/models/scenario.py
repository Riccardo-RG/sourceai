from datetime import datetime
from pydantic import BaseModel


class ScenarioCreate(BaseModel):
    name: str
    supplier_name: str | None = None
    inputs: dict
    result: dict
    session_id: str


class ScenarioResponse(BaseModel):
    id: str
    name: str
    supplier_name: str | None
    inputs: dict
    result: dict
    created_at: datetime
