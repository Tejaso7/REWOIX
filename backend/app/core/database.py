from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Adaptive Engine Configuration for SQLite vs PostgreSQL (10k+ Scale)
engine_kwargs = {
    "echo": settings.DEBUG,
    "future": True,
    "pool_pre_ping": True,
}

if not settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs.update({
        "pool_size": 20,
        "max_overflow": 40,
        "pool_recycle": 3600,
    })

engine = create_async_engine(settings.DATABASE_URL, **engine_kwargs)

# Create Session Maker
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
