from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import uuid
from app.core.deps import require_roles
from app.models.user import User, UserRoleEnum
from app.core.storage import get_storage_provider

router = APIRouter(prefix="/videos", tags=["Video Upload & Streaming"])


class UploadUrlRequest(BaseModel):
    file_name: str
    mime_type: str


@router.post("/upload-url")
async def get_video_upload_url(
    req: UploadUrlRequest,
    current_user: User = Depends(require_roles([UserRoleEnum.TEACHER, UserRoleEnum.ADMIN])),
):
    storage = get_storage_provider()
    res = await storage.generate_upload_url(
        file_name=req.file_name, mime_type=req.mime_type, folder="videos"
    )
    return res


@router.post("/upload-direct/{folder}/{filename}")
async def upload_direct_local_video(
    folder: str,
    filename: str,
    file: UploadFile = File(...),
):
    """Local storage fallback upload receiver endpoint."""
    base_dir = f"./media/{folder}"
    os.makedirs(base_dir, exist_ok=True)
    file_path = os.path.join(base_dir, filename)

    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    return {
        "status": "success",
        "storage_key": f"{folder}/{filename}",
        "file_size": len(contents),
    }


@router.get("/stream/{folder}/{filename}")
async def stream_local_video(folder: str, filename: str):
    file_path = os.path.join("./media", folder, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Media file not found")
    return FileResponse(file_path, media_type="video/mp4")
