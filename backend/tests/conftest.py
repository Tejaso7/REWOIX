import pytest
import asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.main import app
from app.core.database import Base, get_db
from app.core.security import create_access_token, get_password_hash
from app.models.user import User, UserRole, UserRoleEnum

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine_test = create_async_engine(TEST_DATABASE_URL, echo=False)
TestingSessionLocal = async_sessionmaker(
    bind=engine_test, class_=AsyncSession, expire_on_commit=False
)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(autouse=True)
async def setup_test_db():
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://testserver/api/v1"
    ) as ac:
        yield ac


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session


@pytest.fixture
async def test_teacher_headers(db_session: AsyncSession):
    teacher = User(
        email="test_teacher@example.com",
        hashed_password=get_password_hash("password123"),
        full_name="Test Teacher",
    )
    db_session.add(teacher)
    await db_session.flush()
    db_session.add(UserRole(user_id=teacher.id, role=UserRoleEnum.TEACHER))
    await db_session.commit()

    token = create_access_token(subject=str(teacher.id), roles=["TEACHER"])
    return {"Authorization": f"Bearer {token}"}, teacher


@pytest.fixture
async def test_admin_headers(db_session: AsyncSession):
    admin = User(
        email="test_admin@example.com",
        hashed_password=get_password_hash("password123"),
        full_name="Test Admin",
    )
    db_session.add(admin)
    await db_session.flush()
    db_session.add(UserRole(user_id=admin.id, role=UserRoleEnum.ADMIN))
    await db_session.commit()

    token = create_access_token(subject=str(admin.id), roles=["ADMIN"])
    return {"Authorization": f"Bearer {token}"}, admin
