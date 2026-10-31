from typing import List, Optional
from uuid import UUID
from decimal import Decimal
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import require_roles, get_current_active_user
from app.models.user import User, UserRole, UserRoleEnum, TeacherProfile, LearnerProfile
from app.models.course import Course, CourseStatusEnum
from app.models.revenue import RevenueTransaction, Payout
from app.models.learning import Enrollment
from app.models.audit import AuditLog
from app.schemas.admin import (
    AdminDashboardMetrics,
    CourseApprovalRequest,
)
from app.schemas.course import CourseResponse
from app.schemas.revenue import RevenueTransactionResponse, PayoutResponse
from app.schemas.auth import UserResponse
from app.api.v1.auth import build_user_response

router = APIRouter(prefix="/admin", tags=["Admin Business Operations"])


class CoursePriceUpdateRequest(BaseModel):
    price: float = Field(..., ge=0)
    discount_price: Optional[float] = Field(None, ge=0)


class TeacherCommissionUpdateRequest(BaseModel):
    custom_commission_percent: float = Field(..., ge=0.0, le=100.0)


@router.get("/dashboard", response_model=AdminDashboardMetrics)
async def get_admin_dashboard_metrics(
    current_user: User = Depends(require_roles([UserRoleEnum.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    # Total Learners
    stmt_l = select(func.count(UserRole.id)).where(UserRole.role == UserRoleEnum.LEARNER)
    total_learners = (await db.execute(stmt_l)).scalar() or 0

    # Total Teachers
    stmt_t = select(func.count(UserRole.id)).where(UserRole.role == UserRoleEnum.TEACHER)
    total_teachers = (await db.execute(stmt_t)).scalar() or 0

    # Total Courses
    stmt_c = select(func.count(Course.id))
    total_courses = (await db.execute(stmt_c)).scalar() or 0

    # Published Courses
    stmt_pub = select(func.count(Course.id)).where(Course.status == CourseStatusEnum.PUBLISHED)
    published_courses = (await db.execute(stmt_pub)).scalar() or 0

    # Total Pending Course Approvals
    stmt_pend = select(func.count(Course.id)).where(Course.status == CourseStatusEnum.SUBMITTED)
    pending_approvals = (await db.execute(stmt_pend)).scalar() or 0

    # Total Revenue Metrics
    stmt_rev = select(
        func.sum(RevenueTransaction.platform_commission_amount),
        func.sum(RevenueTransaction.teacher_amount),
        func.count(RevenueTransaction.id),
    )
    res_rev = (await db.execute(stmt_rev)).fetchone()

    total_platform_revenue = float(res_rev[0]) if res_rev and res_rev[0] is not None else 0.0
    total_teacher_earnings = float(res_rev[1]) if res_rev and res_rev[1] is not None else 0.0
    total_sales_count = int(res_rev[2]) if res_rev and res_rev[2] is not None else 0

    # Pending Payouts
    stmt_payouts = select(func.count(Payout.id)).where(Payout.status == "PENDING")
    pending_payouts_count = (await db.execute(stmt_payouts)).scalar() or 0

    return AdminDashboardMetrics(
        total_learners=total_learners,
        total_teachers=total_teachers,
        total_courses=total_courses,
        published_courses=published_courses,
        total_sales_count=total_sales_count,
        total_platform_revenue=total_platform_revenue,
        total_teacher_earnings=total_teacher_earnings,
        pending_course_approvals=pending_approvals,
        pending_payouts_count=pending_payouts_count,
    )


@router.get("/courses/pending", response_model=List[CourseResponse])
async def get_pending_courses(
    current_user: User = Depends(require_roles([UserRoleEnum.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Course)
        .options(
            selectinload(Course.teacher),
            selectinload(Course.category),
        )
        .where(Course.status == CourseStatusEnum.SUBMITTED)
        .order_by(Course.created_at.asc())
    )
    result = await db.execute(stmt)
    courses = result.scalars().all()

    return [
        CourseResponse(
            id=c.id,
            teacher_id=c.teacher_id,
            teacher_name=c.teacher.full_name if c.teacher else None,
            category_id=c.category_id,
            category_name=c.category.name if c.category else None,
            title=c.title,
            slug=c.slug,
            subtitle=c.subtitle,
            description=c.description,
            thumbnail_url=c.thumbnail_url,
            price=c.price,
            discount_price=c.discount_price,
            currency=c.currency,
            level=c.level,
            status=c.status,
            rejection_reason=c.rejection_reason,
            is_featured=c.is_featured,
            average_rating=c.average_rating,
            review_count=c.review_count,
            total_learners=c.total_learners,
            sections=[],
            created_at=c.created_at,
        )
        for c in courses
    ]


@router.post("/courses/{course_id}/approve", response_model=CourseResponse)
async def approve_course(
    course_id: UUID,
    approval_in: CourseApprovalRequest,
    current_user: User = Depends(require_roles([UserRoleEnum.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if approval_in.approved:
        course.status = CourseStatusEnum.PUBLISHED
        course.rejection_reason = None
        action_name = "ADMIN_APPROVED_COURSE"
    else:
        course.status = CourseStatusEnum.REJECTED
        course.rejection_reason = approval_in.rejection_reason or "Does not meet quality guidelines"
        action_name = "ADMIN_REJECTED_COURSE"

    db.add(
        AuditLog(
            actor_user_id=current_user.id,
            action=action_name,
            entity_type="Course",
            entity_id=str(course.id),
            details=f"Course '{course.title}' status updated to {course.status.value}",
        )
    )

    await db.commit()
    await db.refresh(course)

    return CourseResponse(
        id=course.id,
        teacher_id=course.teacher_id,
        title=course.title,
        slug=course.slug,
        subtitle=course.subtitle,
        description=course.description,
        thumbnail_url=course.thumbnail_url,
        price=course.price,
        discount_price=course.discount_price,
        currency=course.currency,
        level=course.level,
        status=course.status,
        rejection_reason=course.rejection_reason,
        is_featured=course.is_featured,
        average_rating=course.average_rating,
        review_count=course.review_count,
        total_learners=course.total_learners,
        sections=[],
        created_at=course.created_at,
    )


@router.put("/courses/{course_id}/price", response_model=CourseResponse)
async def admin_update_course_price(
    course_id: UUID,
    price_in: CoursePriceUpdateRequest,
    current_user: User = Depends(require_roles([UserRoleEnum.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Admin feature: Dynamically update course base price and discount price."""
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    course.price = Decimal(str(price_in.price))
    if price_in.discount_price is not None:
        course.discount_price = Decimal(str(price_in.discount_price))
    else:
        course.discount_price = None

    db.add(
        AuditLog(
            actor_user_id=current_user.id,
            action="ADMIN_UPDATE_COURSE_PRICE",
            entity_type="Course",
            entity_id=str(course.id),
            details=f"Admin updated course price to ₹{price_in.price} (Discount: ₹{price_in.discount_price})",
        )
    )

    await db.commit()
    await db.refresh(course)

    return CourseResponse(
        id=course.id,
        teacher_id=course.teacher_id,
        title=course.title,
        slug=course.slug,
        subtitle=course.subtitle,
        description=course.description,
        thumbnail_url=course.thumbnail_url,
        price=course.price,
        discount_price=course.discount_price,
        currency=course.currency,
        level=course.level,
        status=course.status,
        rejection_reason=course.rejection_reason,
        is_featured=course.is_featured,
        average_rating=course.average_rating,
        review_count=course.review_count,
        total_learners=course.total_learners,
        sections=[],
        created_at=course.created_at,
    )


@router.put("/teachers/{teacher_user_id}/commission")
async def admin_update_teacher_commission(
    teacher_user_id: UUID,
    comm_in: TeacherCommissionUpdateRequest,
    current_user: User = Depends(require_roles([UserRoleEnum.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Admin feature: Dynamically customize teacher percentage cut (e.g. 80.0%)."""
    stmt = select(TeacherProfile).where(TeacherProfile.user_id == teacher_user_id)
    t_prof = (await db.execute(stmt)).scalar_one_or_none()

    if not t_prof:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    t_prof.custom_commission_percent = comm_in.custom_commission_percent

    db.add(
        AuditLog(
            actor_user_id=current_user.id,
            action="ADMIN_UPDATE_TEACHER_COMMISSION",
            entity_type="TeacherProfile",
            entity_id=str(t_prof.id),
            details=f"Set custom teacher share to {comm_in.custom_commission_percent}%",
        )
    )

    await db.commit()
    return {
        "message": f"Successfully updated teacher share to {comm_in.custom_commission_percent}%",
        "custom_commission_percent": comm_in.custom_commission_percent,
    }


@router.get("/users", response_model=List[UserResponse])
@router.get("/users/detailed", response_model=List[UserResponse])
async def list_users_detailed(
    current_user: User = Depends(require_roles([UserRoleEnum.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Admin feature: View all users with full onboarding & professional details."""
    stmt = select(User).options(selectinload(User.roles)).order_by(User.created_at.desc())
    result = await db.execute(stmt)
    users = result.scalars().all()

    response_list = []
    for u in users:
        u_resp = await build_user_response(u, db)
        response_list.append(u_resp)

    return response_list


@router.get("/revenue")
async def get_admin_revenue_overview(
    current_user: User = Depends(require_roles([UserRoleEnum.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Admin financial overview: Aggregates GMV, net platform revenue, and payout liabilities."""
    stmt_sales = select(
        func.count(RevenueTransaction.id),
        func.coalesce(func.sum(RevenueTransaction.gross_amount), Decimal("0.00")),
        func.coalesce(func.sum(RevenueTransaction.platform_commission_amount), Decimal("0.00")),
        func.coalesce(func.sum(RevenueTransaction.teacher_amount), Decimal("0.00")),
    )
    res = (await db.execute(stmt_sales)).one()
    total_sales_count, total_gmv, platform_net_revenue, total_teacher_cut = res

    stmt_payouts = select(
        func.coalesce(func.sum(Payout.amount), Decimal("0.00"))
    ).where(Payout.status == "PENDING")
    pending_payouts_total = (await db.execute(stmt_payouts)).scalar() or Decimal("0.00")

    return {
        "total_sales_count": total_sales_count,
        "total_gmv": float(total_gmv),
        "platform_net_revenue": float(platform_net_revenue),
        "total_teacher_cut": float(total_teacher_cut),
        "pending_payouts_total": float(pending_payouts_total),
    }


@router.get("/payouts", response_model=List[PayoutResponse])
async def list_payouts(
    current_user: User = Depends(require_roles([UserRoleEnum.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Payout)
        .options(selectinload(Payout.teacher))
        .order_by(Payout.requested_at.desc())
    )
    result = await db.execute(stmt)
    payouts = result.scalars().all()

    return [
        PayoutResponse(
            id=p.id,
            teacher_id=p.teacher_id,
            teacher_name=p.teacher.full_name if p.teacher else "Instructor",
            amount=p.amount,
            currency=p.currency,
            status=p.status,
            reference_number=p.reference_number,
            notes=p.notes,
            requested_at=p.requested_at,
            processed_at=p.processed_at,
        )
        for p in payouts
    ]


@router.post("/payouts/{payout_id}/approve", response_model=PayoutResponse)
async def approve_payout(
    payout_id: UUID,
    reference_number: str = "REF-SETTLED-001",
    current_user: User = Depends(require_roles([UserRoleEnum.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    payout = await db.get(Payout, payout_id)
    if not payout:
        raise HTTPException(status_code=404, detail="Payout not found")

    if payout.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve payout with status '{payout.status}'. Only PENDING payouts can be approved.",
        )

    payout.status = "PAID"
    payout.reference_number = reference_number
    payout.processed_at = datetime.now(timezone.utc)

    db.add(
        AuditLog(
            actor_user_id=current_user.id,
            action="PAYOUT_APPROVED",
            entity_type="Payout",
            entity_id=str(payout.id),
            details=f"Approved payout of {payout.amount} {payout.currency}",
        )
    )

    await db.commit()
    await db.refresh(payout)

    return PayoutResponse(
        id=payout.id,
        teacher_id=payout.teacher_id,
        amount=payout.amount,
        currency=payout.currency,
        status=payout.status,
        reference_number=payout.reference_number,
        notes=payout.notes,
        requested_at=payout.requested_at,
        processed_at=payout.processed_at,
    )


@router.post("/payouts/{payout_id}/reject", response_model=PayoutResponse)
async def reject_payout(
    payout_id: UUID,
    reason: Optional[str] = None,
    current_user: User = Depends(require_roles([UserRoleEnum.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    payout = await db.get(Payout, payout_id)
    if not payout:
        raise HTTPException(status_code=404, detail="Payout not found")

    if payout.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject payout with status '{payout.status}'. Only PENDING payouts can be rejected.",
        )

    payout.status = "REJECTED"
    payout.notes = f"{payout.notes or ''} [Admin Rejection: {reason or 'Declined by Administrator'}]".strip()
    payout.processed_at = datetime.now(timezone.utc)

    db.add(
        AuditLog(
            actor_user_id=current_user.id,
            action="PAYOUT_REJECTED",
            entity_type="Payout",
            entity_id=str(payout.id),
            details=f"Rejected payout of {payout.amount} {payout.currency}. Reason: {reason or 'None'}",
        )
    )

    await db.commit()
    await db.refresh(payout)

    return PayoutResponse(
        id=payout.id,
        teacher_id=payout.teacher_id,
        amount=payout.amount,
        currency=payout.currency,
        status=payout.status,
        reference_number=payout.reference_number,
        notes=payout.notes,
        requested_at=payout.requested_at,
        processed_at=payout.processed_at,
    )
