import asyncio
import uuid
from decimal import Decimal
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.user import User, UserRole, UserRoleEnum, TeacherProfile
from app.models.course import Category, Course, CourseSection, Lesson, CourseStatusEnum, CourseLevelEnum
from app.models.quiz import Quiz, QuizQuestion, QuizOption
from app.core.security import get_password_hash


COURSES_DATA = [
    {
        "title": "Full-Stack Next.js 15 & FastAPI Systems",
        "slug": "full-stack-nextjs-15-fastapi-systems",
        "subtitle": "Build high-performance web platforms with Next.js 15 App Router, Async FastAPI 0.110, and PostgreSQL.",
        "description": "Master enterprise web development by combining Next.js 15 server components, Tailwind CSS glassmorphism, FastAPI async endpoints, SQLAlchemy 2.0, and JWT OAuth2 authentication.",
        "category_name": "Web Development",
        "price": Decimal("2999.00"),
        "discount_price": Decimal("1999.00"),
        "level": CourseLevelEnum.ADVANCED,
        "is_featured": True,
        "average_rating": 4.9,
        "review_count": 142,
        "total_learners": 1280,
        "thumbnail_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
        "sections": [
            {
                "title": "Architecture & Environment Setup",
                "lessons": [
                    {"title": "System Architecture Overview", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", "duration": 480, "is_preview": True},
                    {"title": "FastAPI Async Setup with SQLAlchemy 2.0", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", "duration": 720, "is_preview": True},
                    {"title": "Next.js 15 App Router & Dual Theme Tailwind", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", "duration": 600, "is_preview": False},
                ]
            },
            {
                "title": "Database Schema & Security",
                "lessons": [
                    {"title": "Multi-Role RBAC with JWT Auth", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4", "duration": 900, "is_preview": False},
                    {"title": "Handling Async Database Transactions", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", "duration": 840, "is_preview": False},
                ]
            }
        ]
    },
    {
        "title": "Generative AI & LLM Architecture Masterclass",
        "slug": "generative-ai-llm-architecture-masterclass",
        "subtitle": "Build production RAG pipelines, fine-tune open-weight models, and deploy AI microservices.",
        "description": "Deep dive into Transformer architectures, attention mechanisms, vector databases (Qdrant, Pinecone), LangChain, LlamaIndex, and deploying vLLM models to Kubernetes.",
        "category_name": "Artificial Intelligence",
        "price": Decimal("3499.00"),
        "discount_price": Decimal("2499.00"),
        "level": CourseLevelEnum.INTERMEDIATE,
        "is_featured": True,
        "average_rating": 4.9,
        "review_count": 98,
        "total_learners": 940,
        "thumbnail_url": "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&q=80",
        "sections": [
            {
                "title": "Fundamentals of LLMs & Attention",
                "lessons": [
                    {"title": "Inside the Transformer Architecture", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", "duration": 640, "is_preview": True},
                    {"title": "Tokenization & Embeddings Engineering", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnTheLoose.mp4", "duration": 580, "is_preview": True},
                ]
            },
            {
                "title": "Retrieval Augmented Generation (RAG)",
                "lessons": [
                    {"title": "Building Production RAG Pipelines", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", "duration": 950, "is_preview": False},
                    {"title": "Hybrid Search & Re-ranking Strategies", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4", "duration": 780, "is_preview": False},
                ]
            }
        ]
    },
    {
        "title": "Cloud Native Kubernetes & GitOps Engineering",
        "slug": "cloud-native-kubernetes-gitops-engineering",
        "subtitle": "Deploy production Kubernetes clusters, ArgoCD pipelines, Istio service mesh, and Prometheus observability.",
        "description": "Master Cloud Native DevOps: Helm charts, ArgoCD GitOps pipelines, Terraform IaC, ingress controllers, mTLS service mesh, and automated blue-green deployments.",
        "category_name": "Cloud & DevOps",
        "price": Decimal("2499.00"),
        "discount_price": Decimal("1799.00"),
        "level": CourseLevelEnum.ADVANCED,
        "is_featured": True,
        "average_rating": 4.8,
        "review_count": 84,
        "total_learners": 720,
        "thumbnail_url": "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80",
        "sections": [
            {
                "title": "Kubernetes Primitives & Deployment",
                "lessons": [
                    {"title": "Pods, Deployments, & StatefulSets", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4", "duration": 520, "is_preview": True},
                    {"title": "ConfigMaps, Secrets, & Storage", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", "duration": 600, "is_preview": False},
                ]
            }
        ]
    },
    {
        "title": "Python & Rust Microservices Production Bootcamp",
        "slug": "python-rust-microservices-production-bootcamp",
        "subtitle": "Combine Python's agility with Rust's blazingly fast memory-safe execution for high-throughput systems.",
        "description": "Build modern polyglot microservices using PyO3 bindings, gRPC streaming, Apache Kafka event queues, and Docker containerization.",
        "category_name": "Web Development",
        "price": Decimal("2199.00"),
        "discount_price": Decimal("1499.00"),
        "level": CourseLevelEnum.INTERMEDIATE,
        "is_featured": False,
        "average_rating": 4.7,
        "review_count": 65,
        "total_learners": 510,
        "thumbnail_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
        "sections": [
            {
                "title": "High-Performance System Foundations",
                "lessons": [
                    {"title": "Intro to Rust Memory Management", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", "duration": 700, "is_preview": True},
                    {"title": "gRPC Inter-service Communication", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", "duration": 810, "is_preview": False},
                ]
            }
        ]
    },
    {
        "title": "System Design & Distributed Systems at Scale",
        "slug": "system-design-distributed-systems-at-scale",
        "subtitle": "Architect systems for millions of concurrent requests, zero downtime, and high availability.",
        "description": "Comprehensive engineering guide covering load balancing, consistent hashing, caching strategies (Redis), sharding, CAP theorem, and real-time distributed consensus.",
        "category_name": "Web Development",
        "price": Decimal("3999.00"),
        "discount_price": Decimal("2999.00"),
        "level": CourseLevelEnum.ADVANCED,
        "is_featured": True,
        "average_rating": 4.95,
        "review_count": 210,
        "total_learners": 1850,
        "thumbnail_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
        "sections": [
            {
                "title": "Scalability & Load Balancing",
                "lessons": [
                    {"title": "Horizontal vs Vertical Scaling", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4", "duration": 500, "is_preview": True},
                    {"title": "Consistent Hashing & Rate Limiting", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", "duration": 890, "is_preview": False},
                ]
            }
        ]
    },
    {
        "title": "Deep Learning with PyTorch & Computer Vision",
        "slug": "deep-learning-pytorch-computer-vision",
        "subtitle": "Train CNNs, Vision Transformers (ViT), YOLO object detectors, and diffusion models.",
        "description": "Hands-on PyTorch course covering tensor math, custom neural networks, transfer learning, image segmentation, object tracking, and model quantization for edge deployment.",
        "category_name": "Artificial Intelligence",
        "price": Decimal("2799.00"),
        "discount_price": Decimal("1899.00"),
        "level": CourseLevelEnum.INTERMEDIATE,
        "is_featured": False,
        "average_rating": 4.85,
        "review_count": 76,
        "total_learners": 630,
        "thumbnail_url": "https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=800&q=80",
        "sections": [
            {
                "title": "PyTorch Core Concepts",
                "lessons": [
                    {"title": "Tensors & Automatic Differentiation", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", "duration": 540, "is_preview": True},
                    {"title": "Building Convolutional Neural Networks", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnTheLoose.mp4", "duration": 760, "is_preview": False},
                ]
            }
        ]
    },
    {
        "title": "AWS Certified Solutions Architect Masterclass",
        "slug": "aws-certified-solutions-architect-masterclass",
        "subtitle": "Pass the SAA-C03 exam with real hands-on VPC, EC2, S3, Aurora, and IAM labs.",
        "description": "Complete preparation for AWS Solutions Architect Certification: cloud infrastructure design, multi-AZ high availability, IAM security policies, and cost optimization.",
        "category_name": "Cloud & DevOps",
        "price": Decimal("1999.00"),
        "discount_price": Decimal("1299.00"),
        "level": CourseLevelEnum.BEGINNER,
        "is_featured": False,
        "average_rating": 4.75,
        "review_count": 115,
        "total_learners": 1400,
        "thumbnail_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
        "sections": [
            {
                "title": "AWS Networking & Compute",
                "lessons": [
                    {"title": "VPC Subnets & Route Tables", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", "duration": 600, "is_preview": True},
                    {"title": "EC2 Auto Scaling Groups", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4", "duration": 680, "is_preview": False},
                ]
            }
        ]
    },
    {
        "title": "Cybersecurity & Ethical Hacking Essentials",
        "slug": "cybersecurity-ethical-hacking-essentials",
        "subtitle": "Master vulnerability assessment, penetration testing, Wireshark, and web security.",
        "description": "Learn defensive and offensive cybersecurity techniques: OWASP Top 10 vulnerabilities, SQL injection, XSS defense, network packet analysis, and secure code auditing.",
        "category_name": "Cyber Security",
        "price": Decimal("2299.00"),
        "discount_price": Decimal("1599.00"),
        "level": CourseLevelEnum.ALL_LEVELS,
        "is_featured": False,
        "average_rating": 4.8,
        "review_count": 89,
        "total_learners": 810,
        "thumbnail_url": "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
        "sections": [
            {
                "title": "Network Security & Analysis",
                "lessons": [
                    {"title": "Packet Capture with Wireshark", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4", "duration": 580, "is_preview": True},
                    {"title": "OWASP Top 10 Deep Dive", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", "duration": 720, "is_preview": False},
                ]
            }
        ]
    },
    {
        "title": "Data Structures & Algorithms in Java & C++",
        "slug": "data-structures-algorithms-java-cpp",
        "subtitle": "Crack coding interviews at FAANG & top tech companies with step-by-step problem solving.",
        "description": "Master Arrays, Trees, Graphs, Dynamic Programming, Heap queues, Disjoint sets, and Big-O time-space complexity through 150+ hands-on LeetCode problems.",
        "category_name": "Computer Science",
        "price": Decimal("1799.00"),
        "discount_price": Decimal("999.00"),
        "level": CourseLevelEnum.BEGINNER,
        "is_featured": False,
        "average_rating": 4.9,
        "review_count": 310,
        "total_learners": 2400,
        "thumbnail_url": "https://images.unsplash.com/photo-1516116211223-4c714cf99f88?w=800&q=80",
        "sections": [
            {
                "title": "Arrays & Dynamic Programming",
                "lessons": [
                    {"title": "Two-Pointer Technique & Sliding Window", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", "duration": 610, "is_preview": True},
                    {"title": "Dynamic Programming Memoization", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", "duration": 850, "is_preview": False},
                ]
            }
        ]
    },
    {
        "title": "PostgreSQL & Database Performance Tuning",
        "slug": "postgresql-database-performance-tuning",
        "subtitle": "Write efficient SQL queries, manage B-tree/GIN indexes, and tune query plans.",
        "description": "Deep dive into Postgres internals: EXPLAIN ANALYZE logs, connection pooling (PgBouncer), partitioning, WAL replication, and transaction isolation levels.",
        "category_name": "Data Engineering",
        "price": Decimal("2099.00"),
        "discount_price": Decimal("1399.00"),
        "level": CourseLevelEnum.INTERMEDIATE,
        "is_featured": False,
        "average_rating": 4.85,
        "review_count": 62,
        "total_learners": 490,
        "thumbnail_url": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80",
        "sections": [
            {
                "title": "Query Planning & Indexing",
                "lessons": [
                    {"title": "Understanding EXPLAIN ANALYZE", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4", "duration": 650, "is_preview": True},
                    {"title": "B-Tree vs BRIN vs GIN Indexes", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", "duration": 780, "is_preview": False},
                ]
            }
        ]
    },
    {
        "title": "Mobile App Development with React Native & Expo",
        "slug": "mobile-app-development-react-native-expo",
        "subtitle": "Build cross-platform iOS and Android apps with native device capabilities.",
        "description": "Learn React Native with Expo Router, async storage, camera access, push notifications, offline syncing, and App Store / Google Play store publishing.",
        "category_name": "Mobile Development",
        "price": Decimal("2499.00"),
        "discount_price": Decimal("1699.00"),
        "level": CourseLevelEnum.BEGINNER,
        "is_featured": False,
        "average_rating": 4.75,
        "review_count": 94,
        "total_learners": 880,
        "thumbnail_url": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
        "sections": [
            {
                "title": "React Native Fundamentals",
                "lessons": [
                    {"title": "Expo Router & File-based Navigation", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", "duration": 520, "is_preview": True},
                    {"title": "Custom Native UI Components", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnTheLoose.mp4", "duration": 670, "is_preview": False},
                ]
            }
        ]
    },
    {
        "title": "AI Agents & LangChain / AutoGen Frameworks",
        "slug": "ai-agents-langchain-autogen-frameworks",
        "subtitle": "Build autonomous AI agents with web search tools, code execution, and multi-agent loops.",
        "description": "Learn to architect multi-agent systems using LangChain, CrewAI, and AutoGen. Implement tool calling, memory stores, self-reflection loops, and human-in-the-loop validation.",
        "category_name": "Artificial Intelligence",
        "price": Decimal("3199.00"),
        "discount_price": Decimal("2199.00"),
        "level": CourseLevelEnum.ADVANCED,
        "is_featured": True,
        "average_rating": 4.95,
        "review_count": 130,
        "total_learners": 1100,
        "thumbnail_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
        "sections": [
            {
                "title": "Agentic Loop Architectures",
                "lessons": [
                    {"title": "ReAct Pattern & Tool Binding", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", "duration": 710, "is_preview": True},
                    {"title": "Multi-Agent Orchestration with CrewAI", "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4", "duration": 920, "is_preview": False},
                ]
            }
        ]
    }
]


async def seed_courses():
    async with AsyncSessionLocal() as db:
        # 1. Fetch or ensure Teacher user exists
        stmt_t = select(User).where(User.email == "teacher@example.com")
        res_t = await db.execute(stmt_t)
        teacher = res_t.unique().scalar_one_or_none()

        if not teacher:
            teacher = User(
                email="teacher@example.com",
                hashed_password=get_password_hash("teacher123"),
                full_name="Dr. Alex Rivera",
                is_active=True,
                is_verified=True,
            )
            db.add(teacher)
            await db.flush()

            db.add(UserRole(user_id=teacher.id, role=UserRoleEnum.TEACHER))
            db.add(TeacherProfile(user_id=teacher.id, headline="Lead Cloud Architect & AI Engineer"))
            await db.commit()
            await db.refresh(teacher)

        # 2. Iterate and create categories & courses
        cat_cache = {}

        for c_data in COURSES_DATA:
            cat_name = c_data["category_name"]
            if cat_name not in cat_cache:
                stmt_cat = select(Category).where(Category.name == cat_name)
                cat_res = await db.execute(stmt_cat)
                category = cat_res.scalar_one_or_none()
                if not category:
                    slug = cat_name.lower().replace(" & ", "-").replace(" ", "-")
                    category = Category(
                        name=cat_name,
                        slug=slug,
                        description=f"Top courses in {cat_name}",
                    )
                    db.add(category)
                    await db.flush()
                cat_cache[cat_name] = category

            category = cat_cache[cat_name]

            # Check existing course
            stmt_exist = select(Course).where(Course.slug == c_data["slug"])
            exist_course = (await db.execute(stmt_exist)).scalar_one_or_none()
            if exist_course:
                print(f"Skipping existing course: {c_data['title']}")
                continue

            course = Course(
                teacher_id=teacher.id,
                category_id=category.id,
                title=c_data["title"],
                slug=c_data["slug"],
                subtitle=c_data["subtitle"],
                description=c_data["description"],
                thumbnail_url=c_data["thumbnail_url"],
                price=c_data["price"],
                discount_price=c_data["discount_price"],
                level=c_data["level"],
                status=CourseStatusEnum.PUBLISHED,
                is_featured=c_data["is_featured"],
                average_rating=c_data["average_rating"],
                review_count=c_data["review_count"],
                total_learners=c_data["total_learners"],
            )
            db.add(course)
            await db.flush()

            # Add sections and lessons
            for s_idx, s_data in enumerate(c_data["sections"]):
                section = CourseSection(
                    course_id=course.id,
                    title=s_data["title"],
                    order_index=s_idx + 1,
                )
                db.add(section)
                await db.flush()

                for l_idx, l_data in enumerate(s_data["lessons"]):
                    lesson = Lesson(
                        section_id=section.id,
                        title=l_data["title"],
                        description=f"In-depth guide covering {l_data['title']}",
                        order_index=l_idx + 1,
                        video_url=l_data["video_url"],
                        video_duration_seconds=l_data["duration"],
                        is_preview=l_data["is_preview"],
                        content_text=f"Hands-on exercise and study notes for {l_data['title']}.",
                    )
                    db.add(lesson)

            print(f"Seeded Course: {course.title}")

        await db.commit()
        print("Successfully seeded 12 courses!")


if __name__ == "__main__":
    asyncio.run(seed_courses())
