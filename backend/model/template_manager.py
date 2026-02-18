"""
Manager for handling automatic template saving and metadata generation.
"""

from typing import Dict, Any, Optional
from fastapi import BackgroundTasks
from openai import OpenAI

from .embeddings import generate_embedding, get_openai_client
from .rag_service import get_supabase_client

async def generate_metadata(subject: str, html_content: str) -> Dict[str, str]:
    """
    Generate description and category for the template using LLM.
    
    Args:
        subject: Email subject
        html_content: Email HTML content
        
    Returns:
        Dict containing 'description' and 'category'
    """
    client = get_openai_client()
    
    # Truncate HTML to avoid token limits if necessary, though 4o-mini has 128k context
    # Taking first 10k chars should be enough for context
    html_preview = html_content[:10000]
    
    prompt = f"""
    Analyze this email template and generate a short description and a category.
    
    Subject: {subject}
    HTML Preview: {html_preview}
    
    Return ONLY a JSON object with keys:
    - description: A short, clear description of what this email is for (max 1 sentence)
    - category: One suitable category from [Marketing, Newsletter, Transactional, Personal, Business, Onboarding, Event, Other]
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that analyzes emails. Output JSON only."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3
        )
        
        content = response.choices[0].message.content
        import json
        return json.loads(content)
    except Exception as e:
        print(f"⚠️ Metadata generation failed: {e}")
        return {
            "description": f"Auto-saved template for: {subject}",
            "category": "General"
        }

async def auto_save_template_from_email(
    subject: str, 
    html_content: str, 
    user_email: str
):
    """
    Background task to auto-save a sent email as a template.
    Generates embeddings and metadata automatically.
    """
    print(f"🔄 Auto-saving template for: {subject}")
    
    supabase = get_supabase_client()
    if not supabase:
        print("❌ Supabase not configured, skipping auto-save")
        return

    try:
        # 1. Generate Metadata (Description & Category)
        metadata = await generate_metadata(subject, html_content)
        description = metadata.get("description", f"Template for {subject}")
        category = metadata.get("category", "General")
        
        # 2. Generate Embedding
        # Combine subject, description, and category for better semantic search
        combined_text = f"{subject} {description} {category}"
        embedding = generate_embedding(combined_text)
        
        # 3. Save to Supabase
        # Note: 'visibility' is set to 'public' by default as per requirements
        # We might want to add 'created_by' if the schema supports it, but sticking to known schema for now
        data = {
            "subject": subject,
            "description": description,
            "template_code": html_content,
            "category": category,
            "visibility": "public",
            "embedding": embedding
        }
        
        result = supabase.table("email_templates").insert(data).execute()
        
        if result.data:
            print(f"✅ Template auto-saved successfully: {result.data[0].get('id')}")
        else:
            print("⚠️ Template save returned no data")
            
    except Exception as e:
        print(f"❌ Failed to auto-save template: {str(e)}")
