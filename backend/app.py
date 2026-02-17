"""
Gmail OAuth Email Sender & AI Email Generator with RAG

A modular FastAPI application for:
- Google OAuth authentication
- Email sending via Gmail API
- AI-powered email template generation
- RAG-based template search and management
- Image upload to Supabase
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv

# Import routers from organized modules
from Auth.routes import router as auth_router
from model.routes import router as model_router
from model.rag_service import supabase
from model.embeddings import openai_client

# Load environment variables
load_dotenv()

SESSION_SECRET = os.getenv("SESSION_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")

if not SESSION_SECRET:
    raise ValueError("Missing required environment variable: SESSION_SECRET")

# ==================================================================
# APP INITIALIZATION
# ==================================================================
app = FastAPI(
    title="Gmail OAuth Sender & AI Email Generator",
    description="AI-powered email generation with RAG and Google OAuth",
    version="2.0.0"
)

# ==================================================================
# MIDDLEWARE CONFIGURATION
# ==================================================================

# 1. CORS Middleware (CRITICAL for frontend communication)
print(f"🔧 CORS Configuration:")
print(f"   FRONTEND_URL: {FRONTEND_URL}")
print(f"   Allowed Origins: {[FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000']}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Session Middleware (Required for OAuth)
# Configure with proper cookie settings for OAuth to work across different ports
app.add_middleware(
    SessionMiddleware, 
    secret_key=SESSION_SECRET,
    session_cookie="session",  # Cookie name
    max_age=14 * 24 * 60 * 60,  # 14 days
    same_site="lax",  # Allow cookies on redirects (critical for OAuth)
    https_only=False  # Set to True in production with HTTPS
)

# ==================================================================
# ROUTER REGISTRATION
# ==================================================================

# Auth routes: /connect/google, /auth/google/callback, /send-email, /check-connection, /disconnect
app.include_router(auth_router, tags=["Authentication & Email Sending"])

# Model routes: AI generation, RAG templates, image management
app.include_router(model_router, tags=["AI & RAG"])

# ==================================================================
# ROOT ENDPOINT
# ==================================================================
@app.get("/")
async def root():
    """API information and available endpoints"""
    return {
        "service": "Gmail OAuth Email Sender & AI Email Generator with RAG",
        "version": "2.0.0",
        "endpoints": {
            "authentication": {
                "connect": "/connect/google",
                "callback": "/auth/google/callback",
                "check": "/check-connection/{session_id}",
                "disconnect": "/disconnect/{session_id}",
            },
            "email": {
                "send": "/send-email (POST)",
                "generate": "/generate-email (POST - basic generation)",
                "generate_rag": "/generate-email-rag (POST - with RAG context)",
            },
            "templates": {
                "save": "/save-template (POST)",
                "search": "/search-templates (POST - hybrid search)",
                "list": "/list-templates (GET)",
                "get": "/get-template/{id} (GET)",
                "delete": "/delete-template/{id} (DELETE)",
                "generate_embeddings": "/generate-embeddings (POST)",
            },
            "images": {
                "upload": "/upload-image (POST)",
                "list": "/list-images (GET)",
                "delete": "/delete-image/{filename} (DELETE)",
            }
        },
        "features": {
            "supabase_configured": supabase is not None,
            "rag_enabled": supabase is not None and openai_client is not None,
            "ai_enabled": openai_client is not None,
        },
        "documentation": "/docs"
    }


# ==================================================================
# HEALTH CHECK
# ==================================================================
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "supabase": "connected" if supabase else "not configured",
        "openai": "connected" if openai_client else "not configured"
    }
