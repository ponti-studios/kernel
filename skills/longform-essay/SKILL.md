---
name: longform-essay
description: Rewrite source material into a 900–1200 word vault essay in the Ponti voice. Use for longform transformation; not for the shorter approved-essay content pipeline.
license: MIT
when:
  - rewriting source material into a 900-1200 word vault essay
  - writing longform transformation in the Ponti voice
outputs:
  - 900-1200 word vault essay per references/contract.md gates
termination:
  - scripts/check_essay.py passes
  - one claim and metaphor per essay with source-supported evidence
argumentHint: the source material to rewrite
---

# Longform Essay

Read the longform contract, rewrite process, and voice contract before drafting. Keep one claim and metaphor per essay, use only source-supported evidence, run `scripts/check_essay.py`, and archive only the source material the workflow consumes.

References: `references/contract.md` (binding gates), `references/process.md` (ordered steps), `references/voice.md` (voice contract — the seven New Yorker Instruments), `references/exemplars.md` (approved exemplar passages).

## Canon (inlined)

Migrated from `Documents/agents/canon/` — read the applicable file before acting:

- `references/canon-maintenance-contract.md`
- `references/canon-style-contract.md`
- `references/canon-voice-foundation.md`
