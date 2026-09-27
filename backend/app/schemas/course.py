from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from app.models.course import CourseStatusEnum, CourseLevelEnum


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=2)
    description: Optional[str] = None
    icon: Optional[str] = None


class CategoryResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None

    class Config:
        from_attributes = True


class LessonCreate(BaseModel):
    title: str = Field(..., min_length=2)
    description: Optional[str] = None
    order_index: int = 0
    video_storage_key: Optional[str] = None
    video_url: Optional[str] = None
    video_duration_seconds: int = 0
    is_preview: bool = False
    content_text: Optional[str] = None


class LessonResponse(BaseModel):
    id: UUID
    section_id: UUID
    title: str
    description: Optional[str] = None
    order_index: int
    video_url: Optional[str] = None
    video_duration_seconds: int
    is_preview: bool
    content_text: Optional[str] = None

    class Config:
        from_attributes = True


class SectionCreate(BaseModel):
    title: str = Field(..., min_length=2)
    order_index: int = 0


class SectionResponse(BaseModel):
    id: UUID
    course_id: UUID
    title: str
    order_index: int
    lessons: List[LessonResponse] = []

    class Config:
        from_attributes = True


class CourseCreate(BaseModel):
    title: str = Field(..., min_length=3)
    subtitle: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[UUID] = None
    price: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"))
    discount_price: Optional[Decimal] = None
    level: CourseLevelEnum = CourseLevelEnum.ALL_LEVELS
    thumbnail_url: Optional[str] = None


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[UUID] = None
    price: Optional[Decimal] = None
    discount_price: Optional[Decimal] = None
    level: Optional[CourseLevelEnum] = None
    thumbnail_url: Optional[str] = None


class CourseReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class CourseReviewResponse(BaseModel):
    id: UUID
    learner_name: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime


class CourseResponse(BaseModel):
    id: UUID
    teacher_id: UUID
    teacher_name: Optional[str] = None
    category_id: Optional[UUID] = None
    category_name: Optional[str] = None
    title: str
    slug: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    price: Decimal
    discount_price: Optional[Decimal] = None
    currency: str
    level: CourseLevelEnum
    status: CourseStatusEnum
    rejection_reason: Optional[str] = None
    is_featured: bool
    average_rating: float
    review_count: int
    total_learners: int
    sections: List[SectionResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True
