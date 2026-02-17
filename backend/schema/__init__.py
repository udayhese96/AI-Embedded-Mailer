"""
Schema module for Pydantic models.
Contains request/response models for email, template, and auth operations.
"""

from .email import (
    EmailGenerationRequest,
    EmailGenerationResponse,
    SendEmailRequest,
    SendEmailResponse
)
from .template import (
    TemplateSaveRequest,
    TemplateSearchRequest,
    TemplateResponse,
    TemplateListResponse
)
from .auth import (
    ConnectionStatus,
    SessionInfo,
    DisconnectResponse
)

__all__ = [
    # Email schemas
    "EmailGenerationRequest",
    "EmailGenerationResponse",
    "SendEmailRequest",
    "SendEmailResponse",
    
    # Template schemas
    "TemplateSaveRequest",
    "TemplateSearchRequest",
    "TemplateResponse",
    "TemplateListResponse",
    
    # Auth schemas
    "ConnectionStatus",
    "SessionInfo",
    "DisconnectResponse",
]
