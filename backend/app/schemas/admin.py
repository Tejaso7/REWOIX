from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class CourseApprovalRequest(BaseModel):
    approved: bool
    rejection_reason: Optional[str] = None


class CommissionSettingUpdate(BaseModel):
    default_platform_commission_percent: float = Field(..., ge=0, le=100)
    default_teacher_share_percent: float = Field(..., ge=0, le=100)


class AdminDashboardMetrics(BaseModel):
    total_learners: int
    total_teachers: int
    total_courses: int
    published_courses: int
    total_sales_count: int
    total_platform_revenue: float
    total_teacher_earnings: float
    pending_course_approvals: int
    pending_payouts_count: int
