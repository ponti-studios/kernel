---
name: write-essay
description: Develop an approved short-form content essay through direction, draft, critique, edit, approval, and derivation into posts or video. Use only when the requested output is essay-first or derived from an approved essay; not for direct-to-camera scripts (write-video-script).
license: MIT
when:
  - developing an approved essay through direction, draft, critique, edit, and approval
  - deriving posts or video from an approved essay
  - working essay-first rather than thought-to-camera
outputs:
  - approved essay artifact per the stage references
  - derived posts or video script only after approval
termination:
  - approval stage checks pass
  - derivations are self-contained and traceable to the approved essay
argumentHint: the essay goal and source material
---

# Write Essay

This workflow owns the approved-essay trunk. Run the stages in order and load only the stage needed next.

1. Intake and direction: `references/stages/intake.md`, `references/stages/direction.md`.
2. Draft, critique, edit, and approve: the corresponding stage references.
3. Derive self-contained posts or video only after approval: `references/extract-posts.md`, `references/video.md`, and `references/video-production.md`.

For a raw thought-to-camera script, use `write-video-script`.

## Canon (inlined)

Migrated from `Documents/agents/canon/` — read the applicable file before acting:

- `references/canon-brand-copy.md`
- `references/canon-style-contract.md`
- `references/canon-voice-foundation.md`
