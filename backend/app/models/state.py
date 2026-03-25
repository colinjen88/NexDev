import uuid
from typing import Optional
from datetime import datetime
from sqlalchemy import Text, Boolean, ForeignKey, UniqueConstraint, Index, CheckConstraint, Numeric, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base
from .content import SubjectType

# 7.1 reading_progress
class ReadingProgress(Base):
    __tablename__ = 'reading_progress'
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'))
    visitor_session_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey('visitor_sessions.id', ondelete='CASCADE'))
    subject_type: Mapped[SubjectType] = mapped_column(Enum(SubjectType), nullable=False)
    subject_slug: Mapped[str] = mapped_column(Text, nullable=False)
    scroll_percent: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    first_read_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    last_read_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    completed_at: Mapped[Optional[datetime]] = mapped_column()
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        CheckConstraint(
            "(user_id IS NOT NULL AND visitor_session_id IS NULL) OR "
            "(user_id IS NULL AND visitor_session_id IS NOT NULL)",
            name="chk_reading_progress_principal"
        ),
        CheckConstraint("scroll_percent >= 0 AND scroll_percent <= 100", name="chk_reading_progress_scroll_percent"),
        # uq_reading_progress_user_subject and visitor equivalents are handled via conditional unique indices in alembic ideally,
        # but here we can define standard ones if we assume either or. Partial indexes are better done via raw DDL or specific Index constructs.
        Index('uq_reading_progress_user_subject', 'user_id', 'subject_type', 'subject_slug', unique=True, postgresql_where="user_id IS NOT NULL"),
        Index('uq_reading_progress_visitor_subject', 'visitor_session_id', 'subject_type', 'subject_slug', unique=True, postgresql_where="visitor_session_id IS NOT NULL"),
        Index('idx_reading_progress_last_read_at', 'last_read_at', postgresql_sorting={'last_read_at': 'DESC'})
    )

# 7.2 checklist_item_states
class ChecklistItemState(Base):
    __tablename__ = 'checklist_item_states'
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    item_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('checklist_items.id', ondelete='CASCADE'), nullable=False)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'))
    visitor_session_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey('visitor_sessions.id', ondelete='CASCADE'))
    is_checked: Mapped[bool] = mapped_column(Boolean, default=False)
    checked_at: Mapped[Optional[datetime]] = mapped_column()
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        CheckConstraint(
            "(user_id IS NOT NULL AND visitor_session_id IS NULL) OR "
            "(user_id IS NULL AND visitor_session_id IS NOT NULL)",
            name="chk_checklist_item_states_principal"
        ),
        Index('uq_checklist_item_states_user_item', 'user_id', 'item_id', unique=True, postgresql_where="user_id IS NOT NULL"),
        Index('uq_checklist_item_states_visitor_item', 'visitor_session_id', 'item_id', unique=True, postgresql_where="visitor_session_id IS NOT NULL"),
        Index('idx_checklist_item_states_item_id', 'item_id')
    )

# 7.3 bookmarks
class Bookmark(Base):
    __tablename__ = 'bookmarks'
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    section_slug: Mapped[str] = mapped_column(Text, nullable=False)
    note: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('user_id', 'section_slug', name='uq_bookmark_user_section'),
    )
