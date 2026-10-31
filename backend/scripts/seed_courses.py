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
    },
    {
        "title": "Uber Dynamic Surge Pricing & Geospatial Matching Simulator",
        "slug": "uber-dynamic-surge-pricing-simulator",
        "subtitle": "Engineer Uber's real-time geospatial demand-supply algorithmic surge pricing and driver dispatch engine using H3 hex bins and Redis.",
        "description": "Step into the role of a Senior Distributed Systems Engineer at Uber. You will build and optimize the core real-time mobility dispatch system: partitioning urban geography using Uber's H3 spatial indexing, computing live supply-demand elasticity ratios across hexagonal bins, dispatching nearest available drivers with O(1) Redis geospatial queries, and preventing surge price oscillations with moving averages and rate limits.",
        "category_name": "Corporate Experience Simulators",
        "price": Decimal("3999.00"),
        "discount_price": Decimal("2499.00"),
        "level": CourseLevelEnum.ADVANCED,
        "is_featured": True,
        "average_rating": 4.97,
        "review_count": 320,
        "total_learners": 1850,
        "thumbnail_url": "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
        "sections": [
            {
                "title": "Geospatial Indexing & H3 Urban Grid",
                "lessons": [
                    {
                        "title": "Uber H3 Spatial Hexagonal Binning",
                        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                        "duration": 650,
                        "is_preview": True,
                    },
                    {
                        "title": "Ingesting Real-Time Driver GPS Telemetry",
                        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                        "duration": 780,
                        "is_preview": True,
                    },
                ],
            },
            {
                "title": "Surge Multiplier Algorithmic Engine",
                "lessons": [
                    {
                        "title": "Calculating Dynamic Elasticity & Surge Multipliers",
                        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
                        "duration": 890,
                        "is_preview": False,
                    },
                    {
                        "title": "High-Throughput Driver Dispatch with Redis Geo",
                        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4",
                        "duration": 940,
                        "is_preview": False,
                        "quiz": {
                            "title": "Uber Surge & Geospatial Architecture Check",
                            "passing_score_percent": 75.0,
                            "questions": [
                                {
                                    "question_text": "Why does Uber use hexagonal (H3) cells instead of square grids for spatial partitioning?",
                                    "explanation": "Hexagons have the property that all 6 adjacent neighbors are equidistant from the center cell, preventing corner diagonal distortion found in square grids.",
                                    "options": [
                                        {"option_text": "Hexagons have equidistant neighbors with continuous adjacent boundaries, eliminating corner bias artifacts", "is_correct": True},
                                        {"option_text": "Hexagonal geometry compresses coordinates into fewer raw bytes than rectangles", "is_correct": False},
                                        {"option_text": "Square grids cannot support GPS coordinate transformations", "is_correct": False},
                                        {"option_text": "Hexagons require 50% fewer CPU cycles to calculate trigonometric sine", "is_correct": False},
                                    ],
                                },
                                {
                                    "question_text": "What is the primary function of an exponential moving average (EMA) in Uber surge pricing calculations?",
                                    "explanation": "EMA dampens short-lived variance, avoiding jarring price fluctuations for riders between consecutive minutes.",
                                    "options": [
                                        {"option_text": "To smooth abrupt pricing oscillations caused by instantaneous spikes in ride requests", "is_correct": True},
                                        {"option_text": "To decrease driver payout commissions during non-peak hours", "is_correct": False},
                                        {"option_text": "To compress geo-telemetry payloads before saving to Cold Storage", "is_correct": False},
                                        {"option_text": "To compute driver tax deductions automatically", "is_correct": False},
                                    ],
                                },
                            ],
                        },
                    },
                ],
            },
        ],
    },
    {
        "title": "Airbnb Geospatial Search & Concurrency Reservation Simulator",
        "slug": "airbnb-geospatial-reservation-simulator",
        "subtitle": "Design Airbnb's listing search, geo-bounding box filtering, instant booking double-booking concurrency lock, and pricing pipeline.",
        "description": "Experience building Airbnb's critical reservation and discovery infrastructure. In this simulator, you will implement PostgreSQL PostGIS bounding box queries for fluid map pan-and-zoom discovery, engineer atomic double-booking prevention using PostgreSQL row-level locking (SELECT FOR UPDATE) and Redis distributed locks (Redlock), and calculate multi-currency tax, host payout splits, and cleaning fees.",
        "category_name": "Corporate Experience Simulators",
        "price": Decimal("3499.00"),
        "discount_price": Decimal("2199.00"),
        "level": CourseLevelEnum.INTERMEDIATE,
        "is_featured": True,
        "average_rating": 4.92,
        "review_count": 275,
        "total_learners": 1420,
        "thumbnail_url": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
        "sections": [
            {
                "title": "PostGIS Map Search & Bounding Boxes",
                "lessons": [
                    {
                        "title": "Spatial Polygon Indexing for Map Browsing",
                        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
                        "duration": 620,
                        "is_preview": True,
                    },
                    {
                        "title": "Dynamic Pricing Rules & Seasonal Surges",
                        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
                        "duration": 740,
                        "is_preview": True,
                    },
                ],
            },
            {
                "title": "Concurrency & Instant Booking Engine",
                "lessons": [
                    {
                        "title": "Preventing Double-Bookings with Atomic Database Locks",
                        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnTheLoose.mp4",
                        "duration": 880,
                        "is_preview": False,
                    },
                    {
                        "title": "Host Payout Ledger & Stripe Payment Intent Webhooks",
                        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
                        "duration": 910,
                        "is_preview": False,
                        "quiz": {
                            "title": "Airbnb Concurrency & Booking Integrity Check",
                            "passing_score_percent": 75.0,
                            "questions": [
                                {
                                    "question_text": "How does Airbnb prevent two simultaneous guests from reserving the same property on identical dates?",
                                    "explanation": "SELECT FOR UPDATE locks the calendar date interval rows atomically, forcing competing transactions to block or abort.",
                                    "options": [
                                        {"option_text": "Pessimistic row-level locking (SELECT FOR UPDATE) on the calendar dates within an atomic serializable transaction", "is_correct": True},
                                        {"option_text": "Client-side browser localStorage locking mechanisms", "is_correct": False},
                                        {"option_text": "Relying on eventual consistency in a NoSQL database", "is_correct": False},
                                        {"option_text": "Refunding the second guest 24 hours after checkout", "is_correct": False},
                                    ],
                                },
                                {
                                    "question_text": "Which PostGIS operator is optimized for testing if a property latitude/longitude falls within a map viewport bounding box?",
                                    "explanation": "The && operator uses PostGIS GiST spatial R-tree indexing to test bounding box overlaps in logarithmic time.",
                                    "options": [
                                        {"option_text": "ST_MakeEnvelope and && (bounding box overlap operator)", "is_correct": True},
                                        {"option_text": "ST_Buffer and ST_Union", "is_correct": False},
                                        {"option_text": "LIKE '%coordinates%'", "is_correct": False},
                                        {"option_text": "ST_Length and ST_Perimeter", "is_correct": False},
                                    ],
                                },
                            ],
                        },
                    },
                ],
            },
        ],
    },
    {
        "title": "Netflix Distributed Video Encoding & Transcoding Pipeline",
        "slug": "netflix-video-transcoding-pipeline-simulator",
        "subtitle": "Build Netflix's distributed chunked video encoding pipeline with FFmpeg, AWS S3 multipart uploads, and event-driven SQS workers.",
        "description": "Simulate the role of a Streaming Infrastructure Engineer at Netflix. Architect a fault-tolerant, horizontal video processing fleet: splitting raw 4K camera footage into time-aligned 5-second GOP chunks, distributing parallel encoding jobs across stateless workers to render H.264/HEVC/AV1 at multiple bitrates, generating master HLS/DASH manifest files (.m3u8), and orchestrating automated fallback retries upon node failure.",
        "category_name": "Corporate Experience Simulators",
        "price": Decimal("3799.00"),
        "discount_price": Decimal("2399.00"),
        "level": CourseLevelEnum.ADVANCED,
        "is_featured": True,
        "average_rating": 4.95,
        "review_count": 198,
        "total_learners": 1180,
        "thumbnail_url": "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&q=80",
        "sections": [
            {
                "title": "Video Chunking & Parallelization",
                "lessons": [
                    {
                        "title": "GOP Alignment & Chunked Media Ingestion",
                        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
                        "duration": 670,
                        "is_preview": True,
                    },
                    {
                        "title": "FFmpeg Multi-Bitrate Ladder Encoding",
                        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
                        "duration": 820,
                        "is_preview": True,
                    },
                ],
            },
            {
                "title": "Manifest Generation & Adaptive Bitrate Streaming",
                "lessons": [
                    {
                        "title": "Assembling Dynamic HLS & DASH Master Manifests",
                        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                        "duration": 860,
                        "is_preview": False,
                    },
                    {
                        "title": "Worker Orchestration & Dead-Letter Queue Handling",
                        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                        "duration": 930,
                        "is_preview": False,
                        "quiz": {
                            "title": "Netflix Video Pipeline & HLS Encoding Check",
                            "passing_score_percent": 75.0,
                            "questions": [
                                {
                                    "question_text": "Why must chunked video segments align strictly on Group of Pictures (GOP) keyframe boundaries?",
                                    "explanation": "Keyframe alignment ensures clients can instantly switch bitrates mid-stream without decoding corrupted P/B frame references.",
                                    "options": [
                                        {"option_text": "To ensure seamless playback switching across different bitrate streams without visual glitches", "is_correct": True},
                                        {"option_text": "To decrease audio channel frequencies", "is_correct": False},
                                        {"option_text": "Because MP4 containers reject uncompressed frames", "is_correct": False},
                                        {"option_text": "To encrypt DRM licenses automatically", "is_correct": False},
                                    ],
                                },
                                {
                                    "question_text": "What is the purpose of an SQS Dead-Letter Queue (DLQ) in Netflix's transcoding fleet?",
                                    "explanation": "A DLQ captures poison-pill inputs that repeatedly exceed max receive counts, allowing debugging without halting the main queue.",
                                    "options": [
                                        {"option_text": "To isolate corrupted video chunks that repeatedly fail encoding and prevent fleet-wide worker poisoning", "is_correct": True},
                                        {"option_text": "To store expired user passwords", "is_correct": False},
                                        {"option_text": "To cache video thumbnails on edge CDN nodes", "is_correct": False},
                                        {"option_text": "To reduce S3 storage pricing tier costs", "is_correct": False},
                                    ],
                                },
                            ],
                        },
                    },
                ],
            },
        ],
    },
    {
        "title": "Zerodha High-Frequency Order Matching & Ledger Simulator",
        "slug": "zerodha-order-matching-engine-simulator",
        "subtitle": "Construct a low-latency price-time priority L3 limit order book with WebSocket ticker feeds and ACID ledger balancing.",
        "description": "Step into the shoes of a Quantitative Infrastructure Architect at Zerodha. Build a ultra-low latency exchange matching engine capable of executing limit and market orders using a Price-Time Priority (FIFO) algorithm, broadcasting real-time market depth (Level 2 / Level 3 order books) over WebSockets, performing instant pre-trade margin and risk checks, and maintaining double-entry financial accounting ledgers.",
        "category_name": "Corporate Experience Simulators",
        "price": Decimal("4499.00"),
        "discount_price": Decimal("2999.00"),
        "level": CourseLevelEnum.ADVANCED,
        "is_featured": True,
        "average_rating": 4.98,
        "review_count": 410,
        "total_learners": 2300,
        "thumbnail_url": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
        "sections": [
            {
                "title": "Limit Order Book (LOB) Architecture",
                "lessons": [
                    {
                        "title": "Price-Time Priority (FIFO) Matching Engine",
                        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
                        "duration": 780,
                        "is_preview": True,
                    },
                    {
                        "title": "Market Depth & Level 3 WebSocket Streaming",
                        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4",
                        "duration": 840,
                        "is_preview": True,
                    },
                ],
            },
            {
                "title": "Risk Management & Ledger Settlement",
                "lessons": [
                    {
                        "title": "Pre-Trade Margin Verification & Circuit Breakers",
                        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
                        "duration": 910,
                        "is_preview": False,
                    },
                    {
                        "title": "Double-Entry Financial Reconciliation Ledger",
                        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
                        "duration": 960,
                        "is_preview": False,
                        "quiz": {
                            "title": "Zerodha Matching Engine & Trading Architecture Check",
                            "passing_score_percent": 80.0,
                            "questions": [
                                {
                                    "question_text": "In a Price-Time Priority (FIFO) Limit Order Book, how are resting buy orders prioritized for incoming market sell orders?",
                                    "explanation": "Price-Time Priority prioritizes the best bid (highest price), breaking ties by arrival sequence (earliest timestamp).",
                                    "options": [
                                        {"option_text": "Highest price first; if prices match, the earliest timestamp executes first", "is_correct": True},
                                        {"option_text": "Lowest price first, regardless of timestamp", "is_correct": False},
                                        {"option_text": "Largest order volume first to minimize trade count", "is_correct": False},
                                        {"option_text": "Random round-robin distribution among brokers", "is_correct": False},
                                    ],
                                },
                                {
                                    "question_text": "Why is double-entry bookkeeping required for financial brokerages like Zerodha?",
                                    "explanation": "Double-entry bookkeeping ensures zero financial leakage by requiring that debits always balance credits across every trade.",
                                    "options": [
                                        {"option_text": "Every financial event creates matching debit and credit entries, guaranteeing mathematically that assets equal liabilities plus equity", "is_correct": True},
                                        {"option_text": "It doubles the execution speed of database write operations", "is_correct": False},
                                        {"option_text": "It bypasses SEBI regulatory reporting requirements", "is_correct": False},
                                        {"option_text": "It eliminates the need for database index structures", "is_correct": False},
                                    ],
                                },
                            ],
                        },
                    },
                ],
            },
        ],
    },
    {
        "title": "Swiggy Hyperlocal Delivery Routing & Fleet Dispatch Simulator",
        "slug": "swiggy-fleet-routing-dispatch-simulator",
        "subtitle": "Implement multi-order batching, traveling salesperson routing, rider dispatch assignment, and live ETA tracking.",
        "description": "Experience the logistical complexity of India's leading on-demand food delivery network. You will engineer Swiggy's fleet optimization engine: bundling multiple orders from adjacent restaurants to maximize rider efficiency, computing optimal pickup-dropoff sequences with Traveling Salesperson Problem (TSP) heuristics, predicting real-time kitchen preparation vs. traffic arrival ETAs, and broadcasting live rider GPS pings to customer apps.",
        "category_name": "Corporate Experience Simulators",
        "price": Decimal("3299.00"),
        "discount_price": Decimal("1999.00"),
        "level": CourseLevelEnum.INTERMEDIATE,
        "is_featured": True,
        "average_rating": 4.91,
        "review_count": 240,
        "total_learners": 1350,
        "thumbnail_url": "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&q=80",
        "sections": [
            {
                "title": "Multi-Order Batching & Routing",
                "lessons": [
                    {
                        "title": "Restaurant Clustering & Order Bundling Heuristics",
                        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnTheLoose.mp4",
                        "duration": 640,
                        "is_preview": True,
                    },
                    {
                        "title": "Solving Pickup-Dropoff Sequences with TSP",
                        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
                        "duration": 810,
                        "is_preview": True,
                    },
                ],
            },
            {
                "title": "Real-Time Dispatch & Dynamic ETAs",
                "lessons": [
                    {
                        "title": "Rider Matchmaking & Surge Capacity Allocation",
                        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
                        "duration": 870,
                        "is_preview": False,
                    },
                    {
                        "title": "Live Telemetry Ingestion & Real-Time ETA Machine Learning",
                        "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
                        "duration": 920,
                        "is_preview": False,
                        "quiz": {
                            "title": "Swiggy Hyperlocal Logistics & Routing Check",
                            "passing_score_percent": 75.0,
                            "questions": [
                                {
                                    "question_text": "When bundling 2 food delivery orders for a single delivery partner, which constraint is most critical to avoid food degradation?",
                                    "explanation": "A rider cannot deliver an order before picking it up (precedence), and total transit time must remain within strict freshness limits.",
                                    "options": [
                                        {"option_text": "Pickup-before-dropoff precedence constraint and maximum delivery latency thresholds", "is_correct": True},
                                        {"option_text": "Alphabetical sorting of customer delivery addresses", "is_correct": False},
                                        {"option_text": "Ensuring both restaurants belong to the same parent franchise", "is_correct": False},
                                        {"option_text": "Minimizing rider smartphone battery consumption", "is_correct": False},
                                    ],
                                },
                                {
                                    "question_text": "What is the primary benefit of spatial clustering (e.g. DBSCAN) in Swiggy's order dispatch pipeline?",
                                    "explanation": "Spatial clustering groups nearby restaurant pickups, enabling a single rider to batch orders heading in the same geographic trajectory.",
                                    "options": [
                                        {"option_text": "Grouping order preparation demands within dense commercial pockets to optimize rider trip utilization", "is_correct": True},
                                        {"option_text": "Compressing menu image thumbnails", "is_correct": False},
                                        {"option_text": "Generating automated SMS promotional codes", "is_correct": False},
                                        {"option_text": "Calculating customer credit scores", "is_correct": False},
                                    ],
                                },
                            ],
                        },
                    },
                ],
            },
        ],
    },
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
                        description=f"Top corporate simulations and courses in {cat_name}",
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
                        description=f"In-depth simulation exercise covering {l_data['title']}",
                        order_index=l_idx + 1,
                        video_url=l_data["video_url"],
                        video_duration_seconds=l_data["duration"],
                        is_preview=l_data["is_preview"],
                        content_text=f"Hands-on architectural simulation notes and exercises for {l_data['title']}.",
                    )
                    db.add(lesson)
                    await db.flush()

                    # Add quizzes if specified
                    if "quiz" in l_data and l_data["quiz"]:
                        q_data = l_data["quiz"]
                        quiz = Quiz(
                            lesson_id=lesson.id,
                            title=q_data["title"],
                            description=q_data.get("description", "Evaluation Quiz"),
                            passing_score_percent=q_data.get("passing_score_percent", 70.0),
                            time_limit_minutes=q_data.get("time_limit_minutes", 15),
                        )
                        db.add(quiz)
                        await db.flush()

                        for q_idx, q_item in enumerate(q_data.get("questions", [])):
                            qq = QuizQuestion(
                                quiz_id=quiz.id,
                                question_text=q_item["question_text"],
                                order_index=q_idx + 1,
                                explanation=q_item.get("explanation"),
                                points=q_item.get("points", 1),
                            )
                            db.add(qq)
                            await db.flush()

                            for opt in q_item.get("options", []):
                                qo = QuizOption(
                                    question_id=qq.id,
                                    option_text=opt["option_text"],
                                    is_correct=opt["is_correct"],
                                )
                                db.add(qo)

            print(f"Seeded Corporate Experience Simulator: {course.title}")

        await db.commit()
        print("Successfully seeded all courses and corporate simulators!")


if __name__ == "__main__":
    asyncio.run(seed_courses())
