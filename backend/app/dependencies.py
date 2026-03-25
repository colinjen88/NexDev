"""
dependencies.py — DI 依賴：DB session、visitor key 解析
"""
from typing import Optional
from fastapi import Header, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import VisitorSession
from datetime import datetime, timezone
import uuid


async def resolve_visitor_session(
    x_visitor_key: Optional[str] = Header(None, alias="X-Visitor-Key"),
    db: AsyncSession = Depends(get_db),
) -> VisitorSession:
    """
    Resolve or create a VisitorSession from X-Visitor-Key header.
    Raises 401 if header is missing.
    """
    if not x_visitor_key:
        raise HTTPException(
            status_code=401,
            detail={
                "code": "VISITOR_KEY_REQUIRED",
                "message": "X-Visitor-Key header is required for state endpoints.",
            },
        )

    # Look up or create
    stmt = select(VisitorSession).where(VisitorSession.visitor_key == x_visitor_key)
    result = await db.execute(stmt)
    session = result.scalar_one_or_none()

    if not session:
        session = VisitorSession(
            visitor_key=x_visitor_key,
            first_seen_at=datetime.now(timezone.utc),
            last_seen_at=datetime.now(timezone.utc),
        )
        db.add(session)
        await db.flush()
    else:
        session.last_seen_at = datetime.now(timezone.utc)

    return session
