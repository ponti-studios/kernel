# Stage 5 — Approve

Sixth stage. Freeze the essay.

## Action

1. Final read against the style contract.
2. Stamp a version (e.g., `v1.0`).
3. Freeze. The approved essay is now the single source of truth.
4. Write the frozen essay to `<output-dir>/<slug>-v<version>.md`, where
   `<output-dir>` is `$KERNEL_WRITE_OUTPUT_DIR` if set, else `~/Desktop`, and
   `<slug>` is the title in kebab-case (e.g. `# v1.0 — The Taxidermy Instinct`
   → `the-taxidermy-instinct-v1.0.md`). Always do this, regardless of whether
   the user asked for a file. Overwrite if a file for the same slug and
   version already exists; do not overwrite a different version.

## Gate

- The essay is versioned and frozen.
- The frozen essay has been written to `$KERNEL_WRITE_OUTPUT_DIR` (default `~/Desktop`).
- From here, derived artifacts build on the approved essay — never the raw notes.

## Output

Return the frozen essay prefixed with a version line:

```
# v1.0 — <title>

[Frozen essay — title + body, no headers, no fences]
```

