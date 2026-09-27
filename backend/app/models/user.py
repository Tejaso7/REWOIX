import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import enum


class UserRoleEnum(str, enum.Enum):
    LEARNER = "LEARNER"
    TEACHER = "TEACHER"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    avatar_url = Column(String(512), nullable=True)
    bio = Column(Text, nullable=True)
    phone_number = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    roles = relationship("UserRole", back_populates="user", cascade="all, delete-orphan", lazy="joined")
    teacher_profile = relationship("TeacherProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    learner_profile = relationship("LearnerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    courses = relationship("Course", back_populates="teacher")
    enrollments = relationship("Enrollment", back_populates="learner")
    orders = relationship("Order", back_populates="learner")
    certificates = relationship("Certificate", back_populates="learner")
    notifications = relationship("Notification", back_populates="user")


class UserRole(Base):
    __tablename__ = "user_roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(SQLEnum(UserRoleEnum), nullable=False)

    user = relationship("User", back_populates="roles")


class TeacherProfile(Base):
    __tablename__ = "teacher_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Working Professional Info
    headline = Column(String(255), nullable=True)
    company_name = Column(String(255), nullable=True)
    domain_expertise = Column(String(255), nullable=True)
    ctc_bracket = Column(String(100), nullable=True)  # e.g., "25-35 LPA"
    experience_years = Column(String(50), nullable=True)
    
    # Professional Links
    linkedin_url = Column(String(512), nullable=True)
    github_url = Column(String(512), nullable=True)
    website = Column(String(512), nullable=True)
    technical_skills = Column(Text, nullable=True)

    # Bank Account & Payout Info
    bank_name = Column(String(255), nullable=True)
    account_number = Column(String(100), nullable=True)
    ifsc_code = Column(String(50), nullable=True)
    account_holder_name = Column(String(255), nullable=True)
    upi_id = Column(String(100), nullable=True)
    payout_account_info = Column(Text, nullable=True)

    # Admin Commission Settings
    custom_commission_percent = Column(Float, default=70.0, nullable=False)  # Teacher share %
    total_earnings = Column(Text, default="0.00", nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="teacher_profile")


class LearnerProfile(Base):
    __tablename__ = "learner_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Learner Details
    user_type = Column(String(100), default="STUDENT", nullable=True)  # STUDENT, FRESHER, WORKING_PROFESSIONAL, JOB_SEEKER
    institution_or_company = Column(String(255), nullable=True)
    field_of_study_or_role = Column(String(255), nullable=True)
    primary_learning_goal = Column(String(255), nullable=True)
    interests = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="learner_profile")
