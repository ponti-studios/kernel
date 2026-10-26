---
name: llm-structured-extraction
description: "Use when extracting structured data from text using LLMs."
license: MIT
metadata:
  author: Charles Ponti, Hermes Agent
  version: "0.1.0"
  platforms: [macos, linux]
  hermes:
    tags: [llm, extraction, structured-data, json, openrouter]
---

# LLM-Based Structured Data Extraction

Extract structured, typed data from unstructured text using LLMs with strict schema validation, retry logic, and deterministic post-processing.

## When to Use

- Building a pipeline that converts conversation/text into structured records
- Need deterministic extraction with provenance (every claim traces to source text)
- Implementing memory, knowledge graph, or data ingestion systems
- When extraction quality must be measurable across models

## Core Pattern: Extract → Validate → Resolve

1. **Extract**: LLM produces structured candidates from input text
2. **Validate**: Deterministic gate checks provenance, schema, evidence
3. **Resolve**: Decision logic (ADD/MERGE/SUPERSEDE/NOOP) against existing records

## Extractor Interface

```typescript
interface ExtractInput {
  episode_id: string;
  turns: { id: string; role: string; content: string; ts: string }[];
  rolling_summary: string | null;
  recent_messages: { id: string; role: string; content: string; ts: string }[];
}

interface ExtractOutput {
  extractor_version: string;
  memory_candidates: MemoryCandidate[];
  feedback_event_candidates: FeedbackCandidate[];
}
```

## Extraction Prompt Rules (16 rules)

1. **User utterances only** — source_turn_id must cite a role=user turn
2. **Assistant suggestions are not user preferences** — only emit if user explicitly adopts
3. **Atomicity** — one candidate = one claim
4. **Evidence is verbatim** — evidence_quote copied character-for-character from source turn
5. **Every candidate cites this episode** — source_episode_id = input episode
6. **Modality always tagged** — hypothetical, joking, quoted → tag accordingly, never silently normalise
7. **Negations preserved** — "I don't drink" keeps negation, modality = negated
8. **Transient states are not traits** — "tired today" → fact with fast/session decay, or omitted
9. **Compliments about agent are feedback** — feedback_event candidate, zero memory candidates
10. **Feedback candidates are not memories** — separate array, no kind/slot/source_type
11. **Third-party/pasted content is quoted** — modality = quoted, never user_stated
12. **Instructions-as-memory require user's own wording** — boundary needs user directive
13. **Inference is labelled inference** — derived claims → source_type = agent_inferred
14. **Non-salient turns emit nothing** — empty arrays are correct
15. **Slot discipline** — use registered slot keys only; slot = null if none fits
16. **No admission side effects** — extraction writes nothing; outputs candidates only

## Error Handling

- **invalid_output**: output fails strict schema → retry once with same input, then discard whole
- **unavailable**: model could not be called → defer (episode remains unextracted)
- **empty_input**: zero turns → return empty arrays (not an error)
- **Partial candidate arrays from failed output are discarded whole** — never salvaged field by field

## Model Comparison (tested 2026-10-24)

| Model | Score (11 cases, 22 checks) | Input /1M | Output /1M | Notes |
|---|---|---|---|---|
| `google/gemini-3.8-flash` | 22/22 (100%) | $0.83 | $4.12 | Better at subtle rules (assistant suggestions) |
| `anthropic/claude-haiku-5.5` | 21/22 (95.5%) | $0.10 | $0.50 | 8x cheaper, one failure on assistant-suggestion rule |

**Recommendation:** Use Haiku 5.5 for cost. Use Gemini when accuracy on subtle rules matters more. Make model configurable via env var.

## Validation Gate (deterministic, no LLM)

After extraction, candidates pass through a deterministic gate:
- Provenance: source_turn_id, source_episode_id, evidence_quote all required
- Coherence: source_turn's episode_id must match source_episode_id
- Speaker: user_stated/user_confirmed must cite role=user turn
- Evidence: evidence_quote must be verbatim substring of source turn content
- Slot: must exist in slot_registry (if provided)
- Modality: must be valid enum
- Boundary: requires user_stated/user_confirmed/user_edited source

Failed candidates are quarantined with a healing_log entry. Never admitted.

## Slot Registry Seeding

Seed common slots synchronously in the constructor (don't use async writes):
```typescript
const slots = [
  { slot: 'name', kind: 'fact', cardinality: 'single', decay_class: 'exempt', profile_included: 1 },
  { slot: 'home_city', kind: 'fact', cardinality: 'single', decay_class: 'slow', profile_included: 1 },
  { slot: 'interest', kind: 'interest', cardinality: 'multi', decay_class: 'medium', profile_included: 1 },
  { slot: 'preference', kind: 'preference', cardinality: 'multi', decay_class: 'medium', profile_included: 1 },
];
const db = this.storage.getDb();
for (const s of slots) {
  db.prepare('INSERT OR IGNORE INTO slot_registry (...) VALUES (?, ...)').run(...);
}
```

## OpenRouter Integration

- API key is in `~/.localrc` (NOT `~/.hermes/.env` which has it commented out)
- Source it: `source ~/.localrc` before calling curl
- Use `response_format: { type: 'json_object' }` for structured output
- Model configurable via `SEME_EXTRACTOR_MODEL` env var

## Pitfalls

- **LLM invents slot keys** — register common slots, gate rejects unregistered ones
- **value_json must be stringified** before SQLite insert (better-sqlite3 doesn't auto-stringify)
- **Partial extraction failure** — one candidate failing shouldn't abort the whole batch; wrap per-candidate in try/catch
- **Async extraction** — end_session triggers extraction but returns immediately; profile may be empty until extraction completes
- **Model version stamping** — stamp extractor_version on every candidate for auditability
