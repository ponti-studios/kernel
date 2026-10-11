---
name: write-document
description: Draft or restructure a standalone business, product, or project document using the appropriate reusable template. Use for a single document artifact; not for repo docs/PRDs (write-docs), dossiers (write-dossier), essays, or briefs.
license: MIT
when:
  - drafting or restructuring a standalone business, product, or project document
  - choosing a reusable document template for a document artifact
outputs:
  - drafted or restructured document with placeholders removed
termination:
  - document matches the chosen template shape
  - no generic placeholder sections remain
argumentHint: the document to draft or restructure
---

# Document Authoring

Read `references/write-document.md` to choose the document shape. Adapt the matching asset under `assets/general/` or `assets/project/`; remove placeholder sections rather than shipping a generic template.

For project ownership, lifecycle, or where a document belongs, load `project-operations` first. For workshops or dossiers, use their dedicated skills.

## Canon (inlined)

Migrated from `Documents/agents/canon/` — read the applicable file before acting:

- `references/canon-brand-copy.md`
- `references/canon-brand-editing.md`
- `references/canon-principles.md`
