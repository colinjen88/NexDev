from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from datetime import datetime, timezone
from app.database import get_db
from app.config import settings
import redis.asyncio as aioredis

router = APIRouter(prefix="/api/v1/system", tags=["system"])


def _meta():
    return {
        "version": "v1",
        "servedAt": datetime.now(timezone.utc).isoformat()
    }


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """健康檢查 — DB + Redis 連接"""
    checks: dict[str, str] = {}

    # Database check
    try:
        await db.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception:
        checks["database"] = "fail"

    # Redis check
    try:
        r = aioredis.from_url(settings.REDIS_URL)
        pong = await r.ping()
        checks["redis"] = "ok" if pong else "fail"
        await r.aclose()
    except Exception:
        checks["redis"] = "fail"

    overall = "ok" if all(v == "ok" for v in checks.values()) else "degraded"

    return {
        "data": {
            "status": overall,
            "checks": checks,
        },
        "meta": _meta(),
    }


@router.get("/version")
async def get_version():
    """提供服務版本、內容版本、部署資訊"""
    return {
        "data": {
            "apiVersion": "v1",
            "serviceVersion": "0.1.0",
            "contentVersion": "2026-03-24",
            "gitSha": "unknown",
            "builtAt": "unknown",
        },
        "meta": _meta(),
    }
