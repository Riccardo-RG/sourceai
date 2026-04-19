from pydantic import BaseModel


class ViabilityScore(BaseModel):
    score: int
    demand: int
    demand_note: str
    competition: int
    competition_note: str
    margin_potential: int
    margin_note: str
    sourcing_ease: int
    sourcing_note: str
    price_range_min: float
    price_range_max: float
    recommended_channels: list[str]
    trend_yoy: float
    verdict: str
    # Google Trends fields (added after Claude response, optional)
    trends_interest: int | None = None
    trends_peak: str | None = None
    trends_market: str | None = None
