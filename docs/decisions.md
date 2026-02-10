# Design Decisions

## Why 3 memory layers?
- Keeps retrieval clean by separating volatile and durable information.
- Reduces token bloat from over-injecting stale context.
- Mirrors real production tradeoff between speed and recall.

## Why drift detector?
LLM outputs can shift tone or policy under ambiguity. Drift scoring + regeneration keeps persona consistency observable and enforceable.

## Why channel simulation endpoints?
Directly validates continuity promise without integrating full telephony/STT/TTS stack.

## Why API key from UI?
- Prevents source-level key embedding.
- Allows each evaluator/interviewer to test with their own credentials.
- Keeps deployment secret management decoupled from repo.
