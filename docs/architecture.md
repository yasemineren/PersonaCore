# PersonaCore Architecture

## AI Employee Brain
PersonaCore models an AI employee as a continuity engine with stable identity and channel-agnostic memory.

## Request lifecycle
1. API receives message (`contact_id`, `channel`, `text`, `X-GEMINI-KEY`).
2. Conversation state is loaded from in-memory store.
3. Context Manager fetches relevant long-term memory from Chroma.
4. Conversation Agent generates reply with persona constraints.
5. Persona Drift Detector scores response compliance.
6. If drift score is low, response is regenerated.
7. Escalation Agent decides whether handoff is needed.
8. Memory Curator stores durable user signal in vector memory.
9. Trace + memory snapshot is returned to dashboard.

## Components
- `backend/app/core/persona.py`: fixed persona identity and behavior rules.
- `backend/app/core/orchestrator.py`: agentic orchestration pipeline.
- `backend/app/memory/memory_manager.py`: long-term memory read/write.
- `backend/app/services/drift.py`: persona drift scoring via evaluator prompt.
- `backend/app/api/v1/channels.py`: channel simulation entrypoint.
- `dashboard/src/app/page.tsx`: control panel with runtime API key input.

## Memory model
- Ephemeral: rolling short window of recent messages.
- Working: active task memory to keep flow coherent.
- Long-term: Chroma-backed retrieval memory with metadata filtering.
