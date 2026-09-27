from typing import List
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.user import User, UserRoleEnum, TeacherProfile
from app.models.course import Course, CourseStatusEnum
from app.models.revenue import RevenueTransaction, Payout
from app.models.learning import Enrollment
from app.schemas.revenue import (
    TeacherEarningsSummary,
    RevenueTransactionResponse,
    PayoutRequest,
    PayoutResponse,
)
from app.schemas.course import CourseResponse, SectionResponse, LessonResponse

router = APIRouter(prefix="/teacher", tags=["Teacher Operations"])


@router.get("/dashboard")
async def get_teacher_dashboard_overview(
    current_user: User = Depends(require_roles([UserRoleEnum.TEACHER, UserRoleEnum.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    # Total courses created
    stmt_courses = select(func.count(Course.id)).where(Course.teacher_id == current_user.id)
    total_courses = (await db.execute(stmt_courses)).scalar() or 0

    # Total published courses
    stmt_pub = select(func.count(Course.id)).where(
        Course.teacher_id == current_user.id, Course.status == CourseStatusEnum.PUBLISHED
    )
    published_courses = (await db.execute(stmt_pub)).scalar() or 0

    # Total students enrolled across all teacher courses
    stmt_students = (
        select(func.count(Enrollment.id))
        .join(Course, Enrollment.course_id == Course.id)
        .where(Course.teacher_id == current_user.id)
    )
    total_students = (await db.execute(stmt_students)).scalar() or 0

    # Total financial earnings
    stmt_rev = select(
        func.sum(RevenueTransaction.teacher_amount), func.count(RevenueTransaction.id)
    ).where(RevenueTransaction.teacher_id == current_user.id)
    res_rev = (await db.execute(stmt_rev)).fetchone()
    total_earnings = float(res_rev[0]) if res_rev and res_rev[0] is not None else 0.0
    total_sales_count = int(res_rev[1]) if res_rev and res_rev[1] is not None else 0

    # Teacher Profile
    stmt_prof = select(TeacherProfile).where(TeacherProfile.user_id == current_user.id)
    t_prof = (await db.execute(stmt_prof)).scalar_one_or_none()

    return {
        "teacher_name": current_user.full_name,
        "total_courses": total_courses,
        "published_courses": published_courses,
        "total_students": total_students,
        "total_earnings": total_earnings,
        "total_sales_count": total_sales_count,
        "headline": t_prof.headline if t_prof else "",
        "payout_account_info": t_prof.payout_account_info if t_prof else "",
    }


@router.get("/earnings", response_model=TeacherEarningsSummary)
async def get_teacher_earnings(
    current_user: User = Depends(require_roles([UserRoleEnum.TEACHER, UserRoleEnum.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(RevenueTransaction)
        .options(selectinload(RevenueTransaction.course))
        .where(RevenueTransaction.teacher_id == current_user.id)
        .order_by(RevenueTransaction.created_at.desc())
    )
    result = await db.execute(stmt)
    txs = result.scalars().all()

    total_gross = sum([t.teacher_amount for t in txs], Decimal("0.00"))

    # Paid payouts sum
    stmt_payouts = select(func.sum(Payout.amount)).where(
        Payout.teacher_id == current_user.id, Payout.status == "PAID"
    )
    paid_sum = (await db.execute(stmt_payouts)).scalar() or Decimal("0.00")
    available_balance = max(Decimal("0.00"), total_gross - paid_sum)

    tx_responses = [
        RevenueTransactionResponse(
            id=t.id,
            order_id=t.order_id,
            course_id=t.course_id,
            course_title=t.course.title if t.course else "Course",
            teacher_id=t.teacher_id,
            teacher_name=current_user.full_name,
            gross_amount=t.gross_amount,
            platform_commission_percent=t.platform_commission_percent,
            platform_commission_amount=t.platform_commission_amount,
            teacher_share_percent=t.teacher_share_percent,
            teacher_amount=t.teacher_amount,
            status=t.status,
            created_at=t.created_at,
        )
        for t in txs
    ]

    return TeacherEarningsSummary(
        total_sales_count=len(txs),
        total_gross_earnings=total_gross,
        available_payout_balance=available_balance,
        paid_payouts=paid_sum,
        recent_transactions=tx_responses,
    )


@router.post("/payouts/request", response_model=PayoutResponse)
async def request_payout(
    payout_in: PayoutRequest,
    current_user: User = Depends(require_roles([UserRoleEnum.TEACHER, UserRoleEnum.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    payout = Payout(
        teacher_id=current_user.id,
        amount=payout_in.amount,
        status="PENDING",
        notes=payout_in.notes,
    )
    db.add(payout)
    await db.commit()
    await db.refresh(payout)

    return PayoutResponse(
        id=payout.id,
        teacher_id=payout.teacher_id,
        teacher_name=current_user.full_name,
        amount=payout.amount,
        currency=payout.currency,
        status=payout.status,
        notes=payout.notes,
        requested_at=payout.requested_at,
    )
