from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.waitlist import WaitlistEntry

router = APIRouter(prefix="/waitlist", tags=["Waitlist"])


class WaitlistCreateRequest(BaseModel):
    name: str
    email: EmailStr
    roleStage: Optional[str] = None
    role_stage: Optional[str] = None
    targetDomain: Optional[str] = None
    target_domain: Optional[str] = None

    def get_role_stage(self) -> str:
        return self.roleStage or self.role_stage or "graduate"

    def get_target_domain(self) -> str:
        return self.targetDomain or self.target_domain or "All Tracks"


class WaitlistResponse(BaseModel):
    success: bool
    message: str
    queue_number: int
    name: str
    email: str
    roleStage: str
    targetDomain: Optional[str]


@router.post("", response_model=WaitlistResponse, status_code=status.HTTP_201_CREATED)
async def join_waitlist(payload: WaitlistCreateRequest, db: AsyncSession = Depends(get_db)):
    role_stage_val = payload.get_role_stage()
    target_domain_val = payload.get_target_domain()

    # Check if already registered in waitlist
    stmt = select(WaitlistEntry).where(WaitlistEntry.email == payload.email)
    existing = (await db.execute(stmt)).scalar_one_or_none()

    if existing:
        return WaitlistResponse(
            success=True,
            message="You are already on the priority early access list!",
            queue_number=existing.queue_number or 412,
            name=existing.name,
            email=existing.email,
            roleStage=existing.role_stage,
            targetDomain=existing.target_domain,
        )

    # Determine next queue position
    count_stmt = select(func.count(WaitlistEntry.id))
    total_existing = (await db.execute(count_stmt)).scalar() or 0
    assigned_queue_number = 380 + total_existing + 1

    entry = WaitlistEntry(
        name=payload.name,
        email=payload.email,
        role_stage=role_stage_val,
        target_domain=target_domain_val,
        queue_number=assigned_queue_number,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)

    return WaitlistResponse(
        success=True,
        message="Welcome to REWOIX early access!",
        queue_number=entry.queue_number,
        name=entry.name,
        email=entry.email,
        roleStage=entry.role_stage,
        targetDomain=entry.target_domain,
    )


@router.get("/count")
async def get_waitlist_stats(db: AsyncSession = Depends(get_db)):
    count_stmt = select(func.count(WaitlistEntry.id))
    total = (await db.execute(count_stmt)).scalar() or 0
    return {"total_waitlist": 380 + total}
