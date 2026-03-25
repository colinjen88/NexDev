"""
events.py — POST /api/v1/events/batch
"""
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone

from app.database import get_db
from app.models.event import EventIngestLog

router = APIRouter(prefix="/api/v1/events", tags=["events"])


def _meta():
    return {"version": "v1", "servedAt": datetime.now(timezone.utc).isoformat()}


class EventItem(BaseModel):
    eventName: str
    occurredAt: datetime
    page: Optional[str] = None
    payload: dict = {}


class EventBatchRequest(BaseModel):
    events: list[EventItem]


@router.post("/batch")
async def ingest_events(
    body: EventBatchRequest,
    x_visitor_key: Optional[str] = Header(None, alias="X-Visitor-Key"),
    db: AsyncSession = Depends(get_db),
):
    if len(body.events) > 50:
        raise HTTPException(
            400,
            detail={
                "code": "BATCH_TOO_LARGE",
                "message": "Maximum 50 events per batch.",
            },
        )

    # Resolve visitor session ID if header present
    visitor_session_id = None
    if x_visitor_key:
        from sqlalchemy import select
        from app.models.user import VisitorSession

        stmt = select(VisitorSession).where(VisitorSession.visitor_key == x_visitor_key)
        visitor = (await db.execute(stmt)).scalar_one_or_none()
        if visitor:
            visitor_session_id = visitor.id

    accepted = 0
    for evt in body.events:
        log = EventIngestLog(
            event_name=evt.eventName,
            occurred_at=evt.occurredAt,
            received_at=datetime.now(timezone.utc),
            page=evt.page,
            payload=evt.payload,
            visitor_session_id=visitor_session_id,
            source="web",
        )
        db.add(log)
        accepted += 1

    await db.commit()

    return {"data": {"accepted": accepted}, "meta": _meta()}
