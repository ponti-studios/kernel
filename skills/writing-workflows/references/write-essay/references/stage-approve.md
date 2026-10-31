---
title: Stage 5 — Approve
knowledge_type: process
domain: vault/content/writing-pipeline
scope: executing-writing-pipeline-stage
status: active
updated: 2026-08-25
applies_to:
---
# Stage 5 — Approve

Sixth stage. Freeze the essay.

## Action

1. Final read against the style contract.
2. Stamp a version (e.g., `v1.0`).
3. Freeze. The approved essay is now the single source of truth.
4. Deliver the approved essay in the requested medium. Save a file when requested
   or when the task already establishes an output directory. Use that directory
   or `$KERNEL_WRITE_OUTPUT_DIR`; do not default to a user's Desktop. Preserve
   existing versions and avoid overwriting a different artifact with the same slug.

## Gate

- The essay is versioned and frozen.
- The approved essay is delivered; any requested file exists at the reported path.
- From here, derived artifacts build on the approved essay — never the raw notes.

## Output

Return the frozen essay prefixed with a version line:

```
# v1.0 — <title>

[Frozen essay — title + body, no headers, no fences]
```

