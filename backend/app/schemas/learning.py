from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class LessonProgressUpdate(BaseModel):
    progress_seconds: int = Field(..., ge=0)
    completed: bool = False


class LessonProgressResponse(BaseModel):
    lesson_id: UUID
    progress_seconds: int
    percentage: float
    completed: bool
    last_watched_at: datetime


class QuizOptionSubmit(BaseModel):
    question_id: UUID
    selected_option_id: UUID


class QuizSubmitRequest(BaseModel):
    quiz_id: UUID
    answers: List[QuizOptionSubmit]


class QuizResultResponse(BaseModel):
    attempt_id: UUID
    quiz_id: UUID
    score_percent: float
    passed: bool
    passing_score_percent: float
    total_questions: int
    correct_questions: int
    completed_at: datetime


class EnrollmentResponse(BaseModel):
    id: UUID
    course_id: UUID
    course_title: str
    course_thumbnail_url: Optional[str] = None
    teacher_name: str
    progress_percentage: float
    is_completed: bool
    certificate_number: Optional[str] = None
    enrolled_at: datetime

    class Config:
        from_attributes = True
