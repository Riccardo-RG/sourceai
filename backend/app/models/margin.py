from pydantic import BaseModel, Field
from typing import Optional


class MarginInputs(BaseModel):
    selling_price: float = Field(gt=0)
    unit_cost: float = Field(gt=0)
    shipping_cost: float = Field(ge=0, default=0)
    platform_fee_pct: float = Field(ge=0, le=100, default=2.0)
    ads_cost_per_unit: float = Field(ge=0, default=0)
    return_rate_pct: float = Field(ge=0, le=100, default=2.0)
    monthly_fixed_costs: float = Field(ge=0, default=0)


class MarginResult(BaseModel):
    gross_margin_abs: float
    gross_margin_pct: float
    net_margin_abs: float
    net_margin_pct: float
    breakeven_units: Optional[int]
    total_cost_per_unit: float
