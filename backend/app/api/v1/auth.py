from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
)
from app.core.deps import get_current_active_user
from app.models.user import User, UserRole, UserRoleEnum, LearnerProfile, TeacherProfile
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    Token,
    UserResponse,
    TeacherOnboardingRequest,
    LearnerOnboardingRequest,
    TeacherProfileResponse,
    LearnerProfileResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


async def build_user_response(user: User, db: AsyncSession) -> UserResponse:
    roles = [r.role.value for r in user.roles]
    
    # Load profiles if exist
    stmt_t = select(TeacherProfile).where(TeacherProfile.user_id == user.id)
    t_prof = (await db.execute(stmt_t)).scalar_one_or_none()
    
    stmt_l = select(LearnerProfile).where(LearnerProfile.user_id == user.id)
    l_prof = (await db.execute(stmt_l)).scalar_one_or_none()

    t_resp = TeacherProfileResponse.model_validate(t_prof) if t_prof else None
    l_resp = LearnerProfileResponse.model_validate(l_prof) if l_prof else None

    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
        bio=user.bio,
        phone_number=user.phone_number,
        is_active=user.is_active,
        is_verified=user.is_verified,
        roles=roles,
        teacher_profile=t_resp,
        learner_profile=l_resp,
        created_at=user.created_at,
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    # Check existing user
    stmt = select(User).where(User.email == user_in.email)
    existing = await db.execute(stmt)
    if existing.unique().scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    role_enum = UserRoleEnum.LEARNER
    if user_in.role.upper() == "TEACHER":
        role_enum = UserRoleEnum.TEACHER
    elif user_in.role.upper() == "ADMIN":
        role_enum = UserRoleEnum.ADMIN

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    await db.flush()

    # Assign role
    role = UserRole(user_id=user.id, role=role_enum)
    db.add(role)

    # Assign profiles
    if role_enum == UserRoleEnum.TEACHER:
        db.add(TeacherProfile(user_id=user.id, headline="Instructor"))
    else:
        db.add(LearnerProfile(user_id=user.id))

    await db.commit()
    await db.refresh(user)

    return await build_user_response(user, db)


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == credentials.email)
    result = await db.execute(stmt)
    user = result.unique().scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account"
        )

    roles = [r.role.value for r in user.roles]
    access_token = create_access_token(subject=str(user.id), roles=roles)
    refresh_token = create_refresh_token(subject=str(user.id))

    user_resp = await build_user_response(user, db)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_resp,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    return await build_user_response(current_user, db)


@router.post("/teacher-onboarding", response_model=TeacherProfileResponse)
async def save_teacher_onboarding(
    profile_in: TeacherOnboardingRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(TeacherProfile).where(TeacherProfile.user_id == current_user.id)
    t_prof = (await db.execute(stmt)).scalar_one_or_none()

    if not t_prof:
        t_prof = TeacherProfile(user_id=current_user.id)
        db.add(t_prof)

    for field, val in profile_in.model_dump(exclude_unset=True).items():
        setattr(t_prof, field, val)

    await db.commit()
    await db.refresh(t_prof)
    return TeacherProfileResponse.model_validate(t_prof)


@router.post("/learner-onboarding", response_model=LearnerProfileResponse)
async def save_learner_onboarding(
    profile_in: LearnerOnboardingRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LearnerProfile).where(LearnerProfile.user_id == current_user.id)
    l_prof = (await db.execute(stmt)).scalar_one_or_none()

    if not l_prof:
        l_prof = LearnerProfile(user_id=current_user.id)
        db.add(l_prof)

    for field, val in profile_in.model_dump(exclude_unset=True).items():
        if field == "phone_number":
            current_user.phone_number = val
        else:
            setattr(l_prof, field, val)

    await db.commit()
    await db.refresh(l_prof)
    return LearnerProfileResponse.model_validate(l_prof)
