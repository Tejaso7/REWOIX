import uuid
from decimal import Decimal
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.core.payment import get_payment_provider
from app.core.config import settings
from app.models.user import User, TeacherProfile
from app.models.course import Course, CourseStatusEnum
from app.models.payment import Order, Payment, OrderStatusEnum
from app.models.learning import Enrollment
from app.models.revenue import RevenueTransaction
from app.schemas.payment import (
    OrderCreateRequest,
    OrderResponse,
    PaymentVerifyRequest,
    PaymentVerifyResponse,
)

router = APIRouter(prefix="/payments", tags=["Payments & Checkout"])


@router.post("/create-order", response_model=OrderResponse)
async def create_checkout_order(
    order_in: OrderCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Course).where(Course.id == order_in.course_id)
    result = await db.execute(stmt)
    course = result.scalar_one_or_none()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if course.status != CourseStatusEnum.PUBLISHED:
        raise HTTPException(status_code=400, detail="Course is not available for purchase")

    # Check if already enrolled
    stmt_enr = select(Enrollment).where(
        Enrollment.course_id == course.id, Enrollment.learner_id == current_user.id
    )
    existing_enr = (await db.execute(stmt_enr)).scalar_one_or_none()
    if existing_enr:
        raise HTTPException(status_code=400, detail="You are already enrolled in this course")

    # Compute final payable amount (discount price if valid)
    payable_price = course.discount_price if course.discount_price and course.discount_price > Decimal("0.00") else course.price
    amount_in_cents = int(payable_price * 100)

    payment_provider = get_payment_provider()
    receipt_id = f"rcpt_{uuid.uuid4().hex[:10]}"
    notes = {
        "learner_id": str(current_user.id),
        "course_id": str(course.id),
    }

    gateway_order = await payment_provider.create_order(
        amount_in_cents=amount_in_cents,
        currency=course.currency,
        receipt_id=receipt_id,
        notes=notes,
    )

    order = Order(
        learner_id=current_user.id,
        course_id=course.id,
        gateway_order_id=gateway_order["order_id"],
        amount=payable_price,
        currency=course.currency,
        status=OrderStatusEnum.CREATED,
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)

    return OrderResponse(
        id=order.id,
        course_id=course.id,
        course_title=course.title,
        gateway_order_id=order.gateway_order_id,
        amount=order.amount,
        currency=order.currency,
        status=order.status.value,
        razorpay_key_id=settings.RAZORPAY_KEY_ID,
        created_at=order.created_at,
    )


@router.post("/verify", response_model=PaymentVerifyResponse)
async def verify_payment_and_enroll(
    verify_in: PaymentVerifyRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Order).options(selectinload(Order.course)).where(Order.id == verify_in.order_id)
    order = (await db.execute(stmt)).scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status == OrderStatusEnum.SUCCESS:
        # Already processed
        stmt_e = select(Enrollment).where(Enrollment.order_id == order.id)
        e = (await db.execute(stmt_e)).scalar_one_or_none()
        return PaymentVerifyResponse(
            success=True,
            message="Payment already verified and enrolled",
            enrollment_id=e.id if e else None,
        )

    payment_provider = get_payment_provider()
    is_valid = await payment_provider.verify_payment_signature(
        order_id=verify_in.gateway_order_id,
        payment_id=verify_in.gateway_payment_id,
        signature=verify_in.gateway_signature,
    )

    if not is_valid:
        order.status = OrderStatusEnum.FAILED
        payment_record = Payment(
            order_id=order.id,
            gateway_payment_id=verify_in.gateway_payment_id,
            gateway_signature=verify_in.gateway_signature,
            status="FAILED",
            error_message="Invalid HMAC signature",
        )
        db.add(payment_record)
        await db.commit()
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    # Mark Order as Success
    order.status = OrderStatusEnum.SUCCESS
    payment_record = Payment(
        order_id=order.id,
        gateway_payment_id=verify_in.gateway_payment_id,
        gateway_signature=verify_in.gateway_signature,
        status="SUCCESS",
    )
    db.add(payment_record)

    # 1. Create Enrollment
    enrollment = Enrollment(
        learner_id=current_user.id,
        course_id=order.course_id,
        order_id=order.id,
    )
    db.add(enrollment)

    # Increment course total learners
    course = order.course
    if course:
        course.total_learners += 1

    # 2. Calculate Dynamic Revenue Split & Create Financial Ledger Entry
    teacher_share_percent = settings.DEFAULT_TEACHER_SHARE_PERCENT
    t_prof = None
    if course:
        stmt_t = select(TeacherProfile).where(TeacherProfile.user_id == course.teacher_id)
        t_prof = (await db.execute(stmt_t)).scalar_one_or_none()
        if t_prof and t_prof.custom_commission_percent is not None:
            teacher_share_percent = float(t_prof.custom_commission_percent)

    platform_comm_percent = 100.0 - teacher_share_percent

    gross = order.amount
    platform_comm_amount = Decimal(str(round(float(gross) * (platform_comm_percent / 100.0), 2)))
    teacher_amount = Decimal(str(round(float(gross) * (teacher_share_percent / 100.0), 2)))
    net_platform = platform_comm_amount

    rev_transaction = RevenueTransaction(
        order_id=order.id,
        course_id=order.course_id,
        teacher_id=course.teacher_id if course else current_user.id,
        gross_amount=gross,
        platform_commission_percent=platform_comm_percent,
        platform_commission_amount=platform_comm_amount,
        teacher_share_percent=teacher_share_percent,
        teacher_amount=teacher_amount,
        net_platform_amount=net_platform,
        status="SETTLED",
    )
    db.add(rev_transaction)

    # Update Teacher total earnings profile
    if course:
        stmt_t = select(TeacherProfile).where(TeacherProfile.user_id == course.teacher_id)
        t_prof = (await db.execute(stmt_t)).scalar_one_or_none()
        if t_prof:
            current_earnings = Decimal(t_prof.total_earnings or "0.00")
            t_prof.total_earnings = str(current_earnings + teacher_amount)

    await db.commit()
    await db.refresh(enrollment)

    return PaymentVerifyResponse(
        success=True,
        message="Payment verified successfully. Course access granted!",
        enrollment_id=enrollment.id,
    )


@router.post("/webhook")
async def razorpay_webhook_listener(request: Request, db: AsyncSession = Depends(get_db)):
    """Receives Razorpay server-to-server webhook notifications for payment events."""
    payload = await request.json()
    event = payload.get("event")
    
    if event == "payment.captured":
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        order_id = payment_entity.get("order_id")
        payment_id = payment_entity.get("id")

        if order_id:
            stmt = select(Order).where(Order.gateway_order_id == order_id)
            order = (await db.execute(stmt)).scalar_one_or_none()
            if order and order.status != OrderStatusEnum.SUCCESS:
                order.status = OrderStatusEnum.SUCCESS
                await db.commit()

    return {"status": "ok"}
