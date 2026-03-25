import uuid
from typing import Optional
from datetime import datetime, date
from sqlalchemy import Text, ForeignKey, BigInteger, Date, Numeric, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSONB
from .base import Base

# 8.2 event_ingest_logs
class EventIngestLog(Base):
    __tablename__ = 'event_ingest_logs'
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    event_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), default=uuid.uuid4, nullable=False)
    request_id: Mapped[Optional[str]] = mapped_column(Text)
    event_name: Mapped[str] = mapped_column(Text, nullable=False)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey('users.id', ondelete='SET NULL'))
    visitor_session_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey('visitor_sessions.id', ondelete='SET NULL'))
    page: Mapped[Optional[str]] = mapped_column(Text)
    occurred_at: Mapped[datetime] = mapped_column(nullable=False)
    received_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    payload: Mapped[dict] = mapped_column(JSONB, default=dict)
    source: Mapped[str] = mapped_column(Text, default='web')

    __table_args__ = (
        Index('idx_event_ingest_logs_event_name', 'event_name'),
        Index('idx_event_ingest_logs_occurred_at', 'occurred_at', postgresql_sorting={'occurred_at': 'DESC'}),
        Index('idx_event_ingest_logs_user_id', 'user_id'),
        Index('idx_event_ingest_logs_visitor_session_id', 'visitor_session_id'),
        Index('idx_event_ingest_logs_payload_gin', 'payload', postgresql_using='gin'),
    )

# 8.3 daily_metrics
class DailyMetric(Base):
    __tablename__ = 'daily_metrics'
    metric_date: Mapped[date] = mapped_column(Date, primary_key=True)
    metric_key: Mapped[str] = mapped_column(Text, primary_key=True)
    dimension_key: Mapped[str] = mapped_column(Text, primary_key=True, default='all')
    metric_value: Mapped[float] = mapped_column(Numeric(18, 4), nullable=False)
    dimensions: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
