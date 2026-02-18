"""
Prompt Enhancer Module.
Uses OpenAI to rewrite and improve user prompts for better RAG search and email generation.
"""

from .embeddings import get_openai_client

SYSTEM_PROMPT = """You are an expert prompt engineer and email marketing strategist.
Your goal is to rewrite the user's raw email request into a detailed, structured, and high-quality prompt for an AI email generator.

RULES:
1. Analyze the user's intent (even if vague).
2. Expand on key elements:
   - **Tone**: Professional, friendly, urgent, celebratory, etc.
   - **Audience**: Who is receiving this?
   - **Key Goals**: Sales, information, welcome, re-engagement.
   - **Structure**: Header, body sections, call-to-action (CTA), footer.
3. Keep the enhanced prompt concise but comprehensive.
4. DO NOT generate the email itself. ONLY generate the PROMPT for the email generator.
5. Output ONLY the enhanced prompt. No explanations.

Example:
Input: "marketing email for shoes"
Output: "Create a vibrant marketing email for a summer shoe sale. Target audience is young adults. Tone should be energetic and stylish. Include a clear hero section with a 'Shop Now' call-to-action, a grid showcasing top selling sneakers and sandals, and a 'Free Shipping' banner in the footer."
"""

async def enhance_user_prompt(raw_prompt: str) -> str:
    """
    Enhance a raw user prompt using OpenAI.
    
    Args:
        raw_prompt: The original user input (e.g., "marketing email")
        
    Returns:
        A detailed, structured prompt optimized for generation and search.
    """
    client = get_openai_client()
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": raw_prompt}
            ],
            temperature=0.7,
            max_tokens=300
        )
        
        enhanced_prompt = response.choices[0].message.content.strip()
        print(f"✨ Enhanced Prompt:\nFROM: {raw_prompt}\nTO: {enhanced_prompt}")
        return enhanced_prompt
        
    except Exception as e:
        print(f"⚠️ Prompt enhancement failed: {e}")
        return raw_prompt  # Fallback to original prompt
