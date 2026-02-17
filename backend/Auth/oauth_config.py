"""
OAuth configuration and setup for Google authentication.
"""

import os
from authlib.integrations.starlette_client import OAuth
from cryptography.fernet import Fernet
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Environment variables
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000").rstrip("/")
FERNET_KEY = os.getenv("FERNET_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")

# Validate required environment variables
if not all([GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FERNET_KEY]):
    raise ValueError("Missing required auth environment variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FERNET_KEY")

# Initialize Fernet encryption
fernet = Fernet(FERNET_KEY.encode())

# Initialize OAuth
oauth = OAuth()

# Register Google OAuth provider with hardcoded endpoints (faster than metadata fetch)
oauth.register(
    name="google",
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    authorize_url="https://accounts.google.com/o/oauth2/v2/auth",
    access_token_url="https://oauth2.googleapis.com/token",
    api_base_url="https://www.googleapis.com/",
    jwks_uri="https://www.googleapis.com/oauth2/v3/certs",
    client_kwargs={
        "scope": "openid email profile https://www.googleapis.com/auth/gmail.send",
    },
)
