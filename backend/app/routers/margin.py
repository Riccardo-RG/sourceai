from fastapi import APIRouter
from app.models.margin import MarginInputs, MarginResult
import math

router = APIRouter()


def calculate_margins(inputs: MarginInputs) -> MarginResult:
    sp = inputs.selling_price
    uc = inputs.unit_cost
    sc = inputs.shipping_cost
    pf = (inputs.platform_fee_pct / 100) * sp
    ac = inputs.ads_cost_per_unit
    rr = (inputs.return_rate_pct / 100) * sp

    gross_profit = sp - uc
    gross_margin_pct = (gross_profit / sp) * 100 if sp > 0 else 0

    total_cost = uc + sc + pf + ac + rr
    net_profit = sp - total_cost
    net_margin_pct = (net_profit / sp) * 100 if sp > 0 else 0

    if net_profit > 0 and inputs.monthly_fixed_costs > 0:
        breakeven = math.ceil(inputs.monthly_fixed_costs / net_profit)
    else:
        breakeven = None

    return MarginResult(
        gross_margin_abs=round(gross_profit, 2),
        gross_margin_pct=round(gross_margin_pct, 1),
        net_margin_abs=round(net_profit, 2),
        net_margin_pct=round(net_margin_pct, 1),
        breakeven_units=breakeven,
        total_cost_per_unit=round(total_cost, 2),
    )


@router.post("/calculate", response_model=MarginResult)
def calculate(inputs: MarginInputs):
    return calculate_margins(inputs)
