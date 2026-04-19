from fastapi import APIRouter, HTTPException
from app.models.search import SearchRequest, SearchResponse, SourcingLink
from app.models.viability import ViabilityScore
from app.services.ai_service import analyze_product

router = APIRouter()


@router.post("", response_model=SearchResponse)
async def search(req: SearchRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    try:
        data = await analyze_product(req.query.strip(), req.category, req.session_id, req.market)
        return SearchResponse(
            viability=ViabilityScore(**data["viability"]),
            sourcing_links=[SourcingLink(**l) for l in data["sourcing_links"]],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
