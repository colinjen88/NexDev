"""
progress.py — GET / PUT /api/v1/me/progress
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone

from app.database import get_db
from app.dependencies import resolve_visitor_session
from app.models.user import VisitorSession
from app.models.state import ReadingProgress
from app.models.content import SubjectType

router = APIRouter(prefix="/api/v1/me", tags=["progress"])


def _meta():
    return {"version": "v1", "servedAt": datetime.now(timezone.utc).isoformat()}


# ── Schemas ──────────────────────────────────────────────────────
class ProgressRecord(BaseModel):
    subjectType: str
    subjectSlug: str
    scrollPercent: float = Field(ge=0, le=100)
    isCompleted: bool = False
    lastReadAt: datetime


class ProgressUpsertRequest(BaseModel):
    records: list[ProgressRecord]


# ── GET /me/progress ─────────────────────────────────────────────
@router.get("/progress")
async def get_progress(
    subjectType: Optional[str] = None,
    visitor: VisitorSession = Depends(resolve_visitor_session),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ReadingProgress).where(
        ReadingProgress.visitor_session_id == visitor.id
    )
    if subjectType:
        try:
            st = SubjectType(subjectType)
            stmt = stmt.where(ReadingProgress.subject_type == st)
        except ValueError:
            pass

    result = await db.execute(stmt)
    rows = result.scalars().all()

    return {
        "data": {
            "records": [
                {
                    "subjectType": r.subject_type.value if r.subject_type else "",
                    "subjectSlug": r.subject_slug,
                    "scrollPercent": float(r.scroll_percent),
                    "isCompleted": r.is_completed,
                    "lastReadAt": r.last_read_at.isoformat() if r.last_read_at else None,
                }
                for r in rows
            ]
        },
        "meta": _meta(),
    }


# ── PUT /me/progress ─────────────────────────────────────────────
@router.put("/progress")
async def upsert_progress(
    body: ProgressUpsertRequest,
    visitor: VisitorSession = Depends(resolve_visitor_session),
    db: AsyncSession = Depends(get_db),
):
    updated = 0

    for rec in body.records:
        # Map string to enum
        try:
            st = SubjectType(rec.subjectType)
        except ValueError:
            st = SubjectType.guide_section  # fallback

        # Find existing
        stmt = select(ReadingProgress).where(
            ReadingProgress.visitor_session_id == visitor.id,
            ReadingProgress.subject_type == st,
            ReadingProgress.subject_slug == rec.subjectSlug,
        )
        existing = (await db.execute(stmt)).scalar_one_or_none()

        if existing:
            # Only update if incoming lastReadAt is newer
            if rec.lastReadAt.replace(tzinfo=timezone.utc) >= (existing.last_read_at.replace(tzinfo=timezone.utc) if existing.last_read_at else datetime.min.replace(tzinfo=timezone.utc)):
                existing.scroll_percent = rec.scrollPercent
                existing.is_completed = rec.isCompleted
                existing.last_read_at = rec.lastReadAt
                if rec.isCompleted and not existing.completed_at:
                    existing.completed_at = rec.lastReadAt
                updated += 1
        else:
            new_progress = ReadingProgress(
                visitor_session_id=visitor.id,
                subject_type=st,
                subject_slug=rec.subjectSlug,
                scroll_percent=rec.scrollPercent,
                is_completed=rec.isCompleted,
                first_read_at=rec.lastReadAt,
                last_read_at=rec.lastReadAt,
                completed_at=rec.lastReadAt if rec.isCompleted else None,
            )
            db.add(new_progress)
            updated += 1

    await db.commit()

    return {"data": {"updated": updated}, "meta": _meta()}
