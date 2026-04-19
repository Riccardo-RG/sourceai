from pydantic import BaseModel
from app.models.viability import ViabilityScore


class SourcingLink(BaseModel):
    platform: str
    url: str
    label: str
    description: str


class RealSupplier(BaseModel):
    name: str
    platform: str
    url: str
    description: str


class SearchRequest(BaseModel):
    query: str
    category: str | None = None
    session_id: str = "anonymous"
    market: str = "GLOBAL"
    context: dict | None = None  # Miriam chat context: positioning, channel, etc.
    lang: str = "en"  # UI language for localized Claude responses


class SearchResponse(BaseModel):
    viability: ViabilityScore
    sourcing_links: list[SourcingLink]
    real_suppliers: list[RealSupplier] = []
