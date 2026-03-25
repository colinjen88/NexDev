from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
from app.routers import content


app = FastAPI(
    title="Learning Knowledge Workspace API",
    description="FastAPI backend for learning-knowledge-workspace",
    version="0.1.0",
)

# CORS MVP setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Should be tightened in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(content.router)

@app.get("/api/v1/system/health")
async def health_check():
    return {
        "data": {
            "status": "ok",
            "checks": {
                "database": "pending",  # TODO: add real check
                "redis": "pending"      # TODO: add real check
            }
        },
        "meta": {
            "requestId": "req_startup",
            "version": "v1",
            "servedAt": datetime.now(timezone.utc).isoformat()
        }
    }

@app.get("/api/v1/system/version")
async def get_version():
    return {
        "data": {
            "apiVersion": "v1",
            "serviceVersion": "0.1.0",
            "contentVersion": "draft",
            "gitSha": "unknown",         # TODO: inject at build time
            "builtAt": "unknown"         # TODO: inject at build time
        },
        "meta": {
            "requestId": "req_startup",
            "version": "v1",
            "servedAt": datetime.now(timezone.utc).isoformat()
        }
    }
