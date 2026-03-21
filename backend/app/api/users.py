from fastapi import APIRouter

from app.core.deps import CurrentUser
from app.schemas.user import UserResponse

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: CurrentUser):
    """Alias for /api/auth/me - get current user profile."""
    return current_user
