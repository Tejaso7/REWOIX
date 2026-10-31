import asyncio
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User, UserRole, UserRoleEnum, TeacherProfile, LearnerProfile
from app.models.course import (
    Category,
    Course,
    CourseSection,
    Lesson,
    CourseStatusEnum,
    CourseLevelEnum,
)
from app.models.quiz import Quiz, QuizQuestion, QuizOption
from app.models.learning import Enrollment
from app.models.revenue import RevenueTransaction
from app.models.payment import Order, OrderStatusEnum
from app.core.config import settings


async def seed_data():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # 1. Check existing admin
        stmt = select(User).where(User.email == "admin@example.com")
        admin = (await session.execute(stmt)).scalar_one_or_none()

        if not admin:
            print("Seeding demo users...")
            # Admin User
            admin = User(
                email="admin@example.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Platform Admin",
                is_active=True,
                is_verified=True,
            )
            session.add(admin)
            await session.flush()
            session.add(UserRole(user_id=admin.id, role=UserRoleEnum.ADMIN))

            # Teacher User
            teacher = User(
                email="teacher@example.com",
                hashed_password=get_password_hash("teacher123"),
                full_name="Dr. Alex Rivera",
                bio="Senior Full-Stack Architect & AI Educator",
                is_active=True,
                is_verified=True,
            )
            session.add(teacher)
            await session.flush()
            session.add(UserRole(user_id=teacher.id, role=UserRoleEnum.TEACHER))
            session.add(
                TeacherProfile(
                    user_id=teacher.id,
                    headline="Lead Cloud Architect & AI Engineer",
                    experience_years="12+ Years",
                )
            )

            # Student User
            student = User(
                email="student@example.com",
                hashed_password=get_password_hash("student123"),
                full_name="Sarah Chen",
                is_active=True,
                is_verified=True,
            )
            session.add(student)
            await session.flush()
            session.add(UserRole(user_id=student.id, role=UserRoleEnum.LEARNER))
            session.add(LearnerProfile(user_id=student.id, interests="Full-Stack, AI, Cloud"))

            await session.flush()

            # 2. Categories
            print("Seeding categories...")
            cat_dev = Category(name="Web Development", slug="web-development", icon="Code")
            cat_ai = Category(name="Artificial Intelligence", slug="artificial-intelligence", icon="Cpu")
            cat_cloud = Category(name="Cloud & DevOps", slug="cloud-devops", icon="Cloud")
            session.add_all([cat_dev, cat_ai, cat_cloud])
            await session.flush()

            # 3. Courses
            print("Seeding courses...")
            course1 = Course(
                teacher_id=teacher.id,
                category_id=cat_dev.id,
                title="Mastering Modern Next.js 15 & FastAPI Systems",
                slug="mastering-nextjs-fastapi-systems",
                subtitle="Build production-grade full-stack LMS and web software with modular domain architecture.",
                description="Learn full-stack software design with FastAPI 0.110+, Next.js 15, PostgreSQL, Redis, Docker, and Razorpay integrations.",
                thumbnail_url="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
                price=Decimal("4999.00"),
                discount_price=Decimal("2999.00"),
                currency="INR",
                level=CourseLevelEnum.INTERMEDIATE,
                status=CourseStatusEnum.PUBLISHED,
                average_rating=4.9,
                review_count=124,
                total_learners=450,
                is_featured=True,
            )
            session.add(course1)
            await session.flush()

            # 4. Sections & Lessons
            sec1 = CourseSection(course_id=course1.id, title="Section 1: Architecture Foundations", order_index=1)
            session.add(sec1)
            await session.flush()

            les1 = Lesson(
                section_id=sec1.id,
                title="Lesson 1.1: System Architecture Overview",
                description="Overview of Next.js frontend, FastAPI REST layer, and PostgreSQL database.",
                order_index=1,
                video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                video_duration_seconds=596,
                is_preview=True,
                content_text="Detailed notes on domain driven design and decoupled services.",
            )
            les2 = Lesson(
                section_id=sec1.id,
                title="Lesson 1.2: Authentication & RBAC Rules",
                description="JWT tokens, OAuth2 integration, and role permissions.",
                order_index=2,
                video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                video_duration_seconds=653,
                is_preview=False,
                content_text="Understanding claims, token refresh logic, and security headers.",
            )
            session.add_all([les1, les2])
            await session.flush()

            # 5. Quizzes
            quiz1 = Quiz(
                lesson_id=les1.id,
                title="Architecture & RBAC Knowledge Check",
                description="Test your understanding of core platform principles.",
                passing_score_percent=70.0,
            )
            session.add(quiz1)
            await session.flush()

            q1 = QuizQuestion(
                quiz_id=quiz1.id,
                question_text="Why is backend payment signature verification mandatory?",
                order_index=1,
                explanation="Frontend client responses can easily be intercepted and tampered with.",
            )
            session.add(q1)
            await session.flush()

            session.add_all([
                QuizOption(question_id=q1.id, option_text="To prevent frontend tampered requests from granting fake access", is_correct=True),
                QuizOption(question_id=q1.id, option_text="To speed up browser rendering", is_correct=False),
                QuizOption(question_id=q1.id, option_text="Because Next.js does not support API calls", is_correct=False),
            ])

            # 6. Sample Order & Enrollment
            order1 = Order(
                learner_id=student.id,
                course_id=course1.id,
                gateway_order_id="order_demo_123456",
                amount=Decimal("2999.00"),
                currency="INR",
                status=OrderStatusEnum.SUCCESS,
            )
            session.add(order1)
            await session.flush()

            enrollment1 = Enrollment(
                learner_id=student.id,
                course_id=course1.id,
                order_id=order1.id,
                progress_percentage=50.0,
            )
            session.add(enrollment1)

            # Revenue Transaction
            rev1 = RevenueTransaction(
                order_id=order1.id,
                course_id=course1.id,
                teacher_id=teacher.id,
                gross_amount=Decimal("2999.00"),
                platform_commission_percent=30.0,
                platform_commission_amount=Decimal("899.70"),
                teacher_share_percent=70.0,
                teacher_amount=Decimal("2099.30"),
                net_platform_amount=Decimal("899.70"),
                status="SETTLED",
            )
            session.add(rev1)

            await session.commit()
            print("Database successfully seeded with demo data!")
        else:
            print("Database already contains seed data.")

if __name__ == "__main__":
    asyncio.run(seed_data())
