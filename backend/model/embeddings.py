"""
OpenAI embedding generation for RAG search.
"""

import os
from typing import List
from fastapi import HTTPException
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI client
openai_client = None
if OPENAI_API_KEY:
    # Show first/last chars for debugging (hide the rest)
    key_preview = f"{OPENAI_API_KEY[:12]}...{OPENAI_API_KEY[-4:]}" if len(OPENAI_API_KEY) > 16 else "KEY_TOO_SHORT"
    print(f"🔑 OpenAI API Key loaded: {key_preview}")
    openai_client = OpenAI(api_key=OPENAI_API_KEY)
else:
    print("❌ OPENAI_API_KEY not found in .env file!")


def generate_embedding(text: str) -> List[float]:
    """
    Generate embedding using OpenAI text-embedding-3-small.
    
    Args:
        text: Text to generate embedding for
        
    Returns:
        List of embedding values (1536 dimensions)
        
    Raises:
        HTTPException: If embedding generation fails
    """
    if not openai_client:
        raise HTTPException(500, "OpenAI API key not configured")
    
    try:
        response = openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=text,
            dimensions=1536
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Embedding generation error: {str(e)}")
        raise HTTPException(500, f"Failed to generate embedding: {str(e)}")


def get_openai_client() -> OpenAI:
    """
    Get the initialized OpenAI client.
    
    Returns:
        OpenAI client instance
        
    Raises:
        HTTPException: If client not initialized
    """
    if not openai_client:
        raise HTTPException(500, "OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.")
    return openai_client
