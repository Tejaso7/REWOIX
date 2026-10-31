from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone
import hashlib
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.course import Course, CourseSection, Lesson
from app.models.learning import Enrollment, LessonProgress
from app.models.quiz import Quiz, QuizAttempt, QuizAnswer, QuizQuestion, QuizOption
from app.models.certificate import Certificate
from app.core.storage import get_storage_provider
from app.schemas.learning import (
    EnrollmentResponse,
    LessonProgressUpdate,
    LessonProgressResponse,
    QuizSubmitRequest,
    QuizResultResponse,
)
from app.schemas.certificate import CertificateResponse

router = APIRouter(prefix="/learning", tags=["Learner Operations"])


@router.get("/my-courses", response_model=List[EnrollmentResponse])
async def get_my_enrolled_courses(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Enrollment)
        .options(
            selectinload(Enrollment.course).selectinload(Course.teacher)
        )
        .where(Enrollment.learner_id == current_user.id)
        .order_by(Enrollment.enrolled_at.desc())
    )
    result = await db.execute(stmt)
    enrollments = result.scalars().all()

    # Fetch user certificates
    stmt_certs = select(Certificate).where(Certificate.learner_id == current_user.id)
    certs_res = await db.execute(stmt_certs)
    cert_map = {c.course_id: c.certificate_number for c in certs_res.scalars().all()}

    return [
        EnrollmentResponse(
            id=e.id,
            course_id=e.course_id,
            course_title=e.course.title if e.course else "Unknown Course",
            course_thumbnail_url=e.course.thumbnail_url if e.course else None,
            teacher_name=e.course.teacher.full_name if e.course and e.course.teacher else "Instructor",
            progress_percentage=e.progress_percentage,
            is_completed=e.is_completed,
            certificate_number=cert_map.get(e.course_id),
            enrolled_at=e.enrolled_at,
        )
        for e in enrollments
    ]


@router.get("/courses/{course_id}/player")
async def get_course_learning_player(
    course_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify enrollment
    stmt_enr = select(Enrollment).where(
        Enrollment.course_id == course_id, Enrollment.learner_id == current_user.id
    )
    enrollment = (await db.execute(stmt_enr)).scalar_one_or_none()
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not enrolled in this course",
        )

    # Fetch full course curriculum
    stmt_course = (
        select(Course)
        .options(
            selectinload(Course.sections)
            .selectinload(CourseSection.lessons)
            .selectinload(Lesson.quizzes)
        )
        .where(Course.id == course_id)
    )
    course = (await db.execute(stmt_course)).scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Fetch lesson progress records
    stmt_prog = select(LessonProgress).where(LessonProgress.learner_id == current_user.id)
    prog_result = await db.execute(stmt_prog)
    progress_map = {p.lesson_id: p for p in prog_result.scalars().all()}

    storage = get_storage_provider()

    sections_payload = []
    for section in course.sections:
        lessons_payload = []
        for lesson in section.lessons:
            p = progress_map.get(lesson.id)
            
            # Generate signed media stream URL for enrolled learners
            stream_url = lesson.video_url
            if lesson.video_storage_key:
                stream_url = await storage.generate_access_url(lesson.video_storage_key)

            lessons_payload.append(
                {
                    "id": lesson.id,
                    "title": lesson.title,
                    "description": lesson.description,
                    "order_index": lesson.order_index,
                    "video_url": stream_url,
                    "video_duration_seconds": lesson.video_duration_seconds,
                    "is_preview": lesson.is_preview,
                    "content_text": lesson.content_text,
                    "progress_seconds": p.progress_seconds if p else 0,
                    "completed": p.completed if p else False,
                    "quizzes": [
                        {
                            "id": q.id,
                            "title": q.title,
                            "passing_score_percent": q.passing_score_percent,
                        }
                        for q in lesson.quizzes
                    ],
                }
            )

        sections_payload.append(
            {
                "id": section.id,
                "title": section.title,
                "order_index": section.order_index,
                "lessons": lessons_payload,
            }
        )

    return {
        "course_id": course.id,
        "course_title": course.title,
        "enrollment_id": enrollment.id,
        "progress_percentage": enrollment.progress_percentage,
        "is_completed": enrollment.is_completed,
        "sections": sections_payload,
    }


@router.post("/lessons/{lesson_id}/progress", response_model=LessonProgressResponse)
async def update_lesson_progress(
    lesson_id: UUID,
    progress_in: LessonProgressUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    lesson = await db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    section = await db.get(CourseSection, lesson.section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")

    course_id = section.course_id

    # Verify enrollment
    stmt_enr = select(Enrollment).where(
        Enrollment.course_id == course_id, Enrollment.learner_id == current_user.id
    )
    enrollment = (await db.execute(stmt_enr)).scalar_one_or_none()
    if not enrollment:
        raise HTTPException(status_code=403, detail="Not enrolled in this course")

    # Fetch existing lesson progress or create new
    stmt_p = select(LessonProgress).where(
        LessonProgress.lesson_id == lesson_id, LessonProgress.learner_id == current_user.id
    )
    progress = (await db.execute(stmt_p)).scalar_one_or_none()

    percentage = 0.0
    if lesson.video_duration_seconds > 0:
        percentage = min(100.0, round((progress_in.progress_seconds / lesson.video_duration_seconds) * 100, 2))
    elif progress_in.completed:
        percentage = 100.0

    completed = progress_in.completed or percentage >= 90.0

    if not progress:
        progress = LessonProgress(
            learner_id=current_user.id,
            lesson_id=lesson_id,
            progress_seconds=progress_in.progress_seconds,
            percentage=percentage,
            completed=completed,
            last_watched_at=datetime.now(timezone.utc),
        )
        db.add(progress)
    else:
        progress.progress_seconds = max(progress.progress_seconds, progress_in.progress_seconds)
        progress.percentage = max(progress.percentage, percentage)
        if completed:
            progress.completed = True
        progress.last_watched_at = datetime.now(timezone.utc)

    # Recalculate overall course progress
    stmt_all_lessons = (
        select(func.count(Lesson.id))
        .join(CourseSection, Lesson.section_id == CourseSection.id)
        .where(CourseSection.course_id == course_id)
    )
    total_lessons = (await db.execute(stmt_all_lessons)).scalar() or 1

    stmt_completed = (
        select(func.count(LessonProgress.id))
        .join(Lesson, LessonProgress.lesson_id == Lesson.id)
        .join(CourseSection, Lesson.section_id == CourseSection.id)
        .where(
            CourseSection.course_id == course_id,
            LessonProgress.learner_id == current_user.id,
            LessonProgress.completed == True,
        )
    )
    completed_count = (await db.execute(stmt_completed)).scalar() or 0

    overall_progress = round((completed_count / total_lessons) * 100, 2)
    enrollment.progress_percentage = min(100.0, overall_progress)

    if enrollment.progress_percentage >= 100.0 and not enrollment.is_completed:
        enrollment.is_completed = True
        enrollment.completed_at = datetime.now(timezone.utc)
        # Issue Certificate if not already existing
        stmt_cert = select(Certificate).where(
            Certificate.course_id == course_id, Certificate.learner_id == current_user.id
        )
        existing_cert = (await db.execute(stmt_cert)).scalar_one_or_none()
        if not existing_cert:
            import uuid
            cert_no = f"RWX-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
            hash_val = hashlib.sha256(f"{current_user.id}:{course_id}:{cert_no}".encode()).hexdigest()
            cert = Certificate(
                certificate_number=cert_no,
                learner_id=current_user.id,
                course_id=course_id,
                verification_url=f"/certificates/verify/{cert_no}",
                certificate_hash=hash_val,
            )
            db.add(cert)

    await db.commit()
    await db.refresh(progress)

    return LessonProgressResponse(
        lesson_id=progress.lesson_id,
        progress_seconds=progress.progress_seconds,
        percentage=progress.percentage,
        completed=progress.completed,
        last_watched_at=progress.last_watched_at,
    )


@router.post("/quizzes/submit", response_model=QuizResultResponse)
async def submit_quiz(
    submit_in: QuizSubmitRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    stmt_quiz = (
        select(Quiz)
        .options(
            selectinload(Quiz.questions).selectinload(QuizQuestion.options)
        )
        .where(Quiz.id == submit_in.quiz_id)
    )
    quiz = (await db.execute(stmt_quiz)).scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    correct_count = 0
    total_questions = len(quiz.questions)

    # Evaluate correct answers
    options_map = {}
    for q in quiz.questions:
        for opt in q.options:
            options_map[opt.id] = (opt.is_correct, q.id)

    submitted_map = {ans.question_id: ans.selected_option_id for ans in submit_in.answers}

    for q in quiz.questions:
        selected_opt_id = submitted_map.get(q.id)
        if selected_opt_id and options_map.get(selected_opt_id, (False, None))[0]:
            correct_count += 1

    score_percent = round((correct_count / total_questions) * 100, 2) if total_questions > 0 else 0.0
    passed = score_percent >= quiz.passing_score_percent

    attempt = QuizAttempt(
        quiz_id=quiz.id,
        learner_id=current_user.id,
        score_percent=score_percent,
        passed=passed,
        completed_at=datetime.now(timezone.utc),
    )
    db.add(attempt)
    await db.flush()

    for q_id, opt_id in submitted_map.items():
        db.add(
            QuizAnswer(
                attempt_id=attempt.id,
                question_id=q_id,
                selected_option_id=opt_id,
            )
        )

    await db.commit()
    await db.refresh(attempt)

    return QuizResultResponse(
        attempt_id=attempt.id,
        quiz_id=quiz.id,
        score_percent=score_percent,
        passed=passed,
        passing_score_percent=quiz.passing_score_percent,
        total_questions=total_questions,
        correct_questions=correct_count,
        completed_at=attempt.completed_at,
    )
