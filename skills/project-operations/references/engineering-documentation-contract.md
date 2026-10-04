---
title: Engineering Documentation Contract
knowledge_type: contract
domain: ponti-studios/projects
scope: documenting-engineering-work
status: active
updated: 2026-08-25
slug: engineering-documentation-contract
applies_to: []
---
# Engineering Documentation Contract

`projects/` catalog — migrated from `projects/engineering/` 2026-08-24.

```text
~/Developer/<repo> → runs/builds/deploys
projects/<name>/engineering → catalog (what/why/boundary/deps/next)
projects/<name>/index → product intent
```

If repo vs catalog disagree, fix catalog unless product decision (record in `architecture.md`).

## One page per boundary

Answer: what/why/owns/deps/non-goals/next decision/source.

Frontmatter:
```yaml
title:
type: component | product | repository | service
status: active | experimental | planned | historical | unknown
repository: ~/Developer/<repo>
canonical_docs: ~/Developer/<repo>/README.md
updated: YYYY-MM-DD
```

No copy of file trees/commands — link to repo.

## Status

`active` (maintained) · `experimental` (validating) · `planned` (no impl) · `historical` (context) · `unknown` (verify before promote)

## Review

Role change → update page + `projects/_index.md` + diagram in same change. Don't invent platform name to hide missing impl.
