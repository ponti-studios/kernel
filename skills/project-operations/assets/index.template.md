---
title: {{Project Title}}
project: {{project-slug}}
type: index
status: idea
owner: charlesponti
tags:
  - {{project-slug}}
---

# {{Project Title}}

_{{One or two sentences: what this is and why it exists.}}_

**Source:** {{path to the actual code repo/route, if any — omit if this
is a business/product idea with no code yet}}

Status lives in this file's frontmatter — see
`.agents/skills/project-operations/references/convention.md` for why nothing
else in this project restates it in prose.

## Docs

| Doc | Purpose |
| --- | ------- |
{{Only list files that actually exist. Don't create current-state.md or
architecture.md until the project is big enough to need them split out
of this file.}}

## Changes

In-progress work lives in `changes/`; finished work is in
`changes/archive/`. Don't hand-maintain a status summary here — run
`scripts/scan_changes.py --project {{project-slug}}` for the current
picture.
