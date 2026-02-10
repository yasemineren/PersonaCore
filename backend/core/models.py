from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal

class ToneStyle(BaseModel):
    vocabulary: List[str] = Field(..., description="Sık kullanılan kelimeler")
    tone: str = Field(..., description="Genel ton")
    forbidden_phrases: List[str] = Field(default=[], description="Yasaklı ifadeler")

class Persona(BaseModel):
    name: str
    role: str
    company_context: str
    style: ToneStyle
    rules: List[str]

class Message(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: Optional[str] = None
