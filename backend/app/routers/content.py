from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone
from app.database import get_db
from app.models.content import Document, DocumentSection, OutlineSection, DocumentType
from app.models.checklist import ChecklistGroup, ChecklistItem

router = APIRouter(prefix="/api/v1/content", tags=["content"])


def _meta():
    return {
        "version": "v1",
        "servedAt": datetime.now(timezone.utc).isoformat()
    }


# ─── 5.1  GET /api/v1/content/navigation ────────────────────────
@router.get("/navigation")
async def get_navigation(db: AsyncSession = Depends(get_db)):
    """提供首頁流程地圖 + 左欄導航 + 章節與 checklist 關聯"""
    stmt = select(Document).where(
        Document.document_slug == "guide",
        Document.is_published == True,
    )
    doc = (await db.execute(stmt)).scalar_one_or_none()
    if not doc:
        raise HTTPException(404, detail="Guide document not found")

    sec_stmt = (
        select(DocumentSection)
        .where(DocumentSection.document_id == doc.id)
        .order_by(DocumentSection.sort_order)
    )
    sections = (await db.execute(sec_stmt)).scalars().all()

    # Group sections by phase code for the phase map
    phase_map: dict[str, dict] = {}
    for s in sections:
        pc = s.phase_code or "none"
        if pc not in phase_map:
            phase_map[pc] = {
                "phaseCode": pc,
                "title": "",
                "sortOrder": s.sort_order,
                "estimatedReadMinutes": 0,
                "sectionSlugs": [],
            }
        phase_map[pc]["sectionSlugs"].append(s.section_slug)
        phase_map[pc]["estimatedReadMinutes"] += s.estimated_read_minutes

    return {
        "data": {
            "document": {
                "documentSlug": doc.document_slug,
                "title": doc.title,
                "contentVersion": doc.content_version,
                "updatedAt": doc.updated_at.isoformat(),
            },
            "phases": list(phase_map.values()),
            "sections": [
                {
                    "sectionSlug": s.section_slug,
                    "title": s.title,
                    "summary": s.summary,
                    "sortOrder": s.sort_order,
                    "phaseCode": s.phase_code,
                    "estimatedReadMinutes": s.estimated_read_minutes,
                    "relatedChecklistGroupCodes": s.related_checklist_group_codes or [],
                }
                for s in sections
            ],
        },
        "meta": _meta(),
    }


# ─── 5.2  GET /api/v1/content/guide ─────────────────────────────
@router.get("/guide")
async def get_guide_overview(db: AsyncSession = Depends(get_db)):
    """取得 guide 頁的總覽資料"""
    stmt = select(Document).where(
        Document.document_slug == "guide",
        Document.is_published == True,
    )
    doc = (await db.execute(stmt)).scalar_one_or_none()
    if not doc:
        raise HTTPException(404, detail="Guide document not found")

    sec_stmt = (
        select(DocumentSection)
        .where(DocumentSection.document_id == doc.id)
        .order_by(DocumentSection.sort_order)
    )
    sections = (await db.execute(sec_stmt)).scalars().all()

    return {
        "data": {
            "documentSlug": doc.document_slug,
            "title": doc.title,
            "subtitle": doc.subtitle,
            "updatedAt": doc.updated_at.isoformat(),
            "contentVersion": doc.content_version,
            "sections": [
                {
                    "sectionSlug": s.section_slug,
                    "title": s.title,
                    "summary": s.summary,
                    "sortOrder": s.sort_order,
                    "estimatedReadMinutes": s.estimated_read_minutes,
                }
                for s in sections
            ],
        },
        "meta": _meta(),
    }


# ─── 5.3  GET /api/v1/content/guide/{sectionSlug} ───────────────
@router.get("/guide/{section_slug}")
async def get_guide_section(section_slug: str, db: AsyncSession = Depends(get_db)):
    """guide 單章節內容"""
    stmt = select(DocumentSection).where(DocumentSection.section_slug == section_slug)
    section = (await db.execute(stmt)).scalar_one_or_none()

    if not section:
        raise HTTPException(
            404,
            detail={
                "code": "SECTION_NOT_FOUND",
                "message": f"Section '{section_slug}' does not exist.",
            },
        )

    # Fetch parent document for document_slug
    doc = (await db.execute(select(Document).where(Document.id == section.document_id))).scalar_one()

    # Build prev / next
    prev_section = None
    next_section = None
    if section.prev_section_slug:
        ps = (
            await db.execute(
                select(DocumentSection.section_slug, DocumentSection.title).where(
                    DocumentSection.section_slug == section.prev_section_slug
                )
            )
        ).first()
        if ps:
            prev_section = {"sectionSlug": ps[0], "title": ps[1]}

    if section.next_section_slug:
        ns = (
            await db.execute(
                select(DocumentSection.section_slug, DocumentSection.title).where(
                    DocumentSection.section_slug == section.next_section_slug
                )
            )
        ).first()
        if ns:
            next_section = {"sectionSlug": ns[0], "title": ns[1]}

    return {
        "data": {
            "documentSlug": doc.document_slug,
            "sectionSlug": section.section_slug,
            "title": section.title,
            "summary": section.summary,
            "phaseCode": section.phase_code,
            "estimatedReadMinutes": section.estimated_read_minutes,
            "updatedAt": section.updated_at.isoformat(),
            "bodyMarkdown": section.body_markdown,
            "headings": section.headings_json or [],
            "relatedChecklistGroupCodes": section.related_checklist_group_codes or [],
            "prevSection": prev_section,
            "nextSection": next_section,
        },
        "meta": _meta(),
    }


# ─── 5.4  GET /api/v1/content/outline ───────────────────────────
@router.get("/outline")
async def get_outline(db: AsyncSession = Depends(get_db)):
    """速讀模式摘要卡"""
    stmt = select(Document).where(
        Document.document_slug == "outline",
        Document.is_published == True,
    )
    doc = (await db.execute(stmt)).scalar_one_or_none()
    if not doc:
        raise HTTPException(404, detail="Outline document not found")

    sec_stmt = (
        select(OutlineSection)
        .where(OutlineSection.document_id == doc.id)
        .order_by(OutlineSection.sort_order)
    )
    sections = (await db.execute(sec_stmt)).scalars().all()

    return {
        "data": {
            "documentSlug": doc.document_slug,
            "title": doc.title,
            "updatedAt": doc.updated_at.isoformat(),
            "sections": [
                {
                    "sectionSlug": s.section_slug,
                    "title": s.title,
                    "summary": s.summary,
                    "highlights": s.highlights_json or [],
                    "relatedGuideSectionSlugs": s.related_guide_section_slugs or [],
                }
                for s in sections
            ],
        },
        "meta": _meta(),
    }


# ─── 5.5  GET /api/v1/content/checklist ─────────────────────────
@router.get("/checklist")
async def get_checklist(db: AsyncSession = Depends(get_db)):
    """提供 checklist 結構與項目對應"""
    stmt = select(Document).where(
        Document.document_slug == "checklist",
        Document.is_published == True,
    )
    doc = (await db.execute(stmt)).scalar_one_or_none()
    if not doc:
        raise HTTPException(404, detail="Checklist document not found")

    grp_stmt = (
        select(ChecklistGroup)
        .where(ChecklistGroup.document_id == doc.id)
        .order_by(ChecklistGroup.sort_order)
        .options(selectinload(ChecklistGroup.checklist_items))
    )
    groups = (await db.execute(grp_stmt)).scalars().unique().all()

    return {
        "data": {
            "documentSlug": doc.document_slug,
            "title": doc.title,
            "updatedAt": doc.updated_at.isoformat(),
            "groups": [
                {
                    "groupCode": g.group_code,
                    "title": g.title,
                    "description": g.description,
                    "sortOrder": g.sort_order,
                    "relatedGuideSectionSlugs": g.related_guide_section_slugs or [],
                    "items": sorted(
                        [
                            {
                                "itemId": str(item.id),
                                "itemCode": item.item_code,
                                "label": item.label,
                                "sortOrder": item.sort_order,
                                "relatedSectionSlug": item.related_section_slug,
                            }
                            for item in g.checklist_items
                        ],
                        key=lambda x: x["sortOrder"],
                    ),
                }
                for g in groups
            ],
        },
        "meta": _meta(),
    }
