---
title: Vault Maintenance Contract
id: vault.maintenance-contract
knowledge_type: contract
domain: vault
scope: maintaining-vault-structure-and-metadata
status: active
updated: 2026-08-27
applies_to:
  - "notes/**"
  - "references/**"
  - "_distilled/**"
  - "tasks/**"
---

# Vault Maintenance Contract

## Structure and ownership

- `notes/` holds captures, durable notes, essays, and scripts. Publish intent is frontmatter, not directory location.
- `references/` holds source-derived material.
- `ponti-studios/` is owned by [project-operations](../WORKFLOW.md); do not infer a project lifecycle from a folder name.
- Do not create a new top-level vault directory without user direction.

## Note and essay invariants

- Every Markdown note has frontmatter. Notes and essays in `notes/` require `slug`, `updated`, `status`, `visibility`, `title`, and `type`.
- `slug` MUST match the filename without `.md`.
- Organized captures use dot-namespaced, lowercase filenames. Variants use `.branch` or `.pt2` and retain `related` links.
- A publish-track essay uses `type: essay` plus `category`, `description`, `pubDate`, and `tags`.

## Safe changes

- Before moving or renaming, search the vault for the old filename and slug; update affected wikilinks and `related` fields in the same change.
- Compare bodies before deleting a suspected duplicate. Variants with distinct content survive.
- Preserve author voice and intellectual position when organizing captures. Move valid files as-is; repair only invalid metadata or placement.

## Routing

