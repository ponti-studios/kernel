---
name: project-operations
description: Create, maintain, and operate Ponti Studios projects under `ponti-studios/`, including lifecycle metadata, work tracking, documentation, staffing, and project decisions. Do not use for general vault organization or standalone writing.
license: MIT
when:
  - creating, maintaining, or operating Ponti Studios projects under ponti-studios/
  - changing project lifecycle, work tracking, documentation, or staffing
outputs:
  - project change per the matching reference (frontmatter, work-tracking, docs, ops)
termination:
  - project frontmatter and identity-map contracts validate
  - work-tracking state (planned, active, archived) is consistent
argumentHint: the project operation to perform
---

# Project Operations

Read the matching reference before changing a project. Project identity, lifecycle, and work tracking are binding; documents and operations use the specific reference that matches the request.

- Start with `references/project-frontmatter-contract.md` and `references/project-identity-map.md` for structural changes.
- Use `references/work-tracking.md` for planned, active, and archived change work.
- Use `references/documentation.md` and `references/engineering-documentation-contract.md` for project documentation.
- Load operational references only for the requested activity (discovery, hiring, onboarding, collaboration, marketing, email, or metrics).

## Canon (inlined)

Migrated from `Documents/agents/canon/` — read the applicable file before acting:

- `references/canon-brand-voice.md`
- `references/canon-current-system.md`
- `references/canon-maintenance-contract.md`
- `references/canon-manifesto.md`
- `references/canon-missions.md`
- `references/canon-mottos.md`
- `references/canon-north-star.md`
- `references/canon-principles.md`
- `references/canon-vision.md`
