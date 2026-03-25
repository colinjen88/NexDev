from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import content, system


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Learning Knowledge Workspace API starting up ...")
    yield
    # Shutdown
    print("🛑 API shutting down ...")


app = FastAPI(
    title="Learning Knowledge Workspace API",
    description="FastAPI backend for learning-knowledge-workspace",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS MVP setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Should be tightened in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────
app.include_router(content.router)
app.include_router(system.router)
