import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(255), nullable=False, index=True)  # e.g., USER_LOGIN, COURSE_ENROLLED, ADMIN_APPROVED_COURSE
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)  # e.g. "Mumbai, India", "Bengaluru, India"
    user_agent = Column(String(512), nullable=True)  # e.g. "Chrome 122 on Windows 11"
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    actor = relationship("User", foreign_keys=[actor_user_id], lazy="joined")
