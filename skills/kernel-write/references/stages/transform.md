# Stage 6 — Transform

Seventh stage. Derive secondary artifacts from the approved essay.

## Rules

- Each derived artifact is **self-contained** — it must stand alone without reading the essay.
- Derived from the approved essay, never the raw notes.
- Each derived artifact re-enters the pipeline at Stage 3 (critique) for a lighter pass before it moves on.
- After an artifact passes its critique pass, write it to
  `<output-dir>/<slug>-v<version>-<artifact>.md`, where `<output-dir>` is
  `$KERNEL_WRITE_OUTPUT_DIR` if set, else `~/Desktop`; `<slug>-v<version>`
  matches the approved essay's own filename; and `<artifact>` is `x-post`,
  `tiktok-clips`, or `video-script`. One file per derived artifact. Always do
  this, regardless of whether the user asked for a file.

## Contracts

| Derived artifact | Load | Written as |
|---|---|---|
| Long-form X post + TikTok clip ideas | `../extract-posts.md` | `<slug>-v<version>-x-post.md`, `<slug>-v<version>-tiktok-clips.md` |
| Short-form video script | `../video.md` (fuller: `../creator-contract.md`) | `<slug>-v<version>-video-script.md` |
| Production plan for recorded scripts | `../video-production.md` | — (not written; internal planning only) |

## Gate

- Derived artifacts are self-contained.
- Derived artifacts trace to the approved essay, not the source.
- Each derived artifact has been written to `$KERNEL_WRITE_OUTPUT_DIR` (default `~/Desktop`).
