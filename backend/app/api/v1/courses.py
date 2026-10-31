from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import get_current_active_user, require_roles
from app.models.user import User, UserRoleEnum
from app.models.course import (
    Course,
    Category,
    CourseSection,
    Lesson,
    CourseReview,
    CourseStatusEnum,
    CourseLevelEnum,
)
from app.models.learning import Enrollment
from app.schemas.course import (
    CourseCreate,
    CourseUpdate,
    CourseResponse,
    CategoryResponse,
    CategoryCreate,
    SectionCreate,
    SectionResponse,
    LessonCreate,
    LessonResponse,
    CourseReviewCreate,
    CourseReviewResponse,
)

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db)):
    stmt = select(Category).order_by(Category.name)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post(
    "/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles([UserRoleEnum.ADMIN]))],
)
async def create_category(cat_in: CategoryCreate, db: AsyncSession = Depends(get_db)):
    slug = cat_in.name.lower().replace(" ", "-")
    category = Category(
        name=cat_in.name,
        slug=slug,
        description=cat_in.description,
        icon=cat_in.icon,
    )
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


@router.get("", response_model=List[CourseResponse])
async def search_courses(
    q: Optional[str] = None,
    category_id: Optional[UUID] = None,
    level: Optional[CourseLevelEnum] = None,
    sort_by: Optional[str] = Query("popular", pattern="^(popular|rating|newest|price_asc|price_desc)$"),
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Course)
        .options(
            selectinload(Course.teacher),
            selectinload(Course.category),
            selectinload(Course.sections).selectinload(CourseSection.lessons),
        )
        .where(Course.status == CourseStatusEnum.PUBLISHED)
    )

    if q:
        stmt = stmt.where(
            or_(
                Course.title.ilike(f"%{q}%"),
                Course.description.ilike(f"%{q}%"),
            )
        )
    if category_id:
        stmt = stmt.where(Course.category_id == category_id)
    if level:
        stmt = stmt.where(Course.level == level)

    if sort_by == "rating":
        stmt = stmt.order_by(Course.average_rating.desc())
    elif sort_by == "newest":
        stmt = stmt.order_by(Course.created_at.desc())
    elif sort_by == "price_asc":
        stmt = stmt.order_by(Course.price.asc())
    elif sort_by == "price_desc":
        stmt = stmt.order_by(Course.price.desc())
    else:  # popular
        stmt = stmt.order_by(Course.total_learners.desc())

    stmt = stmt.offset(skip).limit(limit)
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
            sections=[
                SectionResponse(
                    id=s.id,
                    course_id=s.course_id,
                    title=s.title,
                    order_index=s.order_index,
                    lessons=[
                        LessonResponse(
                            id=l.id,
                            section_id=l.section_id,
                            title=l.title,
                            description=l.description,
                            order_index=l.order_index,
                            video_url=l.video_url if l.is_preview else None,  # Hide non-preview videos unless enrolled
                            video_duration_seconds=l.video_duration_seconds,
                            is_preview=l.is_preview,
                            content_text=l.content_text,
                        )
                        for l in s.lessons
                    ],
                )
                for s in c.sections
            ],
            created_at=c.created_at,
        )
        for c in courses
    ]


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course_details(course_id: UUID, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Course)
        .options(
            selectinload(Course.teacher),
            selectinload(Course.category),
            selectinload(Course.sections).selectinload(CourseSection.lessons),
        )
        .where(Course.id == course_id)
    )
    result = await db.execute(stmt)
    c = result.scalar_one_or_none()

    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    return CourseResponse(
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
        sections=[
            SectionResponse(
                id=s.id,
                course_id=s.course_id,
                title=s.title,
                order_index=s.order_index,
                lessons=[
                    LessonResponse(
                        id=l.id,
                        section_id=l.section_id,
                        title=l.title,
                        description=l.description,
                        order_index=l.order_index,
                        video_url=l.video_url if l.is_preview else None,
                        video_duration_seconds=l.video_duration_seconds,
                        is_preview=l.is_preview,
                        content_text=l.content_text,
                    )
                    for l in s.lessons
                ],
            )
            for s in c.sections
        ],
        created_at=c.created_at,
    )


@router.post("", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course_in: CourseCreate,
    current_user: User = Depends(require_roles([UserRoleEnum.TEACHER, UserRoleEnum.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    import uuid
    slug = f"{course_in.title.lower().replace(' ', '-')}-{uuid.uuid4().hex[:6]}"
    course = Course(
        teacher_id=current_user.id,
        category_id=course_in.category_id,
        title=course_in.title,
        slug=slug,
        subtitle=course_in.subtitle,
        description=course_in.description,
        price=course_in.price,
        discount_price=course_in.discount_price,
        level=course_in.level,
        thumbnail_url=course_in.thumbnail_url,
        status=CourseStatusEnum.DRAFT,
    )
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return await get_course_details(course.id, db)


@router.post("/{course_id}/sections", response_model=SectionResponse)
async def add_section(
    course_id: UUID,
    section_in: SectionCreate,
    current_user: User = Depends(require_roles([UserRoleEnum.TEACHER, UserRoleEnum.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    course = await db.get(Course, course_id)
    if not course or (course.teacher_id != current_user.id and UserRoleEnum.ADMIN not in [r.role for r in current_user.roles]):
        raise HTTPException(status_code=403, detail="Not authorized to edit this course")

    section = CourseSection(
        course_id=course_id,
        title=section_in.title,
        order_index=section_in.order_index,
    )
    db.add(section)
    await db.commit()
    await db.refresh(section)
    return SectionResponse(
        id=section.id,
        course_id=section.course_id,
        title=section.title,
        order_index=section.order_index,
        lessons=[],
    )


@router.post("/sections/{section_id}/lessons", response_model=LessonResponse)
async def add_lesson(
    section_id: UUID,
    lesson_in: LessonCreate,
    current_user: User = Depends(require_roles([UserRoleEnum.TEACHER, UserRoleEnum.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    section = await db.get(CourseSection, section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")

    lesson = Lesson(
        section_id=section_id,
        title=lesson_in.title,
        description=lesson_in.description,
        order_index=lesson_in.order_index,
        video_storage_key=lesson_in.video_storage_key,
        video_url=lesson_in.video_url,
        video_duration_seconds=lesson_in.video_duration_seconds,
        is_preview=lesson_in.is_preview,
        content_text=lesson_in.content_text,
    )
    db.add(lesson)
    await db.commit()
    await db.refresh(lesson)
    return LessonResponse(
        id=lesson.id,
        section_id=lesson.section_id,
        title=lesson.title,
        description=lesson.description,
        order_index=lesson.order_index,
        video_url=lesson.video_url,
        video_duration_seconds=lesson.video_duration_seconds,
        is_preview=lesson.is_preview,
        content_text=lesson.content_text,
    )


@router.post("/{course_id}/submit", response_model=CourseResponse)
async def submit_course_for_approval(
    course_id: UUID,
    current_user: User = Depends(require_roles([UserRoleEnum.TEACHER, UserRoleEnum.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    course = await db.get(Course, course_id)
    if not course or course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    course.status = CourseStatusEnum.SUBMITTED
    await db.commit()
    return await get_course_details(course.id, db)


@router.post("/{course_id}/reviews", response_model=CourseReviewResponse)
async def add_course_review(
    course_id: UUID,
    review_in: CourseReviewCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify enrollment
    stmt = select(Enrollment).where(
        Enrollment.course_id == course_id, Enrollment.learner_id == current_user.id
    )
    enrollment = (await db.execute(stmt)).scalar_one_or_none()
    if not enrollment:
        raise HTTPException(status_code=403, detail="Must be enrolled in the course to write a review")

    review = CourseReview(
        course_id=course_id,
        learner_id=current_user.id,
        rating=review_in.rating,
        comment=review_in.comment,
    )
    db.add(review)

    # Recalculate course average rating
    stmt_avg = select(
        func.avg(CourseReview.rating), func.count(CourseReview.id)
    ).where(CourseReview.course_id == course_id)
    res = (await db.execute(stmt_avg)).fetchone()
    if res and res[0] is not None:
        course = await db.get(Course, course_id)
        if course:
            course.average_rating = round(float(res[0]), 2)
            course.review_count = int(res[1])

    await db.commit()
    await db.refresh(review)

    return CourseReviewResponse(
        id=review.id,
        learner_name=current_user.full_name,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
    )
