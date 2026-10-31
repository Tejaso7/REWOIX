from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class CertificateResponse(BaseModel):
    id: UUID
    certificate_number: str
    learner_id: UUID
    learner_name: str
    course_id: UUID
    course_title: str
    teacher_name: str
    issue_date: datetime
    pdf_url: Optional[str] = None
    verification_url: str
    certificate_hash: str

    class Config:
        from_attributes = True


class CertificateVerificationResponse(BaseModel):
    is_valid: bool
    certificate_number: str
    learner_name: str
    course_title: str
    teacher_name: str
    issue_date: datetime
    platform_name: str = "REWOIX Corporate Simulator"
