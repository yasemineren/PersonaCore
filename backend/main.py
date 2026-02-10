from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# KESİN ÇÖZÜM: Tam yol belirtiyoruz.
# Proje ana dizininden çalıştırdığımız için "backend.core" demeliyiz.
from backend.core.models import Persona, Message
from backend.core.llm import get_llm

app = FastAPI(title='PersonaCore API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    contact_id: str
    channel: str
    api_key: str

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    print(f"📩 Mesaj: {request.message}")
    
    # Basit bir LLM testi yapalım (Key varsa)
    response_text = "API Key eksik, simülasyon modu."
    if request.api_key:
        try:
            llm = get_llm(request.api_key)
            # Şimdilik sadece selam verdiriyoruz
            ai_msg = llm.invoke(f"Kullanıcı dedi ki: {request.message}. Ona kısa ve nazik bir cevap ver.")
            response_text = ai_msg.content
        except Exception as e:
            response_text = f"LLM Hatası: {str(e)}"

    return {
        "response": response_text,
        "conversation_id": request.contact_id
    }

@app.get("/")
def read_root():
    return {"status": "PersonaCore Brain is Active"}
