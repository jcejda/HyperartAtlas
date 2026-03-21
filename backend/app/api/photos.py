from fastapi import APIRouter, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.deps import DbSession, CurrentUser
from app.models.thomasson import Thomasson, ThomassonStatus, Photo
from app.services.storage import get_storage

router = APIRouter(prefix="/api/photos", tags=["photos"])


@router.delete("/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_photo(
    photo_id: str,
    db: DbSession,
    current_user: CurrentUser,
):
    """Delete a photo from own pending submission."""
    photo = (
        db.query(Photo)
        .options(joinedload(Photo.thomasson))
        .filter(Photo.id == photo_id)
        .first()
    )
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    thomasson = photo.thomasson
    if thomasson.submitted_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not your submission")
    if thomasson.status != ThomassonStatus.PENDING_REVIEW:
        raise HTTPException(status_code=400, detail="Can only edit pending submissions")

    storage = get_storage()
    try:
        storage.delete(photo.file_key)
    except Exception:
        pass

    was_primary = photo.is_primary
    db.delete(photo)
    db.flush()

    if was_primary:
        remaining = (
            db.query(Photo)
            .filter(Photo.thomasson_id == thomasson.id)
            .order_by(Photo.order)
            .first()
        )
        if remaining:
            remaining.is_primary = True

    db.commit()
