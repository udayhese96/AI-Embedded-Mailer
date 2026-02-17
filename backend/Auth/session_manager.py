"""
Session management for user authentication.
Handles session storage, token encryption, and refresh operations.
"""

import uuid
import httpx
from typing import Dict, Optional
from fastapi import HTTPException

from .oauth_config import fernet, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# In-memory session storage
# Key: session_id -> Value: { "email": str, "token": encrypted_str }
# TODO: Replace with database in production
USER_SESSIONS: Dict[str, Dict[str, str]] = {}


def create_session(email: str, refresh_token: Optional[str] = None) -> str:
    """
    Create a new user session.
    
    Args:
        email: User's email address
        refresh_token: OAuth refresh token (if available)
        
    Returns:
        session_id: Unique session identifier
    """
    session_id = str(uuid.uuid4())
    
    # Encrypt token if provided
    encrypted_token = None
    if refresh_token:
        encrypted_token = fernet.encrypt(refresh_token.encode()).decode()
    
    # Store session
    USER_SESSIONS[session_id] = {
        "email": email,
        "token": encrypted_token
    }
    
    print(f"✅ Created session {session_id} for {email}")
    return session_id


def get_session(session_id: str) -> Optional[Dict[str, str]]:
    """
    Get session data by session ID.
    
    Args:
        session_id: Session identifier
        
    Returns:
        Session data or None if not found
    """
    return USER_SESSIONS.get(session_id)


def delete_session(session_id: str) -> bool:
    """
    Delete a user session.
    
    Args:
        session_id: Session identifier
        
    Returns:
        True if deleted, False if not found
    """
    if session_id in USER_SESSIONS:
        del USER_SESSIONS[session_id]
        print(f"🗑️ Deleted session {session_id}")
        return True
    return False


def find_session_by_email(email: str) -> Optional[str]:
    """
    Find an existing session token by email.
    Useful for re-login without consent prompt.
    
    Args:
        email: User's email address
        
    Returns:
        Encrypted token if found, None otherwise
    """
    for sid, data in USER_SESSIONS.items():
        if data["email"] == email and data.get("token"):
            return data["token"]
    return None


def decrypt_token(encrypted_token: str) -> str:
    """
    Decrypt an encrypted refresh token.
    
    Args:
        encrypted_token: Encrypted token string
        
    Returns:
        Decrypted token
        
    Raises:
        HTTPException: If decryption fails
    """
    try:
        return fernet.decrypt(encrypted_token.encode()).decode()
    except Exception as e:
        raise HTTPException(500, f"Failed to decrypt token: {str(e)}")


async def refresh_access_token(refresh_token: str) -> str:
    """
    Get a fresh access token from a refresh token.
    
    Args:
        refresh_token: OAuth refresh token
        
    Returns:
        Fresh access token
        
    Raises:
        HTTPException: If token refresh fails
    """
    try:
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "refresh_token": refresh_token,
                    "grant_type": "refresh_token",
                }
            )
            
            data = token_response.json()
            if token_response.status_code != 200:
                error_msg = data.get('error_description', 'Unknown error')
                raise HTTPException(500, f"Failed to refresh token: {error_msg}")
            
            access_token = data.get("access_token")
            if not access_token:
                raise HTTPException(500, "No access token in refresh response")
                
            return access_token
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Token refresh failed: {str(e)}")
