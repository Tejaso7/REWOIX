import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Numeric, Float
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class RevenueTransaction(Base):
    __tablename__ = "revenue_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    gross_amount = Column(Numeric(10, 2), nullable=False)
    platform_commission_percent = Column(Float, nullable=False)
    platform_commission_amount = Column(Numeric(10, 2), nullable=False)
    teacher_share_percent = Column(Float, nullable=False)
    teacher_amount = Column(Numeric(10, 2), nullable=False)
    payment_gateway_fee = Column(Numeric(10, 2), default=0.00, nullable=False)
    tax_amount = Column(Numeric(10, 2), default=0.00, nullable=False)
    net_platform_amount = Column(Numeric(10, 2), nullable=False)

    status = Column(String(50), default="SETTLED", nullable=False)  # SETTLED, REFUNDED
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    order = relationship("Order", back_populates="revenue_transaction")
    course = relationship("Course")
    teacher = relationship("User")


class Payout(Base):
    __tablename__ = "payouts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    status = Column(String(50), default="PENDING", nullable=False)  # PENDING, APPROVED, PAID, REJECTED
    reference_number = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)

    requested_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    processed_at = Column(DateTime(timezone=True), nullable=True)

    teacher = relationship("User")
