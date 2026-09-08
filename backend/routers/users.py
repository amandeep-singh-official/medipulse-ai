import logging
from fastapi import APIRouter, HTTPException, Header
from config import get_supabase_client

router = APIRouter(prefix="/api/users", tags=["users"])
logger = logging.getLogger(__name__)


def get_user_id(authorization: str) -> str:
    """Validate JWT and return user_id from Supabase."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    token = authorization.split(" ")[1]
    supabase = get_supabase_client()
    try:
        user = supabase.auth.get_user(token)
        if not user or not user.user or not user.user.id:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return user.user.id
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error authenticating token: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.post("/delete-account")
async def delete_account(authorization: str = Header(None)):
    """
    Permanently delete the authenticated user's account.
    Uses Supabase service role admin privileges.
    Foreign key ON DELETE CASCADE automatically deletes associated
    profiles, reports, and biomarker telemetry records.
    """
    user_id = get_user_id(authorization)
    supabase = get_supabase_client()

    try:
        # Admin deletion via Supabase Auth Admin API
        supabase.auth.admin.delete_user(user_id)
        return {
            "status": "deleted",
            "message": "User account and all associated telemetry records purged successfully."
        }
    except Exception as e:
        logger.error(f"Failed to delete user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete account. Please try again later.")
