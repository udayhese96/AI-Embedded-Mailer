"""
API routes for AI email generation, RAG templates, and image management.
"""

import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Form, UploadFile, File
from dotenv import load_dotenv

from .embeddings import generate_embedding, get_openai_client
from .rag_service import get_supabase_client, get_rag_context
from .email_generator import generate_email_html
from .prompt_enhancer import enhance_user_prompt
from schema.email import EmailGenerationResponse
from schema.template import TemplateListResponse

load_dotenv()

SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "email-images")

router = APIRouter()


# ==================================================================
# 📧 EMAIL GENERATION ENDPOINTS
# ==================================================================

@router.post("/generate-email", response_model=EmailGenerationResponse)
async def generate_email(
    prompt: str = Form(..., description="Email intent/description"),
    history: Optional[str] = Form(None, description="JSON array of conversation history"),
    current_html: Optional[str] = Form(None, description="Current template HTML for modifications"),
    images: List[UploadFile] = File(default=[])
):
    """
    Generate email-safe HTML using AI via OpenAI.
    Supports conversation history for context-aware modifications.
    """
    # Validate image count
    if len(images) > 4:
        raise HTTPException(400, "Maximum 4 images allowed")
    
    result = await generate_email_html(
        prompt=prompt,
        history=history,
        current_html=current_html,
        images=images,
        rag_context=""  # No RAG for basic generation
    )
    
    return result


@router.post("/generate-email-rag", response_model=EmailGenerationResponse)
async def generate_email_rag(
    prompt: str = Form(..., description="Email intent/description"),
    history: Optional[str] = Form(None, description="JSON array of conversation history"),
    current_html: Optional[str] = Form(None, description="Current template HTML for modifications"),
    use_rag: bool = Form(True, description="Enable RAG context from similar templates"),
    images: List[UploadFile] = File(default=[])
):
    """
    Generate email-safe HTML using AI with RAG context from similar templates.
    This enhanced version retrieves similar templates and uses them as context.
    """
    # Validate image count
    if len(images) > 4:
        raise HTTPException(400, "Maximum 4 images allowed")
    
    
    # ENHANCE PROMPT: Rewrite user prompt for better search and generation
    enhanced_prompt = prompt
    if not current_html: # Only enhance for new generation, not edits
        enhanced_prompt = await enhance_user_prompt(prompt)

    # Get RAG context if enabled
    rag_context = ""
    if use_rag and not current_html:  # Don't use RAG when modifying existing template
        # Use ENHANCED prompt for RAG search (better keywords = better results)
        rag_context = await get_rag_context(enhanced_prompt)
    
    result = await generate_email_html(
        prompt=enhanced_prompt, # Use ENHANCED prompt for generation
        history=history,
        current_html=current_html,
        images=images,
        rag_context=rag_context
    )
    
    return result


# ==================================================================
# 📚 TEMPLATE MANAGEMENT ENDPOINTS (RAG)
# ==================================================================

@router.post("/save-template")
async def save_template(
    subject: str = Form(..., description="Email subject line"),
    description: str = Form(..., description="Template description"),
    template_code: str = Form(..., description="HTML template code"),
    category: str = Form("general", description="Template category"),
    visibility: str = Form("public", description="Template visibility (public/private)")
    
):
    """
    Save an email template with auto-generated embedding for RAG search.
    """
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(500, "Supabase not configured")
    
    try:
        # Generate embedding from subject + description
        combined_text = f"{subject} {description}"
        embedding = generate_embedding(combined_text)
        
        # Insert into Supabase
        result = supabase.table("email_templates").insert({
            "subject": subject,
            "description": description,
            "template_code": template_code,
            "category": category,
            "visibility": visibility,
            "embedding": embedding
        }).execute()
        
        print(f"✅ Template saved: {subject}")
        
        return {
            "success": True,
            "message": "Template saved successfully",
            "id": result.data[0]["id"] if result.data else None,
            "subject": subject
        }
        
    except Exception as e:
        print(f"❌ Save template error: {str(e)}")
        raise HTTPException(500, f"Failed to save template: {str(e)}")


@router.post("/search-templates", response_model=TemplateListResponse)
async def search_templates(
    query: str = Form(..., description="Search query"),
    limit: int = Form(5, description="Number of results to return"),
    use_hybrid: bool = Form(True, description="Use hybrid search (keyword + semantic)")
):
    """
    Search for similar email templates using hybrid search (keyword + semantic).
    """
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(500, "Supabase not configured")
    
    try:
        # Generate query embedding
        query_embedding = generate_embedding(query)
        
        if use_hybrid:
            # Use hybrid search function (keyword + semantic with RRF)
            result = supabase.rpc("hybrid_search_templates", {
                "query_text": query,
                "query_embedding": query_embedding,
                "match_count": limit,
                "full_text_weight": 1.0,
                "semantic_weight": 1.0,
                "rrf_k": 60
            }).execute()
        else:
            # Use semantic-only search
            result = supabase.rpc("semantic_search_templates", {
                "query_embedding": query_embedding,
                "match_count": limit
            }).execute()
        
        templates = result.data if result.data else []
        
        print(f"🔍 Found {len(templates)} templates for query: '{query}'")
        
        return {
            "success": True,
            "query": query,
            "search_type": "hybrid" if use_hybrid else "semantic",
            "count": len(templates),
            "templates": templates
        }
        
    except Exception as e:
        print(f"❌ Search error: {str(e)}")
        raise HTTPException(500, f"Failed to search templates: {str(e)}")


@router.get("/list-templates", response_model=TemplateListResponse)
async def list_templates(limit: int = 50):
    """
    List all saved email templates.
    """
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(500, "Supabase not configured")
    
    try:
        result = supabase.table("email_templates").select(
            "id, subject, description, template_code, category, visibility, created_at"
        ).order("created_at", desc=True).limit(limit).execute()
        
        templates = result.data if result.data else []
        
        return {
            "success": True,
            "count": len(templates),
            "templates": templates
        }
        
    except Exception as e:
        raise HTTPException(500, f"Failed to list templates: {str(e)}")


@router.get("/get-template/{template_id}")
async def get_template(template_id: str):
    """
    Get a specific template by ID.
    """
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(500, "Supabase not configured")
    
    try:
        result = supabase.table("email_templates").select(
            "id, subject, description, template_code, created_at"
        ).eq("id", template_id).single().execute()
        
        if not result.data:
            raise HTTPException(404, "Template not found")
        
        return {
            "success": True,
            "template": result.data
        }
        
    except Exception as e:
        raise HTTPException(500, f"Failed to get template: {str(e)}")


@router.delete("/delete-template/{template_id}")
async def delete_template(template_id: str):
    """
    Delete a template by ID.
    """
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(500, "Supabase not configured")
    
    try:
        result = supabase.table("email_templates").delete().eq(
            "id", template_id
        ).execute()
        
        print(f"🗑️ Template deleted: {template_id}")
        
        return {
            "success": True,
            "message": "Template deleted successfully",
            "id": template_id
        }
        
    except Exception as e:
        raise HTTPException(500, f"Failed to delete template: {str(e)}")


@router.post("/generate-embeddings")
async def generate_embeddings_for_templates():
    """
    Generate embeddings for all templates that don't have embeddings yet.
    Use this after inserting templates via SQL.
    """
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(500, "Supabase not configured")
    
    try:
        # Get templates without embeddings
        result = supabase.table("email_templates").select(
            "id, subject, description"
        ).is_("embedding", "null").execute()
        
        templates = result.data if result.data else []
        
        if not templates:
            return {
                "success": True,
                "message": "All templates already have embeddings",
                "updated": 0
            }
        
        updated_count = 0
        for tpl in templates:
            try:
                # Generate embedding
                combined_text = f"{tpl['subject']} {tpl['description']}"
                embedding = generate_embedding(combined_text)
                
                # Update template with embedding
                supabase.table("email_templates").update({
                    "embedding": embedding
                }).eq("id", tpl["id"]).execute()
                
                updated_count += 1
                print(f"✅ Generated embedding for: {tpl['subject']}")
                
            except Exception as e:
                print(f"⚠️ Failed to generate embedding for {tpl['id']}: {str(e)}")
        
        return {
            "success": True,
            "message": f"Generated embeddings for {updated_count} templates",
            "updated": updated_count,
            "total_without_embeddings": len(templates)
        }
        
    except Exception as e:
        print(f"❌ Generate embeddings error: {str(e)}")
        raise HTTPException(500, f"Failed to generate embeddings: {str(e)}")


# ==================================================================
# 🖼️ IMAGE UPLOAD ENDPOINTS (Supabase Storage)
# ==================================================================

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """
    Upload an image to Supabase Storage and return the public URL.
    This URL can be used in email templates.
    """
    supabase = get_supabase_client()
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


@router.get("/list-images")
async def list_images():
    """List all uploaded images from Supabase Storage"""
    supabase = get_supabase_client()
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


@router.delete("/delete-image/{filename}")
async def delete_image(filename: str):
    """Delete an image from Supabase Storage"""
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(500, "Supabase not configured")
    
    try:
        result = supabase.storage.from_(SUPABASE_BUCKET).remove([filename])
        print(f"🗑️ Image deleted: {filename}")
        return {"success": True, "deleted": filename}
        
    except Exception as e:
        print(f"❌ Delete failed: {str(e)}")
        raise HTTPException(500, f"Failed to delete image: {str(e)}")
