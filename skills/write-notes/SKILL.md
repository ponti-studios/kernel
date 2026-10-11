---
name: write-notes
description: Distill a substantial capture, transcript, or draft into durable, cross-linked vault notes. Use for structural knowledge extraction; not inbox-triage routing or essay writing.
license: MIT
when:
  - distilling a substantial capture, transcript, or draft into durable vault notes
  - extracting structural knowledge with cross-links
outputs:
  - atomic cross-linked vault notes per references/distillation-process.md
termination:
  - scripts/check_distillation.py passes
  - every extracted unit is accounted for with a canonical home
argumentHint: the capture, transcript, or draft to distill
---

# Write Notes

Read `references/distillation-process.md` before work. Find an existing canonical home before creating a note, preserve the author's intellectual ownership, account for every extracted unit, and validate the result with `scripts/check_distillation.py`.

## Canon (inlined)

Migrated from `Documents/agents/canon/` — read the applicable file before acting:

- `references/canon-collaboration-standard.md`
- `references/canon-maintenance-contract.md`
