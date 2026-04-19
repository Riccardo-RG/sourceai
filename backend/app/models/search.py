from pydantic import BaseModel
from app.models.viability import ViabilityScore


class SourcingLink(BaseModel):
    platform: str
    url: str
    label: str
    description: str


class SearchRequest(BaseModel):
    query: str
    category: str | None = None
    session_id: str = "anonymous"
    market: str = "US"


class SearchResponse(BaseModel):
    viability: ViabilityScore
    sourcing_links: list[SourcingLink]
