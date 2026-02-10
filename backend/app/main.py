from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# Modellerimizi import edelim (Eğer core klasöründe oluşturduysak)
# Şimdilik basitçe burada tanımlıyorum, sonra ayıracağız.

app = FastAPI(title='PersonaCore API')

# --- 1. CORS AYARLARI (Failed to fetch hatasının ilacı) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js'in çalıştığı port
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, OPTIONS vb. hepsine izin ver
    allow_headers=["*"],  # API Key header'ları vs. için
)

# --- 2. VERİ MODELİ (Frontend'den ne bekliyoruz?) ---
class ChatRequest(BaseModel):
    message: str
    contact_id: str
    channel: str
    api_key: str  # Güvenlik için frontend'den geliyor

# --- 3. ENDPOINT (/chat kapısı) ---
@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    print(f"📩 Mesaj Alındı: {request.message}")
    print(f"🔑 API Key Kontrol: {'Mevcut' if request.api_key else 'YOK'}")
    
    # Şimdilik "Echo" (Yankı) yapalım.
    # Bir sonraki adımda buraya gerçek AI beynini bağlayacağız.
    
    if not request.api_key:
        raise HTTPException(status_code=401, detail="API Key eksik!")

    # Simüle edilmiş cevap
    return {
        "response": f"PersonaCore (Simülasyon): Mesajını aldım! '{request.message}' dedin. Kanal: {request.channel}",
        "conversation_id": request.contact_id
    }

@app.get("/")
def read_root():
    return {"status": "PersonaCore Brain is Active"}