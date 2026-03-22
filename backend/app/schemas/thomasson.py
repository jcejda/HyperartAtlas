from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.thomasson import ThomassonStatus


class PhotoResponse(BaseModel):
    id: str
    file_url: str
    is_primary: bool
    order: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ThomassonMapItem(BaseModel):
    """Lightweight representation for map pins."""
    id: str
    title: Optional[str]
    category: str
    latitude: float
    longitude: float
    primary_photo_url: Optional[str]
    username: str
    discovery_date: Optional[date]
    created_at: datetime


class ThomassonDetail(BaseModel):
    id: str
    title: Optional[str]
    description: str
    category: str
    latitude: float
    longitude: float
    status: ThomassonStatus
    submitted_by: str
    submitter_username: str
    reviewed_by: Optional[str]
    reviewer_username: Optional[str]
    review_note: Optional[str]
    reviewed_at: Optional[datetime]
    photos: List[PhotoResponse]
    discovery_date: Optional[date]
    created_at: datetime
    updated_at: datetime


class ThomassonSubmission(BaseModel):
    """Used for validation; actual endpoint uses Form params."""
    title: Optional[str] = None
    description: str = Field(min_length=10, max_length=5000)
    category: str
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    discovery_date: Optional[date] = None


class ThomassonUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = Field(default=None, min_length=10, max_length=5000)
    category: Optional[str] = None
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)


class ThomassonMySubmission(BaseModel):
    id: str
    title: Optional[str]
    category: str
    latitude: float
    longitude: float
    status: ThomassonStatus
    review_note: Optional[str]
    primary_photo_url: Optional[str]
    created_at: datetime
    updated_at: datetime


class AdminSubmissionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = Field(default=None, min_length=10, max_length=5000)
    category: Optional[str] = None
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)


class ReviewAction(BaseModel):
    note: Optional[str] = None
