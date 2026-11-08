# Performance Benchmarking for Node.js Services

Measure operation latency, compute percentiles, and track over time in a JSONL baseline file.

## When to Use

- Need p50/p95/p99 latency numbers for service operations
- Tracking performance regressions across commits
- Establishing baselines before/after optimization work

## Pattern: JSONL Baseline

Each line in `perf/baseline.jsonl` is a JSON object:

```json
{
  "timestamp": "2026-10-24T18:30:00Z",
  "label": "v1-tonight-baseline",
  "git_commit": "45e976a",
  "store_size": { "memories": 120, "turns": 245, "episodes": 146 },
  "results": {
    "record_turn": {
      "count": 100,
      "min_ms": 0.07,
      "mean_ms": 0.11,
      "p50_ms": 0.08,
      "p95_ms": 0.28,
      "p99_ms": 0.58,
      "max_ms": 1.26
    }
  }
}
```

## Benchmark Script Structure

```typescript
// src/benchmarks/perf.ts
import { MemoryService } from "../api/service.js";

const N = 100;
const STORAGE_DIR = "/tmp/scratchpad/perf-bench";

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

async function bench(
  label: string,
  fn: () => Promise<void>,
  count: number,
): Promise<Record<string, number>> {
  const times: number[] = [];
  for (let i = 0; i < count; i++) {
    const start = performance.now();
    await fn();
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  return {
    count,
    min_ms: +times[0].toFixed(2),
    mean_ms: +(times.reduce((a, b) => a + b, 0) / times.length).toFixed(2),
    p50_ms: +percentile(times, 50).toFixed(2),
    p95_ms: +percentile(times, 95).toFixed(2),
    p99_ms: +percentile(times, 99).toFixed(2),
    max_ms: +times[times.length - 1].toFixed(2),
  };
}
```

## Key Patterns

### Fresh store per run

Use a temp directory (`/tmp/scratchpad/...`) and clean it before each run. Don't benchmark against a production database.

### Async extraction settling

If the service triggers background extraction (fire-and-forget), wait for it to settle before measuring store size. Use `await new Promise(r => setTimeout(r, 5000))` or track pending extraction promises.

### Store size reporting

Include `memories`, `turns`, `episodes` counts in the baseline so future runs can compare against the same data volume.

### Labeling

Use descriptive labels: `v1-tonight-baseline`, `post-sleep-job`, `post-all-issues`. Include the git commit hash for traceability.

### Appending baselines

Append new baselines as new lines (don't overwrite). This creates a time series for comparison:

```bash
node dist/benchmarks/perf.js >> perf/baseline.jsonl  # append
```

### Comparing baselines

Use `jq` or a small script to diff two lines:

```bash
# Show p99 for record_turn across all baselines
jq -r '.results.record_turn.p99_ms' perf/baseline.jsonl
```

## Pitfalls

- **Don't benchmark with LLM calls in the hot path.** If the operation under test triggers LLM extraction, the latency will be dominated by the LLM call. Benchmark the sync operations (record_turn, remember_command, retrieve_context) separately from async extraction.
- **Clean up temp dirs.** Benchmark runs create SQLite databases in /tmp/scratchpad. Clean them before each run to avoid stale data affecting results.
- **Wait for async operations.** If end_session triggers background extraction, wait for it to complete before reporting store size. Otherwise store_size will be understated.
- **Use performance.now(), not Date.now().** `performance.now()` has sub-millisecond resolution; `Date.now()` is millisecond-granular and will round small latencies to 0 or 1.
- **Sort times before computing percentiles.** Percentile calculation requires sorted input.
- **Don't include warmup in measurements.** Run a few iterations before timing to warm up the SQLite cache and V8 JIT.
