import os
import uuid
from abc import ABC, abstractmethod
from pathlib import Path

import boto3
from fastapi import UploadFile

from app.config import settings


class StorageBackend(ABC):
    @abstractmethod
    def upload(self, file: UploadFile, folder: str = "thomassons") -> tuple[str, str]:
        """Upload a file and return (file_key, file_url)."""
        pass

    @abstractmethod
    def delete(self, file_key: str) -> None:
        """Delete a file by its key."""
        pass

    def _generate_key(self, filename: str, folder: str) -> str:
        ext = os.path.splitext(filename)[1].lower() if filename else ".jpg"
        unique_name = f"{uuid.uuid4().hex}{ext}"
        return f"{folder}/{unique_name}"


class LocalStorage(StorageBackend):
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def upload(self, file: UploadFile, folder: str = "thomassons") -> tuple[str, str]:
        file_key = self._generate_key(file.filename, folder)
        file_path = self.upload_dir / file_key
        file_path.parent.mkdir(parents=True, exist_ok=True)

        contents = file.file.read()
        with open(file_path, "wb") as f:
            f.write(contents)

        file_url = f"{settings.BASE_URL}/uploads/{file_key}"
        return file_key, file_url

    def delete(self, file_key: str) -> None:
        file_path = self.upload_dir / file_key
        if file_path.exists():
            file_path.unlink()


class S3Storage(StorageBackend):
    def __init__(self):
        session_kwargs = {}
        if settings.AWS_ACCESS_KEY_ID:
            session_kwargs["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
        if settings.AWS_SECRET_ACCESS_KEY:
            session_kwargs["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY
        if settings.S3_REGION:
            session_kwargs["region_name"] = settings.S3_REGION

        client_kwargs = {}
        if settings.S3_ENDPOINT_URL:
            client_kwargs["endpoint_url"] = settings.S3_ENDPOINT_URL

        self.s3 = boto3.client("s3", **session_kwargs, **client_kwargs)
        self.bucket = settings.S3_BUCKET

    def upload(self, file: UploadFile, folder: str = "thomassons") -> tuple[str, str]:
        file_key = self._generate_key(file.filename, folder)

        content_type = file.content_type or "application/octet-stream"
        self.s3.upload_fileobj(
            file.file,
            self.bucket,
            file_key,
            ExtraArgs={"ContentType": content_type},
        )

        if settings.CLOUDFRONT_DOMAIN:
            file_url = f"https://{settings.CLOUDFRONT_DOMAIN}/{file_key}"
        else:
            if settings.S3_ENDPOINT_URL:
                file_url = f"{settings.S3_ENDPOINT_URL}/{self.bucket}/{file_key}"
            else:
                file_url = f"https://{self.bucket}.s3.amazonaws.com/{file_key}"

        return file_key, file_url

    def delete(self, file_key: str) -> None:
        self.s3.delete_object(Bucket=self.bucket, Key=file_key)


def get_storage() -> StorageBackend:
    if settings.STORAGE_BACKEND == "s3":
        return S3Storage()
    return LocalStorage()
