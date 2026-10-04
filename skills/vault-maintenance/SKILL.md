---
name: vault-maintenance
description: Safely organize, move, rename, and validate material in this Obsidian vault. Use for vault structure, note metadata, links, and knowledge-index maintenance; not for project operations or content transformation.
license: MIT
when:
  - organizing, moving, renaming, or validating Obsidian vault material
  - changing note structure, metadata, links, or the knowledge index
outputs:
  - vault change with preserved links and frontmatter
termination:
  - supplied validators pass after structural changes
  - links and frontmatter validate against vault canon
argumentHint: the vault maintenance task
---

# Vault Maintenance

Load the applicable vault canon before changing vault material. Preserve links and frontmatter; use the supplied validators after structural changes.

- For note placement, naming, frontmatter, and moves: `vault.maintenance-contract`.
- For agent knowledge, canon, and generated discovery: `vault.knowledge-index-contract`.
- For project work under `ponti-studios/`, use `project-operations` instead.
- For inbox processing, distillation, writing, or transcript work, route to the specialist skill.

## Canon (inlined)

Migrated from `Documents/agents/canon/` — read the applicable file before acting:

- `references/canon-knowledge-index-contract.md`
- `references/canon-maintenance-contract.md`
