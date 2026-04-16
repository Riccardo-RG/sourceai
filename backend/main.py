from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import margin

app = FastAPI(title="SourceAI API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(margin.router, prefix="/api/margin", tags=["margin"])


@app.get("/health")
def health():
    return {"status": "ok"}
