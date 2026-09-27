from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    role: str = Field(default="LEARNER")  # LEARNER, TEACHER, ADMIN


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TeacherOnboardingRequest(BaseModel):
    headline: Optional[str] = None
    company_name: Optional[str] = None
    domain_expertise: Optional[str] = None
    ctc_bracket: Optional[str] = None
    experience_years: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    website: Optional[str] = None
    technical_skills: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    account_holder_name: Optional[str] = None
    upi_id: Optional[str] = None


class LearnerOnboardingRequest(BaseModel):
    user_type: Optional[str] = "STUDENT"  # STUDENT, FRESHER, WORKING_PROFESSIONAL, JOB_SEEKER
    institution_or_company: Optional[str] = None
    field_of_study_or_role: Optional[str] = None
    primary_learning_goal: Optional[str] = None
    interests: Optional[str] = None
    phone_number: Optional[str] = None


class TeacherProfileResponse(TeacherOnboardingRequest):
    id: UUID
    user_id: UUID
    custom_commission_percent: float = 70.0
    total_earnings: str = "0.00"

    class Config:
        from_attributes = True


class LearnerProfileResponse(LearnerOnboardingRequest):
    id: UUID
    user_id: UUID

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    phone_number: Optional[str] = None
    is_active: bool
    is_verified: bool
    roles: List[str]
    teacher_profile: Optional[TeacherProfileResponse] = None
    learner_profile: Optional[LearnerProfileResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str
