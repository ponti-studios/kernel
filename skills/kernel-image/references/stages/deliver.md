# Stage 3 — Deliver

Goal: confirm the artwork landed and offer a clear next step.

## Steps

1. Report all 3 output folders to the user (each under `~/Desktop/<slug>-<timestamp>/`,
   containing that variant's `image.<ext>` and `brief.md`).
2. Offer next steps: generate a fresh batch of 3 with a tweaked prompt, try a
   different model, or stop here. If the user wants a revision, loop back to
   the brief stage rather than re-running intake from scratch — only re-ask
   the specific categories that need to change. A revision always produces a
   new batch of 3, never a single image.

## Gate

The user has all 3 output folder paths and knows how to ask for another
batch. Don't end the turn with only "done" — name the actual paths.
