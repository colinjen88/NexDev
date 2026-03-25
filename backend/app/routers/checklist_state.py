"""
checklist_state.py — GET / PUT /api/v1/me/checklist
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import uuid

from app.database import get_db
from app.dependencies import resolve_visitor_session
from app.models.user import VisitorSession
from app.models.state import ChecklistItemState
from app.models.checklist import ChecklistItem

router = APIRouter(prefix="/api/v1/me", tags=["checklist-state"])


def _meta():
    return {"version": "v1", "servedAt": datetime.now(timezone.utc).isoformat()}


# ── Schemas ──────────────────────────────────────────────────────
class ChecklistItemUpsert(BaseModel):
    itemId: str   # UUID as string
    isChecked: bool


class ChecklistUpsertRequest(BaseModel):
    items: list[ChecklistItemUpsert]


# ── GET /me/checklist ────────────────────────────────────────────
@router.get("/checklist")
async def get_checklist_state(
    groupCode: Optional[str] = None,
    visitor: VisitorSession = Depends(resolve_visitor_session),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ChecklistItemState).where(
        ChecklistItemState.visitor_session_id == visitor.id
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()

    # If groupCode filter, we need to join with checklist_items → checklist_groups
    if groupCode:
        # Get item IDs belonging to that group
        from app.models.checklist import ChecklistGroup
        grp_stmt = select(ChecklistGroup.id).where(ChecklistGroup.group_code == groupCode)
        grp_result = await db.execute(grp_stmt)
        group_id = grp_result.scalar_one_or_none()
        if group_id:
            item_stmt = select(ChecklistItem.id).where(ChecklistItem.group_id == group_id)
            item_ids = {r for r in (await db.execute(item_stmt)).scalars().all()}
            rows = [r for r in rows if r.item_id in item_ids]

    return {
        "data": {
            "items": [
                {
                    "itemId": str(r.item_id),
                    "isChecked": r.is_checked,
                    "checkedAt": r.checked_at.isoformat() if r.checked_at else None,
                }
                for r in rows
            ]
        },
        "meta": _meta(),
    }


# ── PUT /me/checklist ────────────────────────────────────────────
@router.put("/checklist")
async def upsert_checklist_state(
    body: ChecklistUpsertRequest,
    visitor: VisitorSession = Depends(resolve_visitor_session),
    db: AsyncSession = Depends(get_db),
):
    updated = 0
    now = datetime.now(timezone.utc)

    for item_req in body.items:
        try:
            item_uuid = uuid.UUID(item_req.itemId)
        except ValueError:
            continue

        # Check if item exists in checklist_items
        item_exists = (
            await db.execute(
                select(ChecklistItem.id).where(ChecklistItem.id == item_uuid)
            )
        ).scalar_one_or_none()
        if not item_exists:
            continue

        # Find existing state
        stmt = select(ChecklistItemState).where(
            ChecklistItemState.visitor_session_id == visitor.id,
            ChecklistItemState.item_id == item_uuid,
        )
        existing = (await db.execute(stmt)).scalar_one_or_none()

        if existing:
            existing.is_checked = item_req.isChecked
            existing.checked_at = now if item_req.isChecked else None
        else:
            state = ChecklistItemState(
                item_id=item_uuid,
                visitor_session_id=visitor.id,
                is_checked=item_req.isChecked,
                checked_at=now if item_req.isChecked else None,
            )
            db.add(state)
        updated += 1

    await db.commit()

    return {"data": {"updated": updated}, "meta": _meta()}
