# PersonaCore
“A single AI employee. One memory. Every channel.”

PersonaCore is an end-to-end AI Employee Orchestration Engine designed to preserve continuity when communication jumps across call, email, and chat.

This project explores how a single AI employee can preserve identity, memory and intent across fragmented communication channels.

PersonaCore is not a chatbot. It is an autonomous worker with continuity.

Design decisions prioritize real-world failure modes: context loss, persona drift and memory overload.

## Why this exists
Most systems still break when channels change:
- Context gets lost between interactions.
- Persona tone and policy drift over time.
- Memory becomes noisy because everything is stored equally.

PersonaCore treats this as a first-class architecture problem.

## Core Architecture

### 1) Persona Layer
Persona is modeled as a stateful entity (identity, fixed behavioral rules, memory policy, channel adaptation), not a one-off prompt.

### 2) Orchestration Brain (agentic workflow)
- **Conversation Agent**: handles immediate response generation.
- **Context Manager Agent**: aligns state across channels.
- **Memory Curator Agent**: decides what enters long-term memory.
- **Escalation Agent**: marks “human takeover needed” cases.

### 3) Unified Memory (3 layers)
- **Ephemeral Memory**: short-lived turn/session context.
- **Working Memory**: active task process context.
- **Long-Term Memory**: persistent profile/history in vector DB.

### 4) Channel Simulation
- `/call` (phone simulation)
- `/email`
- `/chat`

Using the same `contact_id` demonstrates continuity without context loss.

### 5) Persona Drift Detector (killer feature)
After each response, PersonaCore scores response compliance against persona rules.
- If drift is detected, response is regenerated.
- Drift decisions are logged and visible in dashboard trace.

## Repository Layout

```text
personacore/
├─ backend/
│  ├─ agents/
│  ├─ memory/
│  ├─ orchestration/
│  └─ api/
├─ frontend/
│  └─ dashboard (Next.js)
├─ docs/
│  ├─ architecture.md
│  └─ decisions.md
├─ demo/
│  └─ end_to_end_scenario.md
└─ README.md
```

## Run

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd dashboard
npm install
npm run dev
```

## API key policy
Gemini API key is **not hardcoded in code**. The dashboard asks for key input at runtime and sends it in `X-GEMINI-KEY` header per request.

## Quick demo flow
1. Send first message with `contact_id=customer-001` via `/call`.
2. Continue same `contact_id` through `/email`.
3. Finish in `/chat`.
4. Inspect trace, drift score, and memory snapshot in dashboard.
