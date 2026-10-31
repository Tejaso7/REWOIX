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


ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov", ".mkv"}
MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024  # 500 MB


@router.post("/upload-direct/{folder}/{filename}")
async def upload_direct_local_video(
    folder: str,
    filename: str,
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles([UserRoleEnum.TEACHER, UserRoleEnum.ADMIN])),
):
    """Local storage fallback upload receiver endpoint (Teacher/Admin only)."""
    clean_folder = os.path.basename(folder)
    clean_filename = os.path.basename(filename)

    ext = os.path.splitext(clean_filename)[1].lower()
    if ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Allowed: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}",
        )

    base_dir = os.path.abspath(f"./media/{clean_folder}")
    media_root = os.path.abspath("./media")
    if not base_dir.startswith(media_root):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    os.makedirs(base_dir, exist_ok=True)
    file_path = os.path.join(base_dir, clean_filename)

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum permitted limit (500 MB)",
        )

    with open(file_path, "wb") as f:
        f.write(contents)

    return {
        "status": "success",
        "storage_key": f"{clean_folder}/{clean_filename}",
        "file_size": len(contents),
    }


@router.get("/stream/{folder}/{filename}")
async def stream_local_video(folder: str, filename: str):
    clean_folder = os.path.basename(folder)
    clean_filename = os.path.basename(filename)

    media_root = os.path.abspath("./media")
    file_path = os.path.abspath(os.path.join(media_root, clean_folder, clean_filename))

    if not file_path.startswith(media_root):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media file not found")

    return FileResponse(file_path, media_type="video/mp4")
