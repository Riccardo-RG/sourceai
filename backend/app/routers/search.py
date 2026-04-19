from fastapi import APIRouter, Depends, HTTPException
from app.models.search import SearchRequest, SearchResponse, SourcingLink, RealSupplier
from app.models.viability import ViabilityScore
from app.services.ai_service import analyze_product
from app.dependencies.auth import get_user_id
from app.dependencies.rate_limit import check_rate_limit

router = APIRouter()


@router.post("", response_model=SearchResponse)
async def search(req: SearchRequest, user_id: str = Depends(get_user_id)):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    check_rate_limit(user_id)

    try:
        data = await analyze_product(req.query.strip(), req.category, user_id, req.market, req.context)
        return SearchResponse(
            viability=ViabilityScore(**data["viability"]),
            sourcing_links=[SourcingLink(**lnk) for lnk in data["sourcing_links"]],
            real_suppliers=[
                RealSupplier(**s) for s in data.get("real_suppliers", [])
                if s.get("name") and s.get("url")
            ],
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
