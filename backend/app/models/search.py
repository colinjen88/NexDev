import uuid
from typing import Optional
from datetime import datetime
from sqlalchemy import Text, Index, Enum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from .base import Base
from .content import SearchSourceType

# 8.1 search_documents
class SearchDocument(Base):
    __tablename__ = 'search_documents'
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_type: Mapped[SearchSourceType] = mapped_column(Enum(SearchSourceType), nullable=False)
    source_key: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    document_slug: Mapped[str] = mapped_column(Text, nullable=False)
    section_slug: Mapped[Optional[str]] = mapped_column(Text)
    group_code: Mapped[Optional[str]] = mapped_column(Text)
    item_code: Mapped[Optional[str]] = mapped_column(Text)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    body_text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index('idx_search_documents_document_slug', 'document_slug'),
        Index('idx_search_documents_section_slug', 'section_slug'),
        Index('idx_search_documents_group_code', 'group_code'),
        # Note: Depending on engine config, trigram indices require 'gin_trgm_ops'
        Index('idx_search_documents_title_trgm', 'title', postgresql_using='gin', postgresql_ops={'title': 'gin_trgm_ops'}),
        Index('idx_search_documents_body_text_trgm', 'body_text', postgresql_using='gin', postgresql_ops={'body_text': 'gin_trgm_ops'}),
    )
