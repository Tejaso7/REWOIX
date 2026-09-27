import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    certificate_number = Column(String(100), unique=True, nullable=False, index=True)
    learner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)

    issue_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    pdf_url = Column(String(512), nullable=True)
    verification_url = Column(String(512), nullable=False)
    certificate_hash = Column(String(255), nullable=False)

    learner = relationship("User", back_populates="certificates")
    course = relationship("Course")
