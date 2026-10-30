# Performance Benchmarking for Memory/Extraction Systems

## JSONL Baseline Format

Store baselines as JSONL (one JSON object per line) in a `perf/` directory. Each entry:
```json
{"timestamp":"2026-10-24T18:30:00Z","label":"v1-tonight-baseline","git_commit":"abc1234","store_size":{"memories":120,"turns":245,"episodes":146},"results":{"record_turn":{"count":100,"min_ms":0.07,"mean_ms":0.11,"p50_ms":0.08,"p95_ms":0.28,"p99_ms":0.58,"max_ms":1.26}}}
```

## Key Metrics

For each operation, measure: count, min, mean, p50, p95, p99, max (in ms).

- **p50 (median)**: typical latency
- **p95**: tail latency for 95% of requests
- **p99**: worst-case tail latency
- **p99 is the number to evaluate against** — it captures GC pauses, lock contention, and cold-cache effects

## Benchmark Design

1. **Warm up**: Run each operation a few times before measuring to prime caches
2. **N=100** is a good default for fast operations (record_turn, retrieve_context)
3. **N=20** for slower operations (end_session with extraction, boundary_command)
4. **Seed realistic data**: 120 memories, 245 turns, 146 episodes (not empty DB)
5. **Measure wall-clock time** per operation, not just DB query time
6. **Include async extraction wait**: end_session triggers background extraction; measure the sync ack time, then wait for extraction to settle before next test

## Comparing Baselines

```bash
# View all baselines
cat perf/baseline.jsonl | python3 -m json.tool  # one at a time
# Or parse in Python
python3 -c "import json; [print(json.dumps(json.loads(l), indent=2)) for l in open('perf/baseline.jsonl')]"
```

## Pitfalls

- **Don't benchmark against empty DB** — seed realistic data first (120+ memories)
- **Async extraction inflates end_session** — measure sync ack time only, wait for extraction separately
- **GC pauses** — Node.js GC can cause p99 spikes; run with `--expose-gc` if needed
- **Lock contention** — SQLite write lock can cause p99 spikes under concurrent load; use single-writer queue
- **Cold cache** — first run after restart is slower; warm up before measuring
