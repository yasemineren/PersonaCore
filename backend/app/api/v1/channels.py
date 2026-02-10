from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from app.core.orchestrator import Orchestrator

router = APIRouter()
orchestrator = Orchestrator()


class ChannelMessage(BaseModel):
    contact_id: str
    channel: str  # call | email | chat
    text: str


@router.post("/message")
async def message(
    payload: ChannelMessage,
    x_gemini_key: str | None = Header(default=None),
    x_openai_key: str | None = Header(default=None),
):
    api_key = x_gemini_key or x_openai_key
    if not api_key:
        raise HTTPException(status_code=401, detail="Missing X-GEMINI-KEY header")

    result = await orchestrator.handle_message(
        contact_id=payload.contact_id,
        channel=payload.channel,
        text=payload.text,
        gemini_api_key=api_key,
    )
    return result
