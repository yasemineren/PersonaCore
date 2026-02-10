from fastapi import APIRouter
from app.core.state_store import state_store

router = APIRouter()

@router.get("/conversations")
async def conversations():
    return state_store.list_conversations()

@router.get("/conversations/{contact_id}")
async def conversation_detail(contact_id: str):
    return state_store.get_conversation(contact_id)
