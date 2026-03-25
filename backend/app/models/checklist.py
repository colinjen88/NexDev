import uuid
from typing import Optional, List
from datetime import datetime
from sqlalchemy import Text, Integer, Boolean, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from .base import Base
from .content import Document

# 5.4 checklist_groups
class ChecklistGroup(Base):
    __tablename__ = 'checklist_groups'
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('documents.id', ondelete='CASCADE'), nullable=False)
    group_code: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False)
    related_guide_section_slugs: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)

    document: Mapped["Document"] = relationship(back_populates="checklist_groups")
    checklist_items: Mapped[List["ChecklistItem"]] = relationship(back_populates="group", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint('document_id', 'sort_order', name='uq_checklist_group_sort'),
    )

# 5.5 checklist_items
class ChecklistItem(Base):
    __tablename__ = 'checklist_items'
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('checklist_groups.id', ondelete='CASCADE'), nullable=False)
    item_code: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    label: Mapped[str] = mapped_column(Text, nullable=False)
    guidance: Mapped[Optional[str]] = mapped_column(Text)
    related_section_slug: Mapped[Optional[str]] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False)
    is_required: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)

    group: Mapped["ChecklistGroup"] = relationship(back_populates="checklist_items")

    __table_args__ = (
        UniqueConstraint('group_id', 'sort_order', name='uq_checklist_item_sort'),
        Index('idx_checklist_items_group_id', 'group_id'),
        Index('idx_checklist_items_related_section_slug', 'related_section_slug'),
    )
