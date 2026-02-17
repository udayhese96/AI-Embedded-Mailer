"""
RAG (Retrieval Augmented Generation) service for email templates.
Handles searching and retrieving similar templates from Supabase.
"""

import os
from typing import List, Optional
from dotenv import load_dotenv
from supabase import create_client, Client

from .embeddings import generate_embedding

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize Supabase client
supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print(f"✅ Supabase connected for RAG")
else:
    print("⚠️ Supabase not configured. RAG features will be disabled.")


def get_supabase_client() -> Optional[Client]:
    """Get the initialized Supabase client."""
    return supabase


async def get_rag_context(prompt: str, max_templates: int = 3) -> str:
    """
    Get RAG context by searching for similar templates.
    Returns formatted context string for the AI prompt.
    
    Args:
        prompt: User's email generation prompt
        max_templates: Maximum number of similar templates to retrieve
        
    Returns:
        Formatted context string with similar templates
    """
    if not supabase:
        return ""
    
    try:
        # Generate query embedding
        query_embedding = generate_embedding(prompt)
        
        # Try hybrid search first
        try:
            result = supabase.rpc("hybrid_search_templates", {
                "query_text": prompt,
                "query_embedding": query_embedding,
                "match_count": max_templates,
                "full_text_weight": 1.0,
                "semantic_weight": 1.0,
                "rrf_k": 60
            }).execute()
        except Exception:
            # Fallback to semantic search if hybrid function not available
            result = supabase.rpc("semantic_search_templates", {
                "query_embedding": query_embedding,
                "match_count": max_templates
            }).execute()
        
        templates = result.data if result.data else []
        
        if not templates:
            return ""
        
        # Format context for AI
        context_parts = []
        for i, tpl in enumerate(templates, 1):
            context_parts.append(f"""
--- REFERENCE TEMPLATE {i} ---
Subject: {tpl.get('subject', 'N/A')}
Description: {tpl.get('description', 'N/A')}
HTML Code:
```html
{tpl.get('template_code', '')}
```
""")
        
        context = "\n".join(context_parts)
        
        print(f"📚 RAG Context: Found {len(templates)} similar templates")
        
        return f"""
=== REFERENCE TEMPLATES (Use these as style/structure guides) ===
The following are similar high-quality email templates from our database.
Use them as inspiration for layout, structure, and design patterns.
Do NOT copy them exactly - create a NEW template based on the user's request.
{context}
=== END REFERENCE TEMPLATES ===
"""
    
    except Exception as e:
        print(f"⚠️ RAG context error (non-fatal): {str(e)}")
        return ""
