import os
import uuid
import datetime
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from app.core.config import settings


class StorageProvider(ABC):
    @abstractmethod
    async def generate_upload_url(
        self, file_name: str, mime_type: str, folder: str = "videos"
    ) -> Dict[str, Any]:
        """Generates a presigned URL or direct upload token for client-side upload."""
        pass

    @abstractmethod
    async def generate_access_url(self, storage_key: str, expires_in_seconds: int = 3600) -> str:
        """Generates a secure signed URL for content playback or download."""
        pass


class LocalStorageProvider(StorageProvider):
    def __init__(self, base_dir: str = "./media"):
        self.base_dir = base_dir
        os.makedirs(base_dir, exist_ok=True)

    async def generate_upload_url(
        self, file_name: str, mime_type: str, folder: str = "videos"
    ) -> Dict[str, Any]:
        ext = file_name.split(".")[-1] if "." in file_name else "bin"
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        storage_key = f"{folder}/{unique_name}"
        
        # Local upload destination endpoint mock
        upload_url = f"/api/v1/videos/upload-direct/{storage_key}"
        return {
            "upload_url": upload_url,
            "storage_key": storage_key,
            "provider": "local",
            "expires_in": 3600,
        }

    async def generate_access_url(self, storage_key: str, expires_in_seconds: int = 3600) -> str:
        # Returns direct API streaming URL
        return f"/api/v1/videos/stream/{storage_key}"


class AzureBlobStorageProvider(StorageProvider):
    def __init__(self, connection_string: Optional[str], container: str):
        self.connection_string = connection_string
        self.container = container

    async def generate_upload_url(
        self, file_name: str, mime_type: str, folder: str = "videos"
    ) -> Dict[str, Any]:
        ext = file_name.split(".")[-1] if "." in file_name else "bin"
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        storage_key = f"{folder}/{unique_name}"
        
        # When Azure SDK is configured:
        # Generate SAS token for container upload
        upload_url = f"https://{settings.AZURE_STORAGE_CONTAINER}.blob.core.windows.net/{storage_key}?sas_token=mock_sas_token"
        return {
            "upload_url": upload_url,
            "storage_key": storage_key,
            "provider": "azure",
            "expires_in": 3600,
        }

    async def generate_access_url(self, storage_key: str, expires_in_seconds: int = 3600) -> str:
        return f"https://{settings.AZURE_STORAGE_CONTAINER}.blob.core.windows.net/{storage_key}?signed_sas=mock_read_token"


def get_storage_provider() -> StorageProvider:
    if settings.STORAGE_PROVIDER == "azure" and settings.AZURE_STORAGE_CONNECTION_STRING:
        return AzureBlobStorageProvider(
            settings.AZURE_STORAGE_CONNECTION_STRING, settings.AZURE_STORAGE_CONTAINER
        )
    return LocalStorageProvider(settings.LOCAL_STORAGE_DIR)
