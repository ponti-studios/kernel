# Stage 5 — Approve

Sixth stage. Freeze the essay.

## Action

1. Final read against the style contract.
2. Stamp a version (e.g., `v1.0`).
3. Freeze. The approved essay is now the single source of truth.

## Gate

- The essay is versioned and frozen.
- From here, derived artifacts build on the approved essay — never the raw notes.

## Output

Return the frozen essay prefixed with a version line:

```
# v1.0 — <title>

[Frozen essay — title + body, no headers, no fences]
```

