from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import content, system
from app.routers import progress, checklist_state, search, events


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
# Content (read-only)
app.include_router(content.router)
# System
app.include_router(system.router)
# State sync (requires X-Visitor-Key)
app.include_router(progress.router)
app.include_router(checklist_state.router)
# Search
app.include_router(search.router)
# Events
app.include_router(events.router)
