from langchain_openai import ChatOpenAI
from app.memory.memory_manager import search_long_term, write_long_term
from app.services.drift import persona_drift_score

class Orchestrator:
    async def handle_message(self, contact_id: str, channel: str, text: str, openai_api_key: str):
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.4, openai_api_key=openai_api_key)

        retrieved = search_long_term(openai_api_key, contact_id, text, k=4)

        reply = (await llm.ainvoke([...])).content

        score = await persona_drift_score(openai_api_key, reply)
        ...
        doc_id = write_long_term(openai_api_key, contact_id, f"User said: {text}", kind="profile")
