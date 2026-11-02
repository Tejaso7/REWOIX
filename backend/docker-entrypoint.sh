#!/bin/sh
set -e

echo "============================================="
echo "   REWOIX Enterprise Backend Container"
echo "============================================="

export PYTHONPATH=/app:${PYTHONPATH:-}

# 1. Wait for PostgreSQL if DATABASE_URL points to postgres
if [ -n "$DATABASE_URL" ] && echo "$DATABASE_URL" | grep -q "postgres"; then
    echo "Checking PostgreSQL readiness..."
    MAX_RETRIES=30
    COUNT=0
    until python -c "
import asyncio, os, sys
from sqlalchemy.ext.asyncio import create_async_engine

def get_url():
    u = os.environ.get('DATABASE_URL', '')
    if u.startswith('postgres://'):
        return u.replace('postgres://', 'postgresql+asyncpg://', 1)
    elif u.startswith('postgresql://') and not u.startswith('postgresql+asyncpg://'):
        return u.replace('postgresql://', 'postgresql+asyncpg://', 1)
    return u

async def check():
    url = get_url()
    try:
        engine = create_async_engine(url)
        async with engine.connect() as conn:
            pass
        await engine.dispose()
        sys.exit(0)
    except Exception:
        sys.exit(1)

asyncio.run(check())
" 2>/dev/null; do
        COUNT=$((COUNT + 1))
        if [ "$COUNT" -ge "$MAX_RETRIES" ]; then
            echo "Timeout waiting for PostgreSQL database. Proceeding anyway..."
            break
        fi
        echo "Waiting for PostgreSQL database to accept connections... ($COUNT/$MAX_RETRIES)"
        sleep 2
    done
    echo "PostgreSQL is reachable."
fi

# 2. Run Alembic Database Migrations
echo "Applying database migrations (Alembic)..."
alembic upgrade head || {
    echo "Alembic upgrade encountered an issue or schema is already created. Continuing..."
}

# 3. Check and Seed Initial Platform Data (Idempotent)
echo "Checking seed data (Users, Roles & Default Workplace Simulations)..."
python seed.py || echo "seed.py completed or skipped."
python scripts/seed_courses.py || echo "scripts/seed_courses.py completed or skipped."

echo "Starting ASGI application server (Port: ${PORT:-8000})..."
exec "$@"
