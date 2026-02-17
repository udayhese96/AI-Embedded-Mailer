"""
Pydantic schemas for email template operations (RAG).
"""

from typing import Optional, List, Any
from pydantic import BaseModel, Field
from datetime import datetime


class TemplateSaveRequest(BaseModel):
    """Request model for saving email template"""
    subject: str = Field(..., description="Email subject line")
    description: str = Field(..., description="Template description")
    template_code: str = Field(..., description="HTML template code")
    
    class Config:
        json_schema_extra = {
            "example": {
                "subject": "🎉 Welcome Email",
                "description": "Welcome email for new users with company introduction",
                "template_code": "<html>...</html>"
            }
        }


class TemplateSearchRequest(BaseModel):
    """Request model for searching templates"""
    query: str = Field(..., description="Search query")
    limit: int = Field(5, ge=1, le=20, description="Number of results to return")
    use_hybrid: bool = Field(True, description="Use hybrid search (keyword + semantic)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "promotional sale email",
                "limit": 3,
                "use_hybrid": True
            }
        }


class TemplateResponse(BaseModel):
    """Response model for single template"""
    id: str
    subject: str
    description: str
    template_code: Optional[str] = None
    created_at: Optional[datetime] = None
    similarity: Optional[float] = Field(None, description="Similarity score (for search results)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "subject": "🎉 Welcome Email",
                "description": "Welcome email for new users",
                "created_at": "2024-02-17T11:00:00Z",
                "similarity": 0.85
            }
        }


class TemplateListResponse(BaseModel):
    """Response model for template list/search"""
    success: bool
    count: int
    templates: List[Any]  # Can be dict or TemplateResponse
    query: Optional[str] = None
    search_type: Optional[str] = None
