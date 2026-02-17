"""
Pydantic schemas for email generation and sending operations.
"""

from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr


class EmailGenerationRequest(BaseModel):
    """Request model for AI email generation"""
    prompt: str = Field(..., description="Email intent/description")
    history: Optional[str] = Field(None, description="JSON array of conversation history")
    current_html: Optional[str] = Field(None, description="Current template HTML for modifications")
    use_rag: bool = Field(True, description="Enable RAG context from similar templates")
    
    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "Create a promotional email for 50% off sale",
                "use_rag": True
            }
        }


class EmailGenerationResponse(BaseModel):
    """Response model for AI email generation"""
    success: bool
    html: str
    subject: Optional[str] = None
    changes: Optional[str] = Field(None, description="Summary of changes made (for modifications)")
    model: str
    rag_enabled: Optional[bool] = None
    images_used: int = 0


class SendEmailRequest(BaseModel):
    """Request model for sending email"""
    session_id: str = Field(..., description="The secure session ID")
    to: EmailStr = Field(..., description="Recipient email address")
    subject: str = Field(..., description="Email subject")
    html_body: str = Field(..., description="HTML email body")
    cc: Optional[str] = Field(None, description="Comma-separated list of CC emails")
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "abc-123-def-456",
                "to": "recipient@example.com",
                "subject": "🎉 Special Offer",
                "html_body": "<html><body>...</body></html>",
                "cc": "manager@example.com"
            }
        }


class SendEmailResponse(BaseModel):
    """Response model for email sending"""
    status: str
    message: str
    from_email: str = Field(..., alias="from")
    
    class Config:
        populate_by_name = True
