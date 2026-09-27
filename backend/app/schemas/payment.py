from pydantic import BaseModel
from typing import Optional, Dict, Any
from uuid import UUID
from decimal import Decimal
from datetime import datetime


class OrderCreateRequest(BaseModel):
    course_id: UUID


class OrderResponse(BaseModel):
    id: UUID
    course_id: UUID
    course_title: str
    gateway_order_id: str
    amount: Decimal
    currency: str
    status: str
    razorpay_key_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentVerifyRequest(BaseModel):
    order_id: UUID
    gateway_order_id: str
    gateway_payment_id: str
    gateway_signature: str


class PaymentVerifyResponse(BaseModel):
    success: bool
    message: str
    enrollment_id: Optional[UUID] = None
