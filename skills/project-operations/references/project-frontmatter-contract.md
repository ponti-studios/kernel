---
title: Project Frontmatter Contract
slug: ponti-studios-project-frontmatter-contract
description: Canonical metadata contract for Ponti Studios project records and project documents.
knowledge_type: contract
domain: ponti-studios/projects
scope: creating-or-editing-project-docs
applies_to:
  - "ponti-studios/**"
status: active
visibility: private
owner: charlesponti
tags: [ponti-studios, projects, frontmatter, metadata]
updated: 2026-08-25
---

# Project Frontmatter Contract

Folder paths identify where a project lives. Frontmatter describes what it is and what state it is in. Do not encode lifecycle in directory names.

## Canonical project fields

Every project entry document should have:

```yaml
id: <stable-kebab-case-identity>
title: <human-readable-name>
doc_type: project
lifecycle: idea | discovery | active | paused | shipped | archived | review
visibility: private | internal | public
updated: YYYY-MM-DD
tags: []
```

Optional project fields:

```yaml
repository: ~/Developer/<repo>
canonical_docs: ~/Developer/<repo>/README.md
owner: charlesponti
client: <client-or-null>
start_date: YYYY-MM-DD
end_date: YYYY-MM-DD
```

## Canonical document fields

Project documents should identify their owner and role:

```yaml
project: <canonical-project-id>
doc_type: brief | decision | research | spec | task | reference | case-study | note
status: draft | current | proposed | completed | archived
visibility: private | internal | public
updated: YYYY-MM-DD
```

`project` means ownership. Use separate fields for other relationships:

- `series` — a creative or editorial series
- `source_project` — the project a portfolio narrative is derived from
- `repository` — a code location
- `parent` — the owning platform or monorepo when a surface has its own working directory
- `surface` — the product or application surface represented by a child body of work

## Legacy fields

Existing `type` and `status` fields remain during migration so current queries and links do not break. New or edited documents should use `doc_type` and `lifecycle` for the canonical meanings. Legacy fields can be removed after all queries are migrated.

## State vocabulary

Use lifecycle values consistently:

| Value | Meaning |
| --- | --- |
| `idea` | Uncommitted possibility |
| `discovery` | Being investigated or shaped |
| `active` | Currently receiving meaningful work |
| `paused` | Intentionally stopped, not abandoned |
| `shipped` | Delivered but still relevant |
| `archived` | Historical, completed, or no longer maintained |
| `review` | Identity or ownership is unresolved |

Publication is separate from project lifecycle. Portfolio documents use `publication: draft | ready | published | retired`.

## Migration rule

Normalize project entry documents first. Normalize project notes only when they are edited or when a batch migration has a clear owner and validation result.
