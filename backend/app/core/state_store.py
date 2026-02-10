from typing import Dict
from app.models.state import ConversationState

class StateStore:
    def __init__(self):
        self._db: Dict[str, ConversationState] = {}

    def get_or_create(self, contact_id: str) -> ConversationState:
        if contact_id not in self._db:
            self._db[contact_id] = ConversationState(contact_id=contact_id)
        return self._db[contact_id]

    def save(self, state: ConversationState) -> None:
        self._db[state.contact_id] = state

    def list_conversations(self):
        return [s.model_dump() for s in self._db.values()]

    def get_conversation(self, contact_id: str):
        s = self._db.get(contact_id)
        return s.model_dump() if s else {"error": "not_found"}

state_store = StateStore()
