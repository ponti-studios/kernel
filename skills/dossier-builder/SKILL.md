---
name: dossier-builder
description: Assemble a coherent business dossier from selected sections, including section review and final assembly review. Use for dossiers only; use document-authoring for a single ordinary document.
license: MIT
when:
  - assembling a business dossier from selected sections
  - reviewing dossier sections and final assembly
outputs:
  - assembled dossier with reviewed and frozen sections
termination:
  - each section passes generate-review-edit cycle
  - assembly review passes after all sections complete
argumentHint: the dossier sections to assemble
---

# Dossier Builder

Read `references/dossier.md` and `references/orchestrator.md` before assembling. Generate, review, edit, and freeze sections independently; run assembly review only after the selected sections are complete.

## Canon (inlined)

Migrated from `Documents/agents/canon/` — read the applicable file before acting:

- `references/canon-brand-copy.md`
- `references/canon-principles.md`
