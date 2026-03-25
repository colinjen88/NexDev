"""
search.py — GET /api/v1/search
Uses pg_trgm similarity for Chinese-friendly search.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text, or_
from datetime import datetime, timezone

from app.database import get_db
from app.models.search import SearchDocument, SearchSourceType

router = APIRouter(prefix="/api/v1", tags=["search"])


def _meta():
    return {"version": "v1", "servedAt": datetime.now(timezone.utc).isoformat()}


# Map API type names to enum values
TYPE_MAP = {
    "guideSection": SearchSourceType.guide_section,
    "outlineSection": SearchSourceType.outline_section,
    "checklistItem": SearchSourceType.checklist_item,
}


@router.get("/search")
async def search(
    q: str = Query(..., min_length=1, description="Search query"),
    types: str | None = Query(None, description="Comma-separated types filter"),
    limit: int = Query(10, ge=1, le=30, description="Max results"),
    db: AsyncSession = Depends(get_db),
):
    if not q or len(q.strip()) < 1:
        raise HTTPException(
            400,
            detail={"code": "SEARCH_QUERY_REQUIRED", "message": "Query is required."},
        )

    q_stripped = q.strip()

    # Build type filter
    type_filters = []
    if types:
        for t in types.split(","):
            t = t.strip()
            if t in TYPE_MAP:
                type_filters.append(TYPE_MAP[t])

    # pg_trgm similarity search
    # Use LIKE for simple substring match (works well for CJK),
    # fall back to trigram similarity for ranking
    like_pattern = f"%{q_stripped}%"

    stmt = (
        select(SearchDocument)
        .where(
            or_(
                SearchDocument.title.ilike(like_pattern),
                SearchDocument.body_text.ilike(like_pattern),
            )
        )
    )

    if type_filters:
        stmt = stmt.where(SearchDocument.source_type.in_(type_filters))

    stmt = stmt.limit(limit)
    result = await db.execute(stmt)
    rows = result.scalars().all()

    # Build response
    results = []
    for r in rows:
        # Generate snippet — find first occurrence of query in body_text
        snippet = ""
        idx = r.body_text.lower().find(q_stripped.lower()) if r.body_text else -1
        if idx >= 0:
            start = max(0, idx - 30)
            end = min(len(r.body_text), idx + len(q_stripped) + 60)
            snippet = ("…" if start > 0 else "") + r.body_text[start:end] + ("…" if end < len(r.body_text) else "")
        else:
            snippet = r.body_text[:100] + "…" if r.body_text and len(r.body_text) > 100 else (r.body_text or "")

        results.append({
            "type": r.source_type.value.replace("_", "").replace("guide section", "guideSection"),  # normalize
            "title": r.title,
            "slug": r.section_slug or r.item_code or "",
            "documentSlug": r.document_slug,
            "sectionSlug": r.section_slug,
            "groupCode": r.group_code,
            "snippet": snippet,
        })

    return {
        "data": {
            "query": q_stripped,
            "results": results,
        },
        "meta": _meta(),
    }
