"""
Pydantic schemas for authentication and session management.
"""

from typing import Optional
from pydantic import BaseModel, Field, EmailStr


class SessionInfo(BaseModel):
    """Model for user session information"""
    email: EmailStr
    token: Optional[str] = Field(None, description="Encrypted refresh token")


class ConnectionStatus(BaseModel):
    """Response model for connection status check"""
    is_connected: bool
    email: Optional[EmailStr] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "is_connected": True,
                "email": "user@example.com"
            }
        }


class DisconnectResponse(BaseModel):
    """Response model for disconnect operation"""
    status: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "disconnected"
            }
        }
