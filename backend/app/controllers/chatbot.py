import os
from pydantic import BaseModel
from typing import Optional, Dict, Any
from fastapi import APIRouter
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

class ChatMessage(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

@router.post("/chat")
def chat_endpoint(data: ChatMessage):
    if not client:
        return {"reply": "I am currently offline. Please check the GROQ API key configuration."}
        
    system_prompt = (
        "You are InsureGenie, an AI assistant for an insurance platform. "
        "You help users understand their health, driving risk, and insurance policies. "
        "Be concise, friendly, and helpful."
    )
    if data.context:
        system_prompt += f"\nHere is the user's current context based on their dashboard: {data.context}"

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": data.message}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.5,
            max_tokens=1024,
        )
        reply = chat_completion.choices[0].message.content
        return {"reply": reply}
    except Exception as e:
        return {"reply": f"Error communicating with the bot: {str(e)}"}