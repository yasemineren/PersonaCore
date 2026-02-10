from datetime import datetime
from typing import Any

from langchain_openai import ChatOpenAI

from app.core.persona import FONIFY_EMPLOYEE_V1
from app.core.state_store import state_store
from app.memory.memory_manager import search_long_term, write_long_term
from app.models.state import TraceEvent
from app.services.drift import persona_drift_score


class Orchestrator:
    async def handle_message(self, contact_id: str, channel: str, text: str, openai_api_key: str) -> dict[str, Any]:
        state = state_store.get_or_create(contact_id)
        state.last_channel = channel

        state.memory.ephemeral.append(f"[{channel}] {text}")
        state.memory.ephemeral = state.memory.ephemeral[-10:]
        state.memory.working.append(text)
        state.memory.working = state.memory.working[-5:]

        state.trace.append(
            TraceEvent(
                agent="ConversationAgent",
                action="message_received",
                meta={"channel": channel, "text": text},
            )
        )

        retrieved = search_long_term(openai_api_key, contact_id, text, k=4)
        state.trace.append(
            TraceEvent(
                agent="ContextManagerAgent",
                action="memory_retrieved",
                meta={"hits": len(retrieved)},
            )
        )

        prompt = self._build_prompt(channel=channel, text=text, retrieved=retrieved)
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.35, openai_api_key=openai_api_key)
        reply = (await llm.ainvoke(prompt)).content

        score = await persona_drift_score(openai_api_key, reply)
        state.drift_score = score
        drift_detected = score < 75
        state.trace.append(
            TraceEvent(
                agent="PersonaDriftDetector",
                action="drift_scored",
                meta={"score": score, "threshold": 75, "drift_detected": drift_detected},
            )
        )

        if drift_detected:
            reply = (await llm.ainvoke(self._build_repair_prompt(reply))).content
            state.trace.append(
                TraceEvent(
                    agent="PersonaDriftDetector",
                    action="reply_regenerated",
                    meta={"reason": "low_drift_score"},
                )
            )

        escalation = self._requires_escalation(text=text, drift_score=score)
        state.trace.append(
            TraceEvent(
                agent="EscalationAgent",
                action="decision",
                meta={"escalate": escalation},
            )
        )

        doc_id = write_long_term(openai_api_key, contact_id, f"User ({channel}) said: {text}", kind="history")
        if doc_id not in state.memory.long_term_keys:
            state.memory.long_term_keys.append(doc_id)
        state.trace.append(
            TraceEvent(
                agent="MemoryCuratorAgent",
                action="long_term_write",
                meta={"doc_id": doc_id},
            )
        )

        state.last_reply = reply
        state.trace = state.trace[-50:]
        state_store.save(state)

        return {
            "contact_id": contact_id,
            "channel": channel,
            "reply": reply,
            "drift_score": score,
            "drift_detected": drift_detected,
            "escalation": escalation,
            "memory_snapshot": {
                "ephemeral": state.memory.ephemeral,
                "working": state.memory.working,
                "long_term_keys": state.memory.long_term_keys,
            },
            "trace": [event.model_dump() for event in state.trace[-8:]],
            "timestamp": datetime.utcnow().isoformat(),
        }

    def _build_prompt(self, channel: str, text: str, retrieved: list[dict[str, Any]]) -> str:
        memory_block = "\n".join(f"- {item['text']}" for item in retrieved) if retrieved else "- No long-term memory found"
        rules_block = "\n- ".join(FONIFY_EMPLOYEE_V1.rules)
        return f"""
You are {FONIFY_EMPLOYEE_V1.name}, role: {FONIFY_EMPLOYEE_V1.role}.
Tone: {FONIFY_EMPLOYEE_V1.tone}

Non-negotiable behavior rules:
- {rules_block}

Current channel: {channel}
Relevant long-term memory:
{memory_block}

User message:
{text}

Write a concise, practical answer. Keep continuity across channels and if needed ask one clarifying question.
""".strip()

    def _build_repair_prompt(self, reply: str) -> str:
        rules_block = "\n- ".join(FONIFY_EMPLOYEE_V1.rules)
        return f"""
Rewrite the following response so it fully complies with this persona:
Tone: {FONIFY_EMPLOYEE_V1.tone}
Rules:
- {rules_block}

Original response:
{reply}

Return only the improved response.
""".strip()

    def _requires_escalation(self, text: str, drift_score: float) -> bool:
        escalation_keywords = ["legal", "lawsuit", "refund now", "threat", "sensitive", "breach"]
        lowered = text.lower()
        return any(word in lowered for word in escalation_keywords) or drift_score < 60
