"""
Model module for AI email generation, embeddings, and RAG functionality.
"""

from .routes import router
from .embeddings import generate_embedding, get_openai_client, openai_client
from .rag_service import get_rag_context, get_supabase_client, supabase
from .email_generator import (
    EMAIL_SYSTEM_PROMPT,
    generate_email_html,
    img_to_base64,
    extract_subject_from_html,
    clean_html_content
)

__all__ = [
    "router",
    "generate_embedding",
    "get_openai_client",
    "openai_client",
    "get_rag_context",
    "get_supabase_client",
    "supabase",
    "EMAIL_SYSTEM_PROMPT",
    "generate_email_html",
    "img_to_base64",
    "extract_subject_from_html",
    "clean_html_content",
]
