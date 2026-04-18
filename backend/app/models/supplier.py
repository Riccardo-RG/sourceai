from typing import Literal
from pydantic import BaseModel


class Supplier(BaseModel):
    id: str
    name: str
    source: str
    url: str
    type: Literal["dropshipping", "stock", "both"]
    moq: int
    price_min: float
    price_max: float
    shipping_days_min: int
    shipping_days_max: int
    certifications: list[str]
    score: float
    verified: bool
    years_on_platform: int | None
    response_rate: int
    description: str
