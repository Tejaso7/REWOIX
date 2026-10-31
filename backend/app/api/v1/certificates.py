from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.certificate import Certificate
from app.models.course import Course
from app.schemas.certificate import CertificateResponse, CertificateVerificationResponse

router = APIRouter(prefix="/certificates", tags=["Certificates"])


@router.get("/verify/{certificate_number}", response_model=CertificateVerificationResponse)
async def verify_certificate(
    certificate_number: str, db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Certificate)
        .options(
            selectinload(Certificate.learner),
            selectinload(Certificate.course).selectinload(Course.teacher),
        )
        .where(Certificate.certificate_number == certificate_number)
    )
    result = await db.execute(stmt)
    cert = result.scalar_one_or_none()

    if not cert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid certificate or certificate not found",
        )

    return CertificateVerificationResponse(
        is_valid=True,
        certificate_number=cert.certificate_number,
        learner_name=cert.learner.full_name if cert.learner else "Learner",
        course_title=cert.course.title if cert.course else "Course",
        teacher_name=cert.course.teacher.full_name if cert.course and cert.course.teacher else "Instructor",
        issue_date=cert.issue_date,
        platform_name="REWOIX Corporate Simulator",
    )
