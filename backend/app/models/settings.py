import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Float
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class PlatformSetting(Base):
    __tablename__ = "platform_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    setting_key = Column(String(100), unique=True, nullable=False, index=True)
    setting_value = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)


class CommissionRule(Base):
    __tablename__ = "commission_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rule_name = Column(String(100), nullable=False)
    platform_commission_percent = Column(Float, nullable=False)
    teacher_share_percent = Column(Float, nullable=False)
    rule_type = Column(String(50), default="GLOBAL", nullable=False)  # GLOBAL, CATEGORY, TEACHER
    target_id = Column(String(255), nullable=True)  # Category ID or Teacher ID if specific
    is_active = Column(String(10), default="true", nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
