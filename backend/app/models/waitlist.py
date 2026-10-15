import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class WaitlistEntry(Base):
    __tablename__ = "waitlist_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    role_stage = Column(String(100), nullable=False)
    target_domain = Column(String(100), nullable=True)
    queue_number = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
