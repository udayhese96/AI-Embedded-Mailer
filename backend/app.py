import os
import re
import base64
import httpx
import uuid
from typing import List, Optional, Dict
from fastapi import FastAPI, Request, HTTPException, Form, UploadFile, File
from fastapi.responses import RedirectResponse, JSONResponse, HTMLResponse
from authlib.integrations.starlette_client import OAuth
from dotenv import load_dotenv
from email.mime.text import MIMEText
from cryptography.fernet import Fernet
from starlette.middleware.sessions import SessionMiddleware
from openai import OpenAI
from supabase import create_client, Client

# ------------------ LOAD ENVIRONMENT VARIABLES ---------------------
load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000").rstrip("/")
FERNET_KEY = os.getenv("FERNET_KEY")
SESSION_SECRET = os.getenv("SESSION_SECRET")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "email-images")

if not all([GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET, FERNET_KEY]):
    raise ValueError("Missing required environment variables in .env file")

fernet = Fernet(FERNET_KEY.encode())

# Initialize OpenRouter client (for AI email generation)
openrouter_client = None
if OPENROUTER_API_KEY:
    # Show first/last 4 chars for debugging (hide the rest)
    key_preview = f"{OPENROUTER_API_KEY[:12]}...{OPENROUTER_API_KEY[-4:]}" if len(OPENROUTER_API_KEY) > 16 else "KEY_TOO_SHORT"
    print(f"🔑 OpenRouter API Key loaded: {key_preview}")
    openrouter_client = OpenAI(
        api_key=OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1"
    )
else:
    print("❌ OPENROUTER_API_KEY not found in .env file!")

# Initialize Supabase client (for image storage)
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print(f"✅ Supabase connected to bucket: {SUPABASE_BUCKET}")
else:
    print("⚠️ Supabase not configured. Image upload will be disabled.")

from fastapi.middleware.cors import CORSMiddleware

# ------------------ APP INITIALIZATION ----------------------------
app = FastAPI(title="Gmail OAuth Sender & AI Email Generator")

# 1. CORS Middleware (CRITICAL for frontend communication)
# Get frontend URL from environment variable and strip trailing slash
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")

# Debug: Print CORS configuration
print(f"🔧 CORS Configuration:")
print(f"   FRONTEND_URL: {FRONTEND_URL}")
print(f"   Allowed Origins: {[FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000']}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],  # Support env + local dev
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
# 6️⃣ SUPABASE IMAGE UPLOAD
# ==================================================================
@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """
    Upload an image to Supabase Storage and return the public URL.
    This URL can be used in email templates.
    """
    if not supabase:
        raise HTTPException(
            500, 
            "Supabase not configured. Please add SUPABASE_URL and SUPABASE_KEY to your .env file."
        )
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(400, f"Invalid file type. Allowed: {', '.join(allowed_types)}")
    
    # Generate unique filename
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'png'
    filename = f"{uuid.uuid4()}.{ext}"
    
    try:
        # Read file content
        content = await file.read()
        
        # Check file size (limit to 2MB for faster uploads)
        file_size_mb = len(content) / (1024 * 1024)
        if file_size_mb > 2:
            raise HTTPException(400, f"File too large ({file_size_mb:.1f}MB). Maximum size is 2MB for faster uploads.")
        
        print(f"📤 Uploading {filename} ({file_size_mb:.2f}MB)...")
        
        # Upload to Supabase Storage
        result = supabase.storage.from_(SUPABASE_BUCKET).upload(
            path=filename,
            file=content,
            file_options={"content-type": file.content_type}
        )
        
        # Get public URL
        public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(filename)
        
        print(f"✅ Image uploaded: {filename} -> {public_url}")
        
        return {
            "success": True,
            "url": public_url,
            "filename": filename
        }
        
    except Exception as e:
        print(f"❌ Upload failed: {str(e)}")
        raise HTTPException(500, f"Failed to upload image: {str(e)}")


@app.get("/list-images")
async def list_images():
    """List all uploaded images from Supabase Storage"""
    if not supabase:
        raise HTTPException(500, "Supabase not configured")
    
    try:
        files = supabase.storage.from_(SUPABASE_BUCKET).list()
        
        images = []
        for f in files:
            if f.get("name"):
                url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(f["name"])
                images.append({
                    "name": f["name"],
                    "url": url,
                    "created_at": f.get("created_at")
                })
        
        return {"images": images}
        
    except Exception as e:
        raise HTTPException(500, f"Failed to list images: {str(e)}")


@app.delete("/delete-image/{filename}")
async def delete_image(filename: str):
    """Delete an image from Supabase Storage"""
    if not supabase:
        raise HTTPException(500, "Supabase not configured")
    
    try:
        result = supabase.storage.from_(SUPABASE_BUCKET).remove([filename])
        print(f"🗑️ Image deleted: {filename}")
        return {"success": True, "deleted": filename}
        
    except Exception as e:
        print(f"❌ Delete failed: {str(e)}")
        raise HTTPException(500, f"Failed to delete image: {str(e)}")


# ==================================================================
# 7️⃣ AI EMAIL GENERATION (Claude 3.5 Haiku via OpenRouter)
# ==================================================================

# System prompt for email HTML generation (STRICT - HTML ONLY)
EMAIL_SYSTEM_PROMPT = """You are an expert HTML email template generator for production use.

STRICT RULES (DO NOT BREAK):
- Output ONLY valid HTML (no markdown, no explanation, no text before or after)
- Use table-based layout ONLY
- Max email width: 600px
- Inline CSS ONLY (style attributes on elements)
- No <style> tags, no <script>, no external CSS
- Gmail, Outlook, Yahoo compatible
- Mobile & desktop responsive
- Start output with <!DOCTYPE html> or <html>
- End output with </html>

SUBJECT LINE GENERATION (NEW):
- BEFORE the HTML, output a subject line as an HTML comment
- Format: <!-- SUBJECT: Your Generated Subject Line -->
- Subject should be SHORT (max 60 chars), IMPACTFUL, and relevant to the email content
- Use emojis when appropriate (🎉 for welcome, 🔥 for sales, 📅 for events)
- Example: <!-- SUBJECT: 🔥 IPL Match: Mumbai vs Pune - Book Now! -->

IMAGE RULES (CRITICAL):
- If user provides actual URLs (starting with http:// or https://), USE THEM DIRECTLY in <img src="">
- Look for URL patterns like @https:// or just https:// in the user's prompt
- DO NOT use source.unsplash.com - it is deprecated and broken
- DO NOT use Wikipedia/Wikimedia URLs - they block hotlinking
- DO NOT invent random image URLs
- If no URL is provided, use PLACEHOLDER format: {{IMAGE_HERO}}, {{IMAGE_1}}, etc.

IMAGE IMPLEMENTATION:
- All images must have: width="600" style="display:block;max-width:100%;height:auto;"
- For logos/small images: use appropriate width like width="150" or width="200"
- Wrap images in <td align="center">
- Always include descriptive alt text for accessibility

MODIFICATION REQUESTS:
- If the user says "fix", "change", "update", "modify", "where is", "I cannot see", etc. AND provides existing HTML context, MODIFY the existing template
- Keep the overall structure but apply the requested changes
- If a specific image is not showing, check the URL and ensure it's correctly placed in an <img src=""> tag

VISUAL ENHANCEMENTS:
- Use Unicode emojis (🎉 🔥 ⭐ 🚀 ✨ 💡) for visual interest
- Use colored backgrounds for sections
- Use bold typography for headers
- Create visually appealing layouts with good spacing

Failure to follow these rules is an error. Output the subject comment FIRST, then the HTML code."""


def img_to_base64(file: UploadFile) -> str:
    """Convert uploaded file to base64 string"""
    content = file.file.read()
    file.file.seek(0)  # Reset file pointer for potential re-use
    return base64.b64encode(content).decode("utf-8")


@app.post("/generate-email")
async def generate_email(
    prompt: str = Form(..., description="Email intent/description"),
    images: List[UploadFile] = File(default=[])
):
    """
    Generate email-safe HTML using Claude 3.5 Haiku via OpenRouter.
    Supports up to 4 images for design reference.
    """
    
    # Check if OpenRouter is configured
    if not openrouter_client:
        raise HTTPException(
            500, 
            "OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your .env file."
        )
    
    # Validate image count
    if len(images) > 4:
        raise HTTPException(400, "Maximum 4 images allowed")
    
    # Build message content
    content = [{"type": "text", "text": prompt}]
    
    # Add images to content if provided
    for img in images:
        if img.filename:  # Check if file was actually uploaded
            content_type = img.content_type or "image/png"
            base64_data = img_to_base64(img)
            content.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:{content_type};base64,{base64_data}"
                }
            })
    
    try:
        # Call Claude 3.5 Haiku via OpenRouter
        response = openrouter_client.chat.completions.create(
            model="google/gemma-3-27b-it:free",  # Google Gemma 3 27B - FREE!
            messages=[
                {
                    "role": "system",
                    "content": EMAIL_SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": content
                }
            ],
            temperature=0.3,
            max_tokens=4000  # Increased for modification requests with existing HTML
        )
        
        html_content = response.choices[0].message.content
        
        # Extract subject line from HTML comment (if present)
        subject_line = None
        subject_match = re.search(r'<!--\s*SUBJECT:\s*(.+?)\s*-->', html_content, re.IGNORECASE)
        if subject_match:
            subject_line = subject_match.group(1).strip()
            # Remove the subject comment from HTML
            html_content = re.sub(r'<!--\s*SUBJECT:.+?-->\s*', '', html_content, flags=re.IGNORECASE)
        
        # Clean up the HTML (remove markdown code blocks if present)
        if html_content.startswith("```html"):
            html_content = html_content[7:]
        elif html_content.startswith("```"):
            html_content = html_content[3:]
        if html_content.endswith("```"):
            html_content = html_content[:-3]
        html_content = html_content.strip()
        
        # Validate that output is actually HTML
        html_lower = html_content.lower()
        if not ("<html" in html_lower or "<!doctype" in html_lower or "<table" in html_lower):
            # If AI didn't return HTML, try to extract it
            if "<table" in html_lower:
                # Find the table-based content
                start_idx = html_content.lower().find("<table")
                end_idx = html_content.lower().rfind("</table>") + 8
                if start_idx != -1 and end_idx > start_idx:
                    html_content = html_content[start_idx:end_idx]
            else:
                raise HTTPException(400, "AI did not generate valid HTML. Please try again with a more specific prompt.")
        
        # Remove any text before <!DOCTYPE or <html
        if "<!doctype" in html_lower:
            idx = html_lower.find("<!doctype")
            html_content = html_content[idx:]
        elif "<html" in html_lower:
            idx = html_lower.find("<html")
            html_content = html_content[idx:]
        
        # Make all links open in new tab by adding target="_blank" and rel="noopener noreferrer"
        import re
        # Replace <a> tags that don't have target attribute
        html_content = re.sub(
            r'<a\s+([^>]*?)href=',
            lambda m: '<a ' + m.group(1) + 'target="_blank" rel="noopener noreferrer" href=' 
                if 'target=' not in m.group(0).lower() else m.group(0),
            html_content,
            flags=re.IGNORECASE
        )
        
        return {
            "success": True,
            "html": html_content,
            "subject": subject_line,  # NEW: Return extracted subject
            "model": "anthropic/claude-3.5-haiku",
            "images_used": len([img for img in images if img.filename])
        }
        
    except Exception as e:
        print(f"OpenRouter API Error: {str(e)}")
        raise HTTPException(500, f"Failed to generate email: {str(e)}")


# ==================================================================
# ROOT ENDPOINT
# ==================================================================
@app.get("/")
async def root():
    return {
        "service": "Gmail OAuth Email Sender & AI Email Generator",
        "endpoints": {
            "connect": "/connect/google",
            "send": "/send-email",
            "check": "/check-connection/{session_id}",
            "disconnect": "/disconnect/{session_id}",
            "generate_email": "/generate-email (POST with prompt + optional images)",
            "upload_image": "/upload-image (POST with file) - Upload to Supabase",
            "list_images": "/list-images (GET) - List all uploaded images"
        },
        "supabase_configured": supabase is not None
    }

