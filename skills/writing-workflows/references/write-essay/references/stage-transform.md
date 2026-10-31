---
title: Stage 6 — Transform
knowledge_type: process
domain: vault/content/writing-pipeline
scope: executing-writing-pipeline-stage
status: active
updated: 2026-08-25
applies_to:
---
# Stage 6 — Transform

Seventh stage. Derive secondary artifacts from the approved essay.

## Rules

- Each derived artifact is **self-contained** — it must stand alone without reading the essay.
- Derived from the approved essay, never the raw notes.
- Each derived artifact re-enters the pipeline at Stage 3 (critique) for a lighter pass before it moves on.
- Deliver each requested derivative in the requested medium. When files are part
  of the task, use the established output directory or `$KERNEL_WRITE_OUTPUT_DIR`,
  preserve the approved source version, and avoid overwriting existing artifacts.

## Contracts

| Derived artifact | Load | Written as |
|---|---|---|
| Long-form X post + TikTok clip ideas | `./extract-posts.md` | `<slug>-v<version>-x-post.md`, `<slug>-v<version>-tiktok-clips.md` |
| Short-form video script | `./video.md` (fuller: `./creator-contract.md`) | `<slug>-v<version>-video-script.md` |
| Production plan for recorded scripts | `./video-production.md` | — (not written; internal planning only) |

## Gate

- Derived artifacts are self-contained.
- Derived artifacts trace to the approved essay, not the source.
- Requested derivatives are delivered; requested files exist at their reported paths.
