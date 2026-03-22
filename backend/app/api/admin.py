from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy.orm import joinedload

from app.core.deps import DbSession, ModeratorUser, AdminUser
from app.models.thomasson import Thomasson, ThomassonStatus, THOMASSON_CATEGORIES
from app.models.user import User, UserRole
from app.schemas.thomasson import (
    ThomassonDetail,
    AdminSubmissionUpdate,
    ReviewAction,
    PhotoResponse,
)
from app.schemas.user import UserListResponse, UserRoleUpdate

router = APIRouter(prefix="/api/admin", tags=["admin"])


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
        discovery_date=t.discovery_date,
        created_at=t.created_at,
        updated_at=t.updated_at,
    )


@router.get("/submissions", response_model=List[ThomassonDetail])
def list_submissions(
    db: DbSession,
    moderator: ModeratorUser,
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """List submissions for review (moderator+)."""
    query = (
        db.query(Thomasson)
        .options(
            joinedload(Thomasson.submitter),
            joinedload(Thomasson.reviewer),
            joinedload(Thomasson.photos),
        )
    )

    if status_filter:
        try:
            ts = ThomassonStatus(status_filter)
            query = query.filter(Thomasson.status == ts)
        except ValueError:
            pass
    else:
        query = query.filter(Thomasson.status == ThomassonStatus.PENDING_REVIEW)

    thomassons = (
        query.order_by(Thomasson.created_at.asc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [_thomasson_to_detail(t) for t in thomassons]


@router.get("/submissions/{thomasson_id}", response_model=ThomassonDetail)
def get_submission(
    thomasson_id: str,
    db: DbSession,
    moderator: ModeratorUser,
):
    """View a specific submission (moderator+)."""
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
        raise HTTPException(status_code=404, detail="Submission not found")
    return _thomasson_to_detail(thomasson)


@router.put("/submissions/{thomasson_id}", response_model=ThomassonDetail)
def update_submission(
    thomasson_id: str,
    data: AdminSubmissionUpdate,
    db: DbSession,
    moderator: ModeratorUser,
):
    """Edit submission fields (moderator+)."""
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
        raise HTTPException(status_code=404, detail="Submission not found")

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


@router.post("/submissions/{thomasson_id}/approve", response_model=ThomassonDetail)
def approve_submission(
    thomasson_id: str,
    db: DbSession,
    moderator: ModeratorUser,
    body: Optional[ReviewAction] = None,
):
    """Approve a submission (moderator+)."""
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
        raise HTTPException(status_code=404, detail="Submission not found")
    if thomasson.status != ThomassonStatus.PENDING_REVIEW:
        raise HTTPException(status_code=400, detail="Submission is not pending review")

    thomasson.status = ThomassonStatus.APPROVED
    thomasson.reviewed_by = moderator.id
    thomasson.review_note = body.note if body else None
    thomasson.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(thomasson)
    return _thomasson_to_detail(thomasson)


@router.post("/submissions/{thomasson_id}/reject", response_model=ThomassonDetail)
def reject_submission(
    thomasson_id: str,
    body: ReviewAction,
    db: DbSession,
    moderator: ModeratorUser,
):
    """Reject a submission with optional note (moderator+)."""
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
        raise HTTPException(status_code=404, detail="Submission not found")
    if thomasson.status != ThomassonStatus.PENDING_REVIEW:
        raise HTTPException(status_code=400, detail="Submission is not pending review")

    thomasson.status = ThomassonStatus.REJECTED
    thomasson.reviewed_by = moderator.id
    thomasson.review_note = body.note
    thomasson.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(thomasson)
    return _thomasson_to_detail(thomasson)


@router.delete("/submissions/{thomasson_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_submission(
    thomasson_id: str,
    db: DbSession,
    admin: AdminUser,
):
    """Permanently delete a submission and its photos (admin only)."""
    thomasson = (
        db.query(Thomasson)
        .options(joinedload(Thomasson.photos))
        .filter(Thomasson.id == thomasson_id)
        .first()
    )
    if not thomasson:
        raise HTTPException(status_code=404, detail="Submission not found")

    for photo in thomasson.photos:
        db.delete(photo)
    db.delete(thomasson)
    db.commit()
    return None


@router.get("/users", response_model=List[UserListResponse])
def list_users(
    db: DbSession,
    admin: AdminUser,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """List all users (admin only)."""
    users = (
        db.query(User)
        .order_by(User.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return users


@router.put("/users/{user_id}/role", response_model=UserListResponse)
def update_user_role(
    user_id: str,
    data: UserRoleUpdate,
    db: DbSession,
    admin: AdminUser,
):
    """Change a user's role (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")

    user.role = data.role
    db.commit()
    db.refresh(user)
    return user
