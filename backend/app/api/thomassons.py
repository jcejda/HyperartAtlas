from typing import List, Optional

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session, joinedload

from app.core.deps import DbSession, CurrentUser
from app.models.thomasson import Thomasson, ThomassonStatus, Photo, THOMASSON_CATEGORIES
from app.models.user import User
from app.schemas.thomasson import (
    ThomassonMapItem,
    ThomassonDetail,
    ThomassonUpdate,
    ThomassonMySubmission,
    PhotoResponse,
)
from app.services.storage import get_storage

router = APIRouter(prefix="/api/thomassons", tags=["thomassons"])

MAX_PHOTOS = 10
MAX_PHOTO_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic"}


def _thomasson_to_map_item(t: Thomasson) -> ThomassonMapItem:
    primary = t.primary_photo
    return ThomassonMapItem(
        id=t.id,
        title=t.title,
        category=t.category,
        latitude=t.latitude,
        longitude=t.longitude,
        primary_photo_url=primary.file_url if primary else None,
        username=t.submitter.username,
        created_at=t.created_at,
    )


def _thomasson_to_detail(t: Thomasson) -> ThomassonDetail:
    return ThomassonDetail(
        id=t.id,
        title=t.title,
        description=t.description,
        category=t.category,
        latitude=t.latitude,
        longitude=t.longitude,
        status=t.status,
        submitted_by=t.submitted_by,
        submitter_username=t.submitter.username,
        reviewed_by=t.reviewed_by,
        reviewer_username=t.reviewer.username if t.reviewer else None,
        review_note=t.review_note,
        reviewed_at=t.reviewed_at,
        photos=[PhotoResponse.model_validate(p) for p in t.photos],
        created_at=t.created_at,
        updated_at=t.updated_at,
    )


def _thomasson_to_my_submission(t: Thomasson) -> ThomassonMySubmission:
    primary = t.primary_photo
    return ThomassonMySubmission(
        id=t.id,
        title=t.title,
        category=t.category,
        latitude=t.latitude,
        longitude=t.longitude,
        status=t.status,
        review_note=t.review_note,
        primary_photo_url=primary.file_url if primary else None,
        created_at=t.created_at,
        updated_at=t.updated_at,
    )


@router.get("/", response_model=List[ThomassonMapItem])
def list_approved_thomassons(
    db: DbSession,
    category: Optional[str] = Query(None),
    limit: int = Query(200, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    """List approved thomassons for the public map."""
    query = (
        db.query(Thomasson)
        .options(joinedload(Thomasson.submitter), joinedload(Thomasson.photos))
        .filter(Thomasson.status == ThomassonStatus.APPROVED)
    )
    if category:
        query = query.filter(Thomasson.category == category)
    query = query.order_by(Thomasson.created_at.desc())
    thomassons = query.offset(offset).limit(limit).all()
    return [_thomasson_to_map_item(t) for t in thomassons]


@router.get("/my-submissions", response_model=List[ThomassonMySubmission])
def list_my_submissions(
    db: DbSession,
    current_user: CurrentUser,
    status_filter: Optional[str] = Query(None, alias="status"),
):
    """List the current user's own submissions."""
    query = (
        db.query(Thomasson)
        .options(joinedload(Thomasson.photos))
        .filter(Thomasson.submitted_by == current_user.id)
    )
    if status_filter:
        try:
            ts = ThomassonStatus(status_filter)
            query = query.filter(Thomasson.status == ts)
        except ValueError:
            pass
    thomassons = query.order_by(Thomasson.created_at.desc()).all()
    return [_thomasson_to_my_submission(t) for t in thomassons]


@router.get("/{thomasson_id}", response_model=ThomassonDetail)
def get_thomasson(thomasson_id: str, db: DbSession):
    """Get full detail of an approved thomasson."""
    thomasson = (
        db.query(Thomasson)
        .options(
            joinedload(Thomasson.submitter),
            joinedload(Thomasson.reviewer),
            joinedload(Thomasson.photos),
        )
        .filter(Thomasson.id == thomasson_id)
        .first()
    )
    if not thomasson:
        raise HTTPException(status_code=404, detail="Thomasson not found")
    if thomasson.status != ThomassonStatus.APPROVED:
        raise HTTPException(status_code=404, detail="Thomasson not found")
    return _thomasson_to_detail(thomasson)


@router.post("/", response_model=ThomassonDetail, status_code=status.HTTP_201_CREATED)
def create_thomasson(
    db: DbSession,
    current_user: CurrentUser,
    description: str = Form(..., min_length=10, max_length=5000),
    category: str = Form(...),
    latitude: float = Form(..., ge=-90, le=90),
    longitude: float = Form(..., ge=-180, le=180),
    title: Optional[str] = Form(None),
    photos: List[UploadFile] = File(default=[]),
):
    """Submit a new thomasson sighting with optional photos."""
    if category not in THOMASSON_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid category. Must be one of: {', '.join(THOMASSON_CATEGORIES)}",
        )

    if len(photos) > MAX_PHOTOS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Maximum {MAX_PHOTOS} photos allowed",
        )

    thomasson = Thomasson(
        title=title,
        description=description,
        category=category,
        latitude=latitude,
        longitude=longitude,
        submitted_by=current_user.id,
    )
    db.add(thomasson)
    db.flush()

    storage = get_storage()
    for i, photo_file in enumerate(photos):
        if photo_file.content_type and photo_file.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"File type {photo_file.content_type} not allowed. Use JPEG, PNG, or WebP.",
            )

        file_key, file_url = storage.upload(photo_file, folder=f"thomassons/{thomasson.id}")
        photo = Photo(
            thomasson_id=thomasson.id,
            file_key=file_key,
            file_url=file_url,
            is_primary=(i == 0),
            order=i,
        )
        db.add(photo)

    db.commit()

    result = (
        db.query(Thomasson)
        .options(
            joinedload(Thomasson.submitter),
            joinedload(Thomasson.reviewer),
            joinedload(Thomasson.photos),
        )
        .filter(Thomasson.id == thomasson.id)
        .first()
    )
    return _thomasson_to_detail(result)


@router.put("/{thomasson_id}", response_model=ThomassonDetail)
def update_thomasson(
    thomasson_id: str,
    data: ThomassonUpdate,
    db: DbSession,
    current_user: CurrentUser,
):
    """Update own submission (only if still pending)."""
    thomasson = (
        db.query(Thomasson)
        .options(
            joinedload(Thomasson.submitter),
            joinedload(Thomasson.reviewer),
            joinedload(Thomasson.photos),
        )
        .filter(Thomasson.id == thomasson_id)
        .first()
    )
    if not thomasson:
        raise HTTPException(status_code=404, detail="Thomasson not found")
    if thomasson.submitted_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not your submission")
    if thomasson.status != ThomassonStatus.PENDING_REVIEW:
        raise HTTPException(status_code=400, detail="Can only edit pending submissions")

    if data.category and data.category not in THOMASSON_CATEGORIES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid category. Must be one of: {', '.join(THOMASSON_CATEGORIES)}",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(thomasson, field, value)

    db.commit()
    db.refresh(thomasson)
    return _thomasson_to_detail(thomasson)


@router.delete("/{thomasson_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_thomasson(
    thomasson_id: str,
    db: DbSession,
    current_user: CurrentUser,
):
    """Delete own submission (only if still pending)."""
    thomasson = (
        db.query(Thomasson)
        .options(joinedload(Thomasson.photos))
        .filter(Thomasson.id == thomasson_id)
        .first()
    )
    if not thomasson:
        raise HTTPException(status_code=404, detail="Thomasson not found")
    if thomasson.submitted_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not your submission")
    if thomasson.status != ThomassonStatus.PENDING_REVIEW:
        raise HTTPException(status_code=400, detail="Can only delete pending submissions")

    storage = get_storage()
    for photo in thomasson.photos:
        try:
            storage.delete(photo.file_key)
        except Exception:
            pass

    db.delete(thomasson)
    db.commit()
