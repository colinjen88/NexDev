import uuid
from typing import Optional, List
from datetime import datetime
from sqlalchemy import String, Text, Boolean, Integer, SmallInteger, ForeignKey, Enum, Numeric, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY, INET, CITEXT
from .base import Base
import enum

class DocumentType(str, enum.Enum):
    guide = 'guide'
    outline = 'outline'
    checklist = 'checklist'

class UserStatus(str, enum.Enum):
    active = 'active'
    disabled = 'disabled'

class SubjectType(str, enum.Enum):
    guide_document = 'guide_document'
    guide_section = 'guide_section'
    outline_section = 'outline_section'
    checklist_group = 'checklist_group'

class SearchSourceType(str, enum.Enum):
    guide_section = 'guide_section'
    outline_section = 'outline_section'
    checklist_item = 'checklist_item'

# 5.1 documents
class Document(Base):
    __tablename__ = 'documents'
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_slug: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    document_type: Mapped[DocumentType] = mapped_column(Enum(DocumentType), nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    subtitle: Mapped[Optional[str]] = mapped_column(Text)
    source_path: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    source_checksum: Mapped[str] = mapped_column(Text, nullable=False)
    content_version: Mapped[str] = mapped_column(Text, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)

    document_sections: Mapped[List["DocumentSection"]] = relationship(back_populates="document", cascade="all, delete-orphan")
    outline_sections: Mapped[List["OutlineSection"]] = relationship(back_populates="document", cascade="all, delete-orphan")
    checklist_groups: Mapped[List["ChecklistGroup"]] = relationship(back_populates="document", cascade="all, delete-orphan")

# 5.2 document_sections
class DocumentSection(Base):
    __tablename__ = 'document_sections'
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('documents.id', ondelete='CASCADE'), nullable=False)
    section_slug: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(Text)
    phase_code: Mapped[Optional[str]] = mapped_column(Text)
    level: Mapped[int] = mapped_column(SmallInteger, default=2)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False)
    estimated_read_minutes: Mapped[int] = mapped_column(Integer, default=1)
    body_markdown: Mapped[str] = mapped_column(Text, nullable=False)
    body_plaintext: Mapped[str] = mapped_column(Text, nullable=False)
    headings_json: Mapped[dict] = mapped_column(JSONB, default=list) # Should typically be a list
    related_checklist_group_codes: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list)
    prev_section_slug: Mapped[Optional[str]] = mapped_column(Text)
    next_section_slug: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)

    document: Mapped["Document"] = relationship(back_populates="document_sections")

    __table_args__ = (
        UniqueConstraint('document_id', 'sort_order', name='uq_doc_section_sort'),
        Index('idx_document_sections_document_id', 'document_id'),
        Index('idx_document_sections_phase_code', 'phase_code'),
    )

# 5.3 outline_sections
class OutlineSection(Base):
    __tablename__ = 'outline_sections'
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey('documents.id', ondelete='CASCADE'), nullable=False)
    section_slug: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    highlights_json: Mapped[dict] = mapped_column(JSONB, default=list)
    related_guide_section_slugs: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)

    document: Mapped["Document"] = relationship(back_populates="outline_sections")

    __table_args__ = (
        UniqueConstraint('document_id', 'sort_order', name='uq_outline_section_sort'),
    )
