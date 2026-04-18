from pydantic import BaseModel
from app.models.supplier import Supplier
from app.models.viability import ViabilityScore


class SearchRequest(BaseModel):
    query: str
    category: str | None = None
    session_id: str = "anonymous"


class SearchResponse(BaseModel):
    viability: ViabilityScore
    suppliers: list[Supplier]
