from pydantic import BaseModel, Field
from typing import List, Dict, Any, Literal
from datetime import datetime

Channel = Literal["call", "email", "chat"]

class TraceEvent(BaseModel):
    ts: datetime = Field(default_factory=datetime.utcnow)
    agent: str
    action: str
    meta: Dict[str, Any] = Field(default_factory=dict)

class MemoryLayers(BaseModel):
    ephemeral: List[str] = Field(default_factory=list)
    working: List[str] = Field(default_factory=list)
    long_term_keys: List[str] = Field(default_factory=list)  # stored in vector db

class ConversationState(BaseModel):
    contact_id: str
    persona_id: str = "fonify_employee_v1"
    last_channel: Channel | None = None
    memory: MemoryLayers = Field(default_factory=MemoryLayers)
    trace: List[TraceEvent] = Field(default_factory=list)
    drift_score: float | None = None
    last_reply: str | None = None
