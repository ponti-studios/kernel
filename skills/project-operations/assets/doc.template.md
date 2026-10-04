---
title: Project Document
knowledge_type: template
domain: ponti-studios/projects
scope: authoring-project-documents
status: active
updated: 2026-08-26
scaffold:
  project: <project-id>
  doc_type: spec | research | case-study | note
  status: draft
  visibility: internal
---

# Project Document Template

One template for all studio project documents. Pick the `doc_type`, keep its section block, drop the rest. Compose from context — produce a filled document, never a template with placeholders.

## Frontmatter

```yaml
---
title: <Human-readable title>
project: <project-id>
doc_type: spec | research | case-study | note
status: draft | current | proposed | completed | archived
visibility: private | internal | public
updated: <YYYY-MM-DD>
---
```

## Section library by doc_type

### `spec` — PRD / technical design

**PRD flavor:** Context · Objectives (success metrics) · Requirements (functional + non-functional) · Acceptance Criteria (testable) · Technical Considerations · Open Questions

**Technical-design flavor:** Context · Decision · Alternatives Considered · Rationale · Implementation · Trade-offs

Both live under `doc_type: spec`; the flavor is a section choice, not a type.

### `research`

Research Question · Methodology · Participants · Key Findings · Recommendations · Sources

### `case-study`

The Challenge (problem + key problems) · The Solution (approach + Technical Architecture subsection) · Progress & Outcomes (status, metrics, milestones) · Next Steps

### `note` — meetings, short notes, feature lists

**Meeting flavor:** Attendees (Name, Role) · Agenda · Decisions (— Owner: @name — Due:) · Action Items · Notes

**Lightweight flavor:** plain categorized bullet lists (`- Category A` → items with P0/P1/planned markers). Use when a full structure would be heavier than the content.
