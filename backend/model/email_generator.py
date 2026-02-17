"""
AI email generation using OpenAI GPT-4o-mini.
Handles HTML email template generation with proper formatting and validation.
"""

import re
import base64
import json
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, UploadFile

from .embeddings import get_openai_client

# System prompt for email HTML generation (STRICT - HTML ONLY)
EMAIL_SYSTEM_PROMPT = """You are an expert HTML email template generator for production use.

STRICT RULES (DO NOT BREAK):
- Output ONLY valid HTML (no markdown, no explanation, no text before or after)
- NEVER use markdown syntax like **bold** or _italic_ - use <strong> and <em> HTML tags instead
- Use table-based layout ONLY
- Max email width: 600px
- Inline CSS ONLY (style attributes on elements)
- No <style> tags, no <script>, no external CSS
- Gmail, Outlook, Yahoo compatible
- Mobile & desktop responsive
- Start output with <!-- SUBJECT: ... --> then the HTML
- End output with </html>

RESPONSE FORMAT (MANDATORY - ALWAYS FOLLOW):
Your response MUST start with a SUBJECT line comment. This is REQUIRED for every response.
Format: <!-- SUBJECT: Your Short Catchy Subject Line Here -->

Example complete response structure:
<!-- SUBJECT: 🎉 Welcome to Our Community! -->
<!DOCTYPE html>
<html>...</html>

SUBJECT LINE RULES (VERY IMPORTANT):
- ALWAYS start your response with: <!-- SUBJECT: ... -->
- Create a SHORT, catchy subject line (max 50 characters)
- DO NOT repeat the user's prompt as the subject
- Make it like a real email subject: action-oriented, intriguing, emotional
- Use 1 relevant emoji at the start
- Examples of GOOD subject lines:
  • <!-- SUBJECT: 🔥 50% Off - Today Only! -->
  • <!-- SUBJECT: 🎉 You're Invited: Exclusive Event -->
  • <!-- SUBJECT: 📅 IPL Match Day - Book Your Seats! -->
  • <!-- SUBJECT: ✨ Your Order is Confirmed! -->
  • <!-- SUBJECT: 🚀 Launch Alert: New Feature Inside -->
- Examples of BAD subject lines (DO NOT DO THIS):
  • "Template for IPL Match" (too generic)
  • "Email about cricket" (boring)
  • Just repeating user's request

CHANGE SUMMARY (FOR MODIFICATIONS ONLY):
- When modifying existing HTML, output a CHANGES comment AFTER the SUBJECT comment
- Format: <!-- CHANGES: • First change made • Second change made -->
- If creating NEW template, skip the CHANGES comment

IMAGE RULES (CRITICAL):
- If user provides actual URLs (http:// or https://), USE THEM DIRECTLY in <img src="">
- DO NOT use source.unsplash.com - it is deprecated
- DO NOT use Wikipedia/Wikimedia URLs - they block hotlinking
- DO NOT invent random image URLs
- If no URL provided, use PLACEHOLDER: {{IMAGE_HERO}}, {{IMAGE_1}}, etc.

VISUAL ENHANCEMENTS:
- Use Unicode emojis (🎉 🔥 ⭐ 🚀 ✨ 💡) for visual interest
- Use colored backgrounds for sections
- Use bold typography for headers
- Create visually appealing layouts with good spacing

CRITICAL OUTPUT RULES:
1. ALWAYS start with <!-- SUBJECT: Your Subject --> - THIS IS MANDATORY
2. Then HTML code starting with <!DOCTYPE html> or <html>
3. STOP IMMEDIATELY after </html> tag
4. NO explanations, NO suggestions after </html>"""


def img_to_base64(file: UploadFile) -> str:
    """
    Convert uploaded file to base64 string.
    
    Args:
        file: Uploaded file object
        
    Returns:
        Base64 encoded string
    """
    content = file.file.read()
    file.file.seek(0)  # Reset file pointer for potential re-use
    return base64.b64encode(content).decode("utf-8")


def extract_subject_from_html(html_content: str) -> Optional[str]:
    """
    Extract subject line from HTML comment.
    
    Args:
        html_content: Generated HTML content
        
    Returns:
        Subject line or None if not found
    """
    subject_match = re.search(r'<!--\s*SUBJECT:\s*(.+?)\s*-->', html_content, re.IGNORECASE)
    if subject_match:
        return subject_match.group(1).strip()
    return None


def extract_changes_from_html(html_content: str) -> Optional[str]:
    """
    Extract change summary from HTML comment.
    
    Args:
        html_content: Generated HTML content
        
    Returns:
        Changes summary or None if not found
    """
    changes_match = re.search(r'<!--\s*CHANGES:\s*(.+?)\s*-->', html_content, re.IGNORECASE | re.DOTALL)
    if changes_match:
        return changes_match.group(1).strip()
    return None


def clean_html_content(html_content: str) -> str:
    """
    Clean and validate generated HTML content.
    
    Args:
        html_content: Raw HTML from AI
        
    Returns:
        Cleaned HTML content
        
    Raises:
        HTTPException: If HTML is invalid
    """
    # Remove HTML comments (SUBJECT and CHANGES)
    html_content = re.sub(r'<!--\s*SUBJECT:.+?-->\s*', '', html_content, flags=re.IGNORECASE)
    html_content = re.sub(r'<!--\s*CHANGES:.+?-->\s*', '', html_content, flags=re.IGNORECASE | re.DOTALL)
    
    # Clean up markdown code blocks if present
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
        if "<table" in html_lower:
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
    
    # CRITICAL: Remove any text AFTER </html> (AI explanations, suggestions, etc.)
    html_lower = html_content.lower()
    if "</html>" in html_lower:
        idx = html_lower.find("</html>") + 7
        html_content = html_content[:idx]
    elif "</body>" in html_lower:
        idx = html_lower.find("</body>") + 7
        html_content = html_content[:idx]
    elif "</table>" in html_lower:
        # Find the LAST closing table tag (in case of nested tables)
        idx = html_lower.rfind("</table>") + 8
        html_content = html_content[:idx]
    
    # Remove markdown code block markers that might be in the middle
    html_content = html_content.replace("```html", "").replace("```", "")
    html_content = html_content.strip()
    
    # Make all links open in new tab
    html_content = re.sub(
        r'<a\s+([^>]*?)href=',
        lambda m: '<a ' + m.group(1) + 'target="_blank" rel="noopener noreferrer" href=' 
            if 'target=' not in m.group(0).lower() else m.group(0),
        html_content,
        flags=re.IGNORECASE
    )
    
    return html_content


async def generate_subject_fallback(prompt: str) -> str:
    """
    Generate a subject line as fallback when AI doesn't provide one.
    
    Args:
        prompt: Email generation prompt
        
    Returns:
        Generated subject line
    """
    client = get_openai_client()
    
    try:
        subject_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Generate a short, catchy email subject line (max 50 chars) for the given email description. Start with 1 emoji. Output ONLY the subject line, nothing else."
                },
                {
                    "role": "user",
                    "content": f"Email description: {prompt}"
                }
            ],
            temperature=0.7,
            max_tokens=60
        )
        subject_line = subject_response.choices[0].message.content.strip()
        # Clean up any quotes around it
        return subject_line.strip('"\'')
    except Exception as e:
        print(f"Subject generation fallback failed: {e}")
        return "📧 Your Email"


async def generate_email_html(
    prompt: str,
    history: Optional[str] = None,
    current_html: Optional[str] = None,
    images: List[UploadFile] = [],
    rag_context: str = ""
) -> Dict[str, Any]:
    """
    Generate email HTML using OpenAI GPT-4o-mini.
    
    Args:
        prompt: Email intent/description
        history: JSON string of conversation history
        current_html: Current template HTML for modifications
        images: List of uploaded images
        rag_context: RAG context from similar templates
        
    Returns:
        Dictionary with success, html, subject, changes, model, and images_used
        
    Raises:
        HTTPException: If generation fails
    """
    client = get_openai_client()
    
    # Build enhanced system prompt with RAG context
    enhanced_system_prompt = EMAIL_SYSTEM_PROMPT
    if rag_context:
        enhanced_system_prompt = f"""{EMAIL_SYSTEM_PROMPT}

{rag_context}
"""
    
    # Build messages list
    messages = [{"role": "system", "content": enhanced_system_prompt}]
    
    # Parse and add conversation history
    if history:
        try:
            history_messages = json.loads(history)
            for msg in history_messages:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if role in ["user", "assistant"] and content:
                    messages.append({"role": role, "content": content})
        except json.JSONDecodeError:
            print("Warning: Failed to parse history JSON")
    
    # Build current message content
    current_content = []
    
    if current_html:
        current_content.append({
            "type": "text", 
            "text": f"CURRENT TEMPLATE HTML:\n```html\n{current_html}\n```\n\nUSER REQUEST: {prompt}"
        })
    else:
        current_content.append({"type": "text", "text": prompt})
    
    # Add images
    for img in images:
        if img.filename:
            content_type = img.content_type or "image/png"
            base64_data = img_to_base64(img)
            current_content.append({
                "type": "image_url",
                "image_url": {"url": f"data:{content_type};base64,{base64_data}"}
            })
    
    messages.append({
        "role": "user",
        "content": current_content if len(current_content) > 1 else current_content[0]["text"]
    })
    
    try:
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.3,
            max_tokens=4000
        )
        
        html_content = response.choices[0].message.content
        
        # Extract subject and changes
        subject_line = extract_subject_from_html(html_content)
        changes_summary = extract_changes_from_html(html_content)
        
        # Generate fallback subject if needed
        if not subject_line:
            subject_line = await generate_subject_fallback(prompt)
        
        # Clean HTML
        html_content = clean_html_content(html_content)
        
        return {
            "success": True,
            "html": html_content,
            "subject": subject_line,
            "changes": changes_summary,
            "model": "gpt-4o-mini",
            "rag_enabled": bool(rag_context),
            "images_used": len([img for img in images if img.filename])
        }
        
    except Exception as e:
        print(f"OpenAI API Error: {str(e)}")
        raise HTTPException(500, f"Failed to generate email: {str(e)}")
