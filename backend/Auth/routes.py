"""
Authentication routes for Google OAuth and email sending.
"""

import base64
import httpx
from typing import Optional
from fastapi import APIRouter, Request, HTTPException, Form, BackgroundTasks
from fastapi.responses import RedirectResponse, JSONResponse
from email.mime.text import MIMEText

from .oauth_config import oauth, BASE_URL, FRONTEND_URL
from model.template_manager import auto_save_template_from_email
from .session_manager import (
    create_session,
    get_session,
    delete_session,
    find_session_by_email,
    decrypt_token,
    refresh_access_token
)
from schema.auth import ConnectionStatus, DisconnectResponse

router = APIRouter()


# ==================================================================
# 1️⃣ CONNECT GOOGLE – START OAUTH LOGIN
# ==================================================================
@router.get("/connect/google")
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
@router.get("/auth/google/callback")
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
        
        # Look for existing token if not provided (re-login without consent prompt)
        if not refresh_token:
            encrypted_token = find_session_by_email(email)
            if encrypted_token:
                # Create session with existing token
                session_id = create_session(email, None)
                # Manually set the token
                from .session_manager import USER_SESSIONS
                USER_SESSIONS[session_id]["token"] = encrypted_token
            else:
                print("WARNING: No refresh token available. Offline access will fail.")
                session_id = create_session(email, None)
        else:
            # Create session with new refresh token
            session_id = create_session(email, refresh_token)
        
        # Redirect back to frontend with SESSION ID
        redirect_to_frontend = f"{FRONTEND_URL}/settings?connected=true&session_id={session_id}"
        return RedirectResponse(url=redirect_to_frontend)
        
        
    except Exception as e:
        error_msg = str(e)
        print(f"CALLBACK ERROR: {error_msg}")
        
        # Provide more helpful error messages for common issues
        if "state" in error_msg.lower():
            print("⚠️ OAuth state mismatch - this usually means:")
            print("   1. Session cookies aren't being maintained")
            print("   2. You may be accessing via different domains/ports")
            print("   3. Browser is blocking third-party cookies")
            return JSONResponse(
                {
                    "error": "OAuth session error",
                    "message": error_msg,
                    "details": "Session state mismatch. Try: 1) Clear browser cookies, 2) Use same domain for frontend/backend, 3) Check browser console for cookie warnings",
                    "redirect_to": f"{FRONTEND_URL}/settings?error=oauth_failed"
                }, 
                status_code=500
            )
        
        return JSONResponse(
            {"error": str(e), "details": "Check server logs for more info"}, 
            status_code=500
        )


# ==================================================================
# 3️⃣ SEND EMAIL (Protected by Session ID)
# ==================================================================
@router.post("/send-email")
async def send_email(
    session_id: str = Form(..., description="The secure session ID"),
    to: str = Form(..., description="Recipient email address"),
    subject: str = Form(..., description="Email subject"),
    html_body: str = Form(..., description="HTML email body"),
    cc: Optional[str] = Form(None, description="Comma-separated list of CC emails"),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Sends an email using the session's credentials"""
    
    # Validate Session
    user_data = get_session(session_id)
    if not user_data:
        raise HTTPException(401, "Invalid or expired session. Please log in again.")
    
    email = user_data["email"]
    encrypted_token = user_data.get("token")
    
    if not encrypted_token:
        raise HTTPException(400, "No refresh token found for this session. Please reconnect with Google.")
    
    # Decrypt refresh token
    refresh_token = decrypt_token(encrypted_token)
    
    # Get fresh access token
    access_token = await refresh_access_token(refresh_token)
    
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
            
            # Auto-save template in background
            background_tasks.add_task(
                auto_save_template_from_email, 
                subject=subject, 
                html_content=html_body, 
                user_email=email
            )
            
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
@router.get("/check-connection/{session_id}", response_model=ConnectionStatus)
async def check_connection(session_id: str):
    """Check if a session is valid"""
    user_data = get_session(session_id)
    if user_data:
        return ConnectionStatus(
            is_connected=True,
            email=user_data["email"]
        )
    return ConnectionStatus(is_connected=False)


# ==================================================================
# 5️⃣ DISCONNECT SESSION
# ==================================================================
@router.post("/disconnect/{session_id}", response_model=DisconnectResponse)
async def disconnect_user(session_id: str):
    """Invalidate session"""
    if delete_session(session_id):
        return DisconnectResponse(status="disconnected")
    raise HTTPException(404, "Session not found")
