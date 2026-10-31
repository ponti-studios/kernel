# Knowledge Graph Reference

## Recursive CTE Traversal (SQLite)

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

## Entity Types
person, place, organization, project, tool, concept, topic, preference, other

## Relationship Types
works_at, lives_in, located_in, likes, uses, prefers, knows, created, moved_to, married_to, is_a, related_to

## Entity Resolution Rules
- Find neighbours: same name (case-insensitive) or alias match
- Rule 1: NOOP — same canonical name + type, no new info
- Rule 2: MERGE — same canonical name, new aliases or higher confidence
- Rule 3: ADD — new entity (different name or type)
- Alias matching: if candidate name matches an incumbent alias, it's a MERGE (not NOOP)
- On merge: merge aliases, update mention_count, last_seen_at, confidence, description

## Relationship Resolution Rules
- Find by source_id + target_id + relation_type
- Rule 1: NOOP — same source, target, type, no new info
- Rule 2: MERGE — same source, target, type, new evidence → increment mention_count, update last_seen_at, increase weight
- Rule 3: ADD — new relationship
- Weight calculation: 1.0 - (1.0 / mention_count)

## Graph-Aware Retrieval Scoring
- Direct match (entity found in query): score 1.0
- 1-hop (neighbor of matched entity): score 0.7
- 2-hop (neighbor of neighbor): score 0.4
- Combine with FTS + keyword search, deduplicate
- Include graph_summary in context bundle (entity names, types, relationships)
- Abstain if no entities found and no memory matches

## Sleep Job Graph Maintenance
1. Graph dedup: merge entities with same canonical name + type. Merge aliases, update mention_count, last_seen_at, confidence. Update all FK references (entity_memory_links, entity_turn_links, relationships source_id/target_id) before deleting candidate.
2. Graph contradiction: flag single-valued relationships (lives_in, works_at, married_to, located_in) where an entity has multiple distinct targets. Flag entities with conflicting types (same name, different type).
3. Graph decay: decay entity confidence (90-day half-life) and relationship weight (60-day half-life). Archive entities with confidence < 0.3 and mention_count < 2. Archive relationships with confidence < 0.2.

## Graph Storage (SQLite)
- Recursive CTEs for BFS traversal (see above)
- Store entity-memory links (many-to-many) and entity-turn links (provenance)
- Use INSERT OR IGNORE for link tables (idempotent)
- Indexes: idx_entities_name, idx_entities_type, idx_rel_source, idx_rel_target, idx_rel_type

## API Endpoints
- GET /entities — list (type filter, search, pagination)
- GET /entities/:id — get with relationships
- GET /entities/name/:name — get by name (alias match)
- POST /entities — create manually
- PUT /entities/:id — update
- DELETE /entities/:id — delete (cascade)
- GET /relationships — list (source/target/type filters)
- POST /relationships — create manually
- DELETE /relationships/:id — delete
- GET /graph/neighborhood/:entityId — N-hop BFS
- GET /graph/path/:from/:to — shortest path
- GET /graph/snapshot — full graph
- POST /graph/search — hybrid search

## Pitfalls
- "User" as entity name: LLM often extracts "User" as source entity in relationships, but "User" is not in entities array. Skip relationships where entities don't exist (rule_0_entities_not_found).
- Entity FK constraints: relationships reference entities(id). Ensure entities are resolved before creating relationships.
- Graph traversal depth: Default 2 hops. Deeper is expensive. Use t.path NOT LIKE to prevent cycles.
- Recursive CTE performance: efficient for small graphs. For large graphs, limit depth and use indexes.
- Graph dedup must update ALL foreign key references before deleting candidate entity. Missing a link table update leaves orphaned references.
- Relationship creation requires source_turn_id and source_episode_id (NOT NULL FKs). When creating relationships manually via API, these must be provided from a recorded turn/episode. The extraction pipeline always provides them automatically.
- Graph-aware retrieval scoring: direct match 1.0, 1-hop 0.7, 2-hop 0.4. Combine with FTS + keyword search, deduplicate.