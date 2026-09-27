from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from decimal import Decimal
from datetime import datetime


class RevenueTransactionResponse(BaseModel):
    id: UUID
    order_id: UUID
    course_id: UUID
    course_title: Optional[str] = None
    teacher_id: UUID
    teacher_name: Optional[str] = None
    gross_amount: Decimal
    platform_commission_percent: float
    platform_commission_amount: Decimal
    teacher_share_percent: float
    teacher_amount: Decimal
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class PayoutRequest(BaseModel):
    amount: Decimal
    notes: Optional[str] = None


class PayoutResponse(BaseModel):
    id: UUID
    teacher_id: UUID
    teacher_name: Optional[str] = None
    amount: Decimal
    currency: str
    status: str
    reference_number: Optional[str] = None
    notes: Optional[str] = None
    requested_at: datetime
    processed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TeacherEarningsSummary(BaseModel):
    total_sales_count: int
    total_gross_earnings: Decimal
    available_payout_balance: Decimal
    paid_payouts: Decimal
    recent_transactions: List[RevenueTransactionResponse] = []
