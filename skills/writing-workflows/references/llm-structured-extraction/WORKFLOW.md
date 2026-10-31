# LLM-Based Structured Data Extraction

The memory-store schemas and service names below describe one application adapter.
Use them only when the target project implements those contracts. For other
extraction tasks, define the requested output schema and provenance rules first;
do not introduce a memory system or database as a side effect.

Extract structured, typed data from unstructured text using LLMs with strict schema validation, retry logic, and deterministic post-processing.

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

- **Markdown fence stripping**: LLMs sometimes wrap JSON in ```json fences even with `response_format: json_object`. Always strip before parsing: `content.trim().replace(/^```(?:json)?\\n?/, '').replace(/\\n?```$/, '').trim()`. Apply to both memory extractor and entity extractor. Pattern: strip fences, then JSON.parse, then validate.
- **invalid_output**: output fails strict schema → retry once with same input, then discard whole
- **unavailable**: model could not be called → defer (episode remains unextracted)
- **empty_input**: zero turns → return empty arrays (not an error)
- **Partial candidate arrays from failed output are discarded whole** — never salvaged field by field

## Model Comparison (tested 2026-10-24, updated 2026-10-25)

| Model | Score (13 cases, 31 checks) | Long Message (20+ facts) | Input /1M | Output /1M | Notes |
|---|---|---|---|---|---|
| `anthropic/claude-haiku-5.5` | 31/31 (100%) | 33/31 (100%+) | $0.10 | $0.50 | Only supported model. 7.5x cheaper than Gemini, more reliable, more thorough. |

**Recommendation:** Use Haiku 5.5 exclusively. Gemini has been removed — it was 7.5x more expensive and less reliable. Make model configurable via `SEME_EXTRACTOR_MODEL` env var for testing only.

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

## Entity/Relationship Extraction (Knowledge Graph)

When extracting entities and relationships alongside memories:

### Entity Extraction Prompt
- Extract named entities: people, places, organizations, projects, tools, concepts, topics, animals/pets, or any named thing
- Canonicalize names: "JS" → "JavaScript", "my wife Sarah" → "Sarah"
- Track aliases: if "John" and "Johnny" refer to the same person, include both as aliases
- Only extract entities the user mentioned or adopted
- Third-party/pasted content → modality=quoted, lower confidence (0.4)
- Every relationship must reference two extracted entities (source_entity_name and target_entity_name must be in entities array)
- Non-salient turns emit nothing. Empty arrays are correct.

### Entity Types
Any string. Common types: person, place, organization, project, tool, concept, topic, preference, animal, other, or any appropriate type. The LLM decides the most appropriate type. Do NOT maintain a hardcoded allowlist — validate only that it's a non-empty string, then normalize to lowercase. New types should emerge naturally from LLM output.

**Pitfall:** Gating LLM output on a manually-maintained allowlist causes silent extraction failures. When the LLM returns a valid type not in the allowlist (e.g., 'animal' for a pet name), validation throws invalid_output, and the entire entity extraction batch is discarded. Memories are still extracted, but no entities are created. The fix: accept any non-empty string type, normalize to lowercase, remove DB CHECK constraints. Never gate LLM output on a hardcoded dictionary.

### Relationship Types
works_at, lives_in, located_in, likes, uses, prefers, knows, created, moved_to, married_to, is_a, related_to

### Entity Resolution
- Find neighbours: same name (case-insensitive) or alias match
- Rule 1: NOOP — same canonical name + type, no new info
- Rule 2: MERGE — same canonical name, new aliases or higher confidence
- Rule 3: ADD — new entity (different name or type)
- Alias matching: if candidate name matches an incumbent alias, it's a MERGE (not NOOP)
- On merge: merge aliases, update mention_count, last_seen_at, confidence, description

### Relationship Resolution
- Find by source_id + target_id + relation_type
- Rule 1: NOOP — same source, target, type, no new info
- Rule 2: MERGE — same source, target, type, new evidence → increment mention_count, update last_seen_at, increase weight
- Rule 3: ADD — new relationship
- Weight calculation: 1.0 - (1.0 / mention_count)

### Graph Storage (SQLite)
- Recursive CTEs for BFS traversal:
```sql
WITH RECURSIVE traversal(entity_id, depth, path) AS (
    SELECT id, 0, id FROM entities WHERE id = ?
    UNION ALL
    SELECT r.target_id, t.depth + 1, t.path || ',' || r.target_id
    FROM traversal t
    JOIN relationships r ON r.source_id = t.entity_id
    WHERE t.depth < ? AND t.path NOT LIKE '%' || r.target_id || '%'
)
SELECT DISTINCT e.*, t.depth
FROM traversal t JOIN entities e ON e.id = t.entity_id
ORDER BY t.depth;
```
- Store entity-memory links (many-to-many) and entity-turn links (provenance)
- Use INSERT OR IGNORE for link tables (idempotent)

### Graph-Aware Retrieval
- Extract entities from query (simple name/alias matching against graph)
- BFS traversal 1-2 hops from matched entities
- Collect linked memories, score by hop distance: direct 1.0, 1-hop 0.7, 2-hop 0.4
- Combine with FTS + keyword search, deduplicate
- Include graph_summary in context bundle (entity names, types, relationships)

### Pitfalls
- **"User" as entity name** — LLM often extracts "User" as a source entity in relationships, but "User" is not in the entities array. Either create a "User" entity from identity core, or skip relationships where entities don't exist. Skipping is simpler and avoids orphaned references.
- **Entity FK constraints** — relationships reference entities(id). Ensure entities are resolved (created) before creating relationships. The resolver must return the entity_id before relationship resolution.
- **Graph traversal depth** — Default 2 hops. Deeper traversal is expensive and rarely needed. Use `t.path NOT LIKE` to prevent cycles.
- **Recursive CTE performance** — SQLite recursive CTEs are efficient for small graphs. For large graphs, consider limiting traversal depth and using indexes on source_id/target_id.

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
- Use configured provider credentials from the environment or documented application configuration; do not source shell startup files to discover a key.
- Use `response_format: { type: 'json_object' }` for structured output
- Model configurable via `SEME_EXTRACTOR_MODEL` env var

## Pitfalls

- **LLM invents slot keys** — register common slots, gate rejects unregistered ones
- **validKinds must be updated in both places** — when adding new memory kinds, update both the extraction prompt KINDS list AND the validateOutput validKinds array. If validateOutput doesn't include the new kind, the LLM's valid output is rejected as invalid_output and extraction silently fails (returns 0 memories). This is a common oversight when expanding the kind taxonomy.
- **Decay class must be derived from kind, not hardcoded** — `rememberCommand` and other memory creation paths must use `getDecayClass(kind)` to set the decay class based on `KIND_DECAY_DEFAULTS`. Hardcoding `decay_class: 'medium'` means all memories decay at the same rate regardless of kind, defeating the purpose of kind-specific decay defaults (e.g., boundary=exempt, observation=fast, decision=slow).
- **Prompt strengthening for model failures** — when a model fails a specific rule, strengthen that rule with CRITICAL prefix, explicit examples of what counts/doesn't count, and negative examples. Re-run eval to verify fix. One model's failure may be another's success after prompt improvement.
- **isSupersede must check both candidate and incumbent slots** — The implementation must verify `candidate.slot` is non-null, `incumbent.slot` is non-null, AND `candidate.slot === incumbent.slot`. Checking only `candidate.slot` allows cross-slot supersession: two different single-valued slots (e.g., 'name' and 'home_city') both pass the cardinality check, causing the name memory to be superseded by the home_city memory. Always add `if (!incumbent.slot) return false; if (candidate.slot !== incumbent.slot) return false;` before the cardinality lookup.
- **Resolver supersession only on single-valued slots** — The resolver's SUPERSEDE rule only triggers when incumbent and candidate share a non-null single-valued slot (cardinality='single' in slot_registry). Unslotted memories (slot=null) are independent facts and never supersede each other. If you need correction/supersession on unslotted memories, use the explicit correctMemory API (user_edited supersession) rather than relying on the resolver.
- **Some kinds may need supersession on multi-valued slots** — Decisions are multi-valued by nature (you can make many decisions), but two decisions sharing the same subject+predicate with different values should supersede (the newer replaces the older). This requires a kind-specific resolver rule (e.g., Rule 14) that checks `kind === 'decision'` in addition to slot/value matching. Without this, conflicting decisions accumulate as independent facts.
- **Observation → candidate status** — Tentative, agent-inferred observations should start as `candidate` status (not `active`) and require corroboration (2+ episodes) to promote. Set status based on kind + source_type: if `kind === 'observation'` and source_type is agent-inferred, status = 'candidate'; otherwise 'active'. Profile compiler filters by `status = 'active'`, so candidates are excluded until promoted. Sleep job archives candidates with no corroboration after 90 days.
- **LLM non-determinism in evals** — Tests that depend on LLM extraction behavior (e.g., "hypothetical should not be stored as stated") can be flaky across runs. Don't assert on retrieval output alone. Instead, query the DB directly for modality/source_type and assert on those fields. A hypothetical extracted with modality='hypothetical' is correct behavior even if it appears in retrieval results.
- **Hypothetical modality** — The LLM sometimes extracts hypotheticals as stated facts despite prompt rules. Test should check modality in the DB, not just value_text. If the LLM tags it as 'hypothetical', that's a pass; only modality='stated' for a hypothetical is a failure.
- **Async extraction timing** — end_session triggers extraction in the background and returns immediately. Profile may be empty until extraction completes. Tests that depend on extraction should await its completion signal or poll with a bounded timeout; avoid fixed sleeps. Don't block the caller in production; use .then()/.catch() for background processing and log completion/failure.
- **Eval harness** — create test cases with checks functions. Run across multiple models. Report per-check pass/fail. Use OPENROUTER_API_KEY from ~/.localrc (not ~/.hermes/.env which has it commented out).
- **value_json must be stringified** before SQLite insert (better-sqlite3 doesn't auto-stringify)
- **Partial extraction failure** — one candidate failing shouldn't abort the whole batch; wrap per-candidate in try/catch
- **Async extraction** — end_session triggers extraction but returns immediately; profile may be empty until extraction completes
- **Model version stamping** — stamp extractor_version on every candidate for auditability
- **Entity extractor default model availability** — The entity extractor defaults to `anthropic/claude-haiku-5.5`, which may not be available on OpenRouter. If entity extraction fails with "Entity extractor unavailable", switch to `google/gemini-3.8-flash` via `SEME_EXTRACTOR_MODEL` env var. The memory extractor and entity extractor use the same model env var, so setting it once fixes both. Memory extraction may succeed (Haiku) while entity extraction fails (Haiku unavailable) — they are separate LLM calls.
- **Wiki compilation from entity-linked memories** — After entities and memories are created, link them via `entity_memory_links` (many-to-many). The WikiCompiler generates per-entity markdown pages by grouping linked memories by kind. Maturity: draft (default), stable (≥3 memories, ≥0.9 avg confidence), canonical (manual promotion). Each compile creates a version record for audit. Conflict detection: same slot, different value_text → conflict pair.
- **Long rambling messages (20+ facts)** — The LLM can extract all facts from long messages (31/31 with Haiku). Don't truncate or chunk the input — the LLM handles full messages well. The atomicity rule ("one candidate = one claim") is critical for completeness. Gemini Flash misses ~40% of facts from middle/later paragraphs; Haiku is strongly preferred for long messages. Wait sufficient time for async extraction (45s+ for long messages).
- **FTS5 query sanitization** — FTS5 MATCH queries throw syntax errors on special characters (?, *, ", (), etc.). Sanitize the query by replacing special chars with spaces before passing to FTS5. Without this, retrieval fails on natural language queries like "What is my name?" (the ? causes "fts5: syntax error near '?'").
- **Keyword matching punctuation stripping** — When doing fallback keyword matching (FTS5 fails), strip non-alphanumeric characters from query words before matching. "name?" won't match "name" in the memory text. Use `userMessage.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/)` to normalize.
- **RetrievalEngine needs graphStore** — The RetrievalEngine constructor must receive a GraphStore instance to perform graph-aware retrieval. Pass it via the MemoryService constructor. Without it, graph_summary is never populated and graph traversal is skipped.

## Profile Integration with Knowledge Graph

### Entity Section
Query entities with `profile_included = 1` and render:
```
## Entities
- {name} ({type}) — mentioned {mention_count} times
```

### Relationship Section
Query relationships between profile-included entities and render:
```
## Relationships
- {source_name} → {relation_type} → {target_name}
```

### Ordering
1. ## Profile (memory-derived content)
2. ## Entities (entity section)
3. ## Relationships (relationship section)

### Implementation Pattern
```typescript
const profileEntities = graphStore.listEntities(undefined, undefined, 100, 0).entities
  .filter(e => e.profile_included === 1);
if (profileEntities.length > 0) {
  lines.push('');
  lines.push('## Entities');
  for (const e of profileEntities) {
    lines.push(`- ${e.name} (${e.type}) — mentioned ${e.mention_count} times`);
  }
  const profileEntityIds = new Set(profileEntities.map(e => e.id));
  const snapshot = graphStore.getGraphSnapshot();
  const profileRels = snapshot.relationships.filter(r =>
    profileEntityIds.has(r.source_id) && profileEntityIds.has(r.target_id)
  );
  if (profileRels.length > 0) {
    lines.push('');
    lines.push('## Relationships');
    for (const r of profileRels) {
      const src = snapshot.entities.find(e => e.id === r.source_id);
      const tgt = snapshot.entities.find(e => e.id === r.target_id);
      lines.push(`- ${src?.name} → ${r.relation_type} → ${tgt?.name}`);
    }
  }
}
```

**Pitfall:** The profile compiler must accept a GraphStore instance (or create one from storage). Pass it via constructor to avoid creating multiple instances.

## Graph-Aware Retrieval Scoring

When integrating a knowledge graph into retrieval, score memories by hop distance:

- **Direct match** (entity found in query): score 1.0
- **1-hop** (neighbor of matched entity): score 0.7
- **2-hop** (neighbor of neighbor): score 0.4

Combine with existing FTS + keyword search, deduplicate across layers. Include a `graph_summary` in the context bundle with entity names, types, and relationships. Abstain if no entities found and no memory matches.

**Pitfall:** Entity lookup must check both canonical name AND aliases. A query mentioning "TS" should match an entity named "TypeScript" with alias "TS".

## Sleep Job Graph Maintenance

When a knowledge graph is present, the sleep job needs graph-specific steps:

1. **Graph dedup**: merge entities with same canonical name + type (case-insensitive). Merge aliases, update mention_count, last_seen_at, confidence. Update entity_memory_links and entity_turn_links to point to survivor. Update relationships (source_id/target_id) to point to survivor. Delete candidate entity.
2. **Graph contradiction**: flag single-valued relationships (lives_in, works_at, married_to, located_in) where an entity has multiple distinct targets. Flag entities with conflicting types (same name, different type).
3. **Graph decay**: decay entity confidence (90-day half-life) and relationship weight (60-day half-life). Archive entities with confidence < 0.3 and mention_count < 2. Archive relationships with confidence < 0.2.

**Pitfall:** Graph dedup must update ALL foreign key references before deleting the candidate entity. Missing a link table update leaves orphaned references.

## References

- [performance-benchmarking.md](references/performance-benchmarking.md) — JSONL baseline format, p50/p95/p99 measurement, benchmark design, pitfalls
- [knowledge-graph.md](references/knowledge-graph.md) — Graph storage, traversal, scoring, sleep job maintenance, API endpoints