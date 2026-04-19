from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import margin, search, outreach, scenarios, chat

app = FastAPI(title="SourceAI API", version="1.0.0", redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(margin.router, prefix="/api/margin", tags=["margin"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(outreach.router, prefix="/api/outreach", tags=["outreach"])
app.include_router(scenarios.router, prefix="/api/scenarios", tags=["scenarios"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])


@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}
