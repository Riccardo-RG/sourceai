from fastapi import APIRouter, HTTPException
from app.models.search import SearchRequest, SearchResponse
from app.models.supplier import Supplier
from app.models.viability import ViabilityScore
from app.services.ai_service import analyze_product

router = APIRouter()


@router.post("/", response_model=SearchResponse)
async def search(req: SearchRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    try:
        data = await analyze_product(req.query.strip(), req.category, req.session_id)
        return SearchResponse(
            viability=ViabilityScore(**data["viability"]),
            suppliers=[Supplier(**s) for s in data["suppliers"]],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
