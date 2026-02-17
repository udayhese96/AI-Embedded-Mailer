"""
Auth module for Google OAuth authentication and session management.
"""

from .routes import router
from .oauth_config import oauth, fernet, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BASE_URL, FRONTEND_URL
from .session_manager import (
    USER_SESSIONS,
    create_session,
    get_session,
    delete_session,
    decrypt_token,
    refresh_access_token
)

__all__ = [
    "router",
    "oauth",
    "fernet",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "BASE_URL",
    "FRONTEND_URL",
    "USER_SESSIONS",
    "create_session",
    "get_session",
    "delete_session",
    "decrypt_token",
    "refresh_access_token",
]
