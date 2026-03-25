from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.database import get_db
from app.models.content import Document, DocumentSection, DocumentType
from app.schemas.content import GuideSectionDetail

router = APIRouter(prefix="/api/v1/content", tags=["content"])

@router.get("/guide")
async def get_guide_overview(db: AsyncSession = Depends(get_db)):
    # Minimal MVP returning basic guide document
    stmt = select(Document).where(Document.document_slug == "guide", Document.is_published == True)
    result = await db.execute(stmt)
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(status_code=404, detail="Guide not found")

    sec_stmt = select(DocumentSection).where(DocumentSection.document_id == document.id).order_by(DocumentSection.sort_order)
    sec_result = await db.execute(sec_stmt)
    sections = sec_result.scalars().all()

    return {
        "data": {
            "documentSlug": document.document_slug,
            "title": document.title,
            "subtitle": document.subtitle,
            "updatedAt": document.updated_at.isoformat(),
            "contentVersion": document.content_version,
            "sections": [
                {
                    "sectionSlug": sec.section_slug,
                    "title": sec.title,
                    "summary": sec.summary,
                    "sortOrder": sec.sort_order,
                    "estimatedReadMinutes": sec.estimated_read_minutes
                } for sec in sections
            ]
        },
        "meta": {"version": "v1"}
    }
