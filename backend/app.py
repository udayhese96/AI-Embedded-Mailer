import os
import base64
import httpx
import uuid
from fastapi import FastAPI, Request, HTTPException, Form
from fastapi.responses import RedirectResponse, JSONResponse, HTMLResponse
from authlib.integrations.starlette_client import OAuth
from dotenv import load_dotenv
from email.mime.text import MIMEText
from cryptography.fernet import Fernet
from starlette.middleware.sessions import SessionMiddleware

# ------------------ LOAD ENVIRONMENT VARIABLES ---------------------
load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000").rstrip("/")
FERNET_KEY = os.getenv("FERNET_KEY")
SESSION_SECRET = os.getenv("SESSION_SECRET")

if not all([GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET, FERNET_KEY]):
    raise ValueError("Missing required environment variables in .env file")

fernet = Fernet(FERNET_KEY.encode())

from fastapi.middleware.cors import CORSMiddleware

# ------------------ APP INITIALIZATION ----------------------------
app = FastAPI(title="Gmail OAuth Sender")

# 1. CORS Middleware (CRITICAL for frontend communication)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
)

# 2. Session Middleware (Required for OAuth)
app.add_middleware(SessionMiddleware, secret_key=SESSION_SECRET)

# ------------------ OAUTH CONFIG -----------------------------------
oauth = OAuth()

# Hardcoding endpoints to avoid slow metadata fetch
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

# ------------------ STORAGE (Use Database in Production!) -----------------
# Key: session_id -> Value: { "email": str, "token": encrypted_str }
USER_SESSIONS = {}

# ==================================================================
# 1️⃣ CONNECT GOOGLE – START OAUTH LOGIN
# ==================================================================
@app.get("/connect/google")
async def connect_google(request: Request):
    """Initiates OAuth flow - redirects user to Google login"""
    redirect_uri = f"{BASE_URL}/auth/google/callback"
    print(f"DEBUG: Redirecting to Google with redirect_uri={redirect_uri}")
    
    return await oauth.google.authorize_redirect(
        request, 
        redirect_uri, 
        access_type="offline", 
        prompt="consent"
    )


# ==================================================================
# 2️⃣ GOOGLE CALLBACK – CREATE SESSION
# ==================================================================
@app.get("/auth/google/callback")
async def google_callback(request: Request):
    """Callback from Google - Exchanges code for tokens and creates session"""
    try:
        # 1. Exchange auth code for token
        token = await oauth.google.authorize_access_token(request)
        
        # 2. Get user info (email)
        user_info = token.get("userinfo")
        if not user_info:
            resp = await oauth.google.get("https://www.googleapis.com/oauth2/v1/userinfo", token=token)
            user_info = resp.json()
            
        email = user_info.get("email")
        if not email:
             raise HTTPException(400, "Could not retrieve user email from Google")

        # 3. Extract Refresh Token
        refresh_token = token.get("refresh_token")
        
        # In a real DB, you'd update existing user if email matches.
        # Here we just create a new session ID for every login.
        session_id = str(uuid.uuid4())
        
        # Encrypt token if present
        encrypted_token = None
        if refresh_token:
            encrypted_token = fernet.encrypt(refresh_token.encode()).decode()
        
        # Look for existing token if not provided (re-login without consent prompt)
        if not encrypted_token:
            # Try to find any existing session for this email (inefficient scan for demo)
            for sid, data in USER_SESSIONS.items():
                if data["email"] == email and data.get("token"):
                    encrypted_token = data["token"]
                    break
        
        if not encrypted_token:
             print("WARNING: No refresh token available. Offline access will fail.")

        # Store Session
        USER_SESSIONS[session_id] = {
            "email": email,
            "token": encrypted_token
        }
        
        print(f"SUCCESS: Created session {session_id} for {email}")

        # Redirect back to frontend with SESSION ID (Not email)
        frontend_url = f"http://localhost:3000/settings?connected=true&session_id={session_id}"
        return RedirectResponse(url=frontend_url)
        
    except Exception as e:
        print(f"CALLBACK ERROR: {str(e)}")
        return JSONResponse({"error": str(e), "details": "Check server logs for more info"}, status_code=500)


# ==================================================================
# 3️⃣ SEND EMAIL (Protected by Session ID)
# ==================================================================
@app.post("/send-email")
async def send_email(
    session_id: str = Form(..., description="The secure session ID"),
    to: str = Form(..., description="Recipient email address"),
    subject: str = Form(..., description="Email subject"),
    html_body: str = Form(..., description="HTML email body"),
    cc: str = Form(None, description="Comma-separated list of CC emails")
):
    """Sends an email using the session's credentials"""
    
    # Validate Session
    if session_id not in USER_SESSIONS:
        raise HTTPException(401, "Invalid or expired session. Please log in again.")
    
    user_data = USER_SESSIONS[session_id]
    email = user_data["email"]
    encrypted_token = user_data.get("token")
    
    if not encrypted_token:
        raise HTTPException(400, "No refresh token found for this session. Please reconnect with Google.")
    
    # Decrypt refresh token
    try:
        refresh_token = fernet.decrypt(encrypted_token.encode()).decode()
    except Exception:
        raise HTTPException(500, "Failed to decrypt token. Storage might be corrupted.")
    
    # Get fresh access token
    access_token = None
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
                raise HTTPException(500, f"Failed to refresh token: {data.get('error_description')}")
            
            access_token = data.get("access_token")
    
    except Exception as e:
        raise HTTPException(500, f"Token refresh failed: {str(e)}")
    
    # Build MIME email
    msg = MIMEText(html_body, "html")
    msg["To"] = to
    msg["From"] = email
    msg["Subject"] = subject
    
    if cc:
        msg["Cc"] = cc
    
    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    
    # Send email via Gmail API
    try:
        async with httpx.AsyncClient() as client:
            send_response = await client.post(
                "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
                headers={"Authorization": f"Bearer {access_token}"},
                json={"raw": raw},
            )
            
            if send_response.status_code != 200:
                raise HTTPException(500, f"Failed to send email: {send_response.text}")
            
            return {
                "status": "sent",
                "message": f"Email sent successfully to {to}",
                "from": email
            }
    
    except Exception as e:
        raise HTTPException(500, f"Email sending failed: {str(e)}")


# ==================================================================
# 4️⃣ CHECK CONNECTION STATUS
# ==================================================================
@app.get("/check-connection/{session_id}")
async def check_connection(session_id: str):
    """Check if a session is valid"""
    if session_id in USER_SESSIONS:
        return {
            "is_connected": True,
            "email": USER_SESSIONS[session_id]["email"]
        }
    return {"is_connected": False}


# ==================================================================
# 5️⃣ DISCONNECT SESSION
# ==================================================================
@app.post("/disconnect/{session_id}")
async def disconnect_user(session_id: str):
    """Invalidate session"""
    if session_id in USER_SESSIONS:
        del USER_SESSIONS[session_id]
        return {"status": "disconnected"}
    raise HTTPException(404, "Session not found")


# ==================================================================
# ROOT ENDPOINT
# ==================================================================
@app.get("/")
async def root():
    return {
        "service": "Gmail OAuth Email Sender (Secure Session Mode)",
        "endpoints": {
            "connect": "/connect/google",
            "send": "/send-email",
            "check": "/check-connection/{session_id}",
            "disconnect": "/disconnect/{session_id}"
        }
    }
