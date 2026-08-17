---
name: write-incident-report
license: MIT
kind: skill
tags:
  - operations
  - incidents
  - reliability
when:
  - documenting a production issue, outage, regression, security event, or data problem
  - updating an existing incident report or incident index
outputs:
  - Evidence-backed incident report and updated incident index entry
termination:
  - Filename, ID, frontmatter, required sections, and index linkage are validated
  - Observed facts, inferences, unknowns, fix, and verification status are separated
description: Create or update repository incident reports in docs/incidents using the required numbered filename, strict YAML frontmatter, complete evidence-based sections, and incident-index entry. Use whenever an agent documents a production issue, outage, regression, security event, data problem, or operational failure.
---

# Write Incident Report

Create a finished, evidence-backed incident report for this repository. Reports
are operational records, not task summaries: distinguish observed facts from
inference, record the actual failure path, document the fix and verification
status, and leave future agents enough information to prevent recurrence.

## Workflow

1. Inspect `docs/incidents/README.md` and at least two recent reports before writing.
2. Determine the next numeric incident ID from existing filenames and frontmatter.
   Do not reuse an ID or silently renumber an existing report.
3. Gather concrete evidence from code, logs, tests, deployment records, or user
   reports. Mark unknown facts as `TBD`; never fill gaps with plausible details.
4. Create `docs/incidents/NNN-kebab-case-title.md` with the exact frontmatter
   contract below and all required body sections.
5. Add one row to the incident table in `docs/incidents/README.md`.
6. Validate frontmatter, filename/ID agreement, index linkage, and Markdown
   formatting before handing off.

## Required location and filename

All reports belong in `docs/incidents/` and use a three-digit, zero-padded ID:

```text
docs/incidents/NNN-short-kebab-case-title.md
```

The numeric filename, `id`, and README link must all agree. Choose the next
available ID after inspecting the directory; do not infer it from the number of
files because gaps may be intentional.

## Strict frontmatter contract

Use exactly these keys, in this order. Do not add project-specific keys unless
the repository schema is explicitly updated first.

```yaml
---
id: 13
title: "A concise user-visible incident title"
date: 2026-08-03
status: resolved
severity: high
category: service-area
services: [labs]
tags: [primary-tag, contributing-factor]
related_incidents: []
doc: app/path/to/primary-relevant-document.ts
---
```

Field rules:

- `id`: positive integer matching the filename and index row.
- `title`: quoted, human-readable, specific enough to identify the failure.
- `date`: ISO `YYYY-MM-DD`; use the incident date when known, otherwise the
  documentation date and say so in the body.
- `status`: one of `open`, `monitoring`, or `resolved`.
- `severity`: one of `low`, `medium`, `high`, or `critical`.
- `category`: lowercase kebab-case classification, not a sentence.
- `services`: non-empty YAML list of affected systems or products.
- `tags`: non-empty YAML list of lowercase kebab-case search terms.
- `related_incidents`: YAML list of numeric IDs; use `[]` when none apply.
- `doc`: repository-relative path to the primary code, runbook, or design
  document involved. Use `TBD` only when no such document exists.

Do not claim `resolved` until the remediation is deployed or otherwise applied.
If verification is blocked, keep the report factual and state the exact blocker
under Verification; do not convert an unrun test into a passing result.

## Required body format

Use these headings in this order. Keep the report concise, but do not omit a
section; write `TBD` with an explanation when evidence is unavailable.

```markdown
# [Same title as frontmatter]

## Symptom
What users, operators, or systems observed. Include dates, scope, and a concrete
example when available.

## Impact
Who or what was affected, what behavior was wrong, duration or exposure if known,
and what was not affected. Do not invent counts.

## Investigation
The evidence and checks performed, in chronological or causal order. Link to
relevant files, logs, tests, dashboards, commits, or external incident records.

## Root cause
The specific technical or process condition that made the symptom possible.
Separate primary cause from contributing factors and detection gaps.

## Fix
The changes made, including code/configuration/operational actions and any
backfill, rollback, or cleanup. State what remains intentionally unchanged.

## Verification
Commands, tests, production checks, or monitoring evidence and their results.
Name blocked or not-yet-run checks explicitly.

## Prevention
Regression tests, alerts, guardrails, runbook changes, or follow-up work. Include
the lesson that should change future implementation or review behavior.
```

Use exact file paths and line references when they materially help a future
investigation. Prefer paraphrase over long log or source-code quotations.

## Index row format

Append a row to the table in `docs/incidents/README.md`:

```markdown
| [13](013-short-kebab-case-title.md) | Concise incident title | 2026-08-03 | high | service-area |
```

The row must use the same ID, title, date, severity, and category as frontmatter.

## Validation checklist

Before finalizing, verify:

- The report is under `docs/incidents/` with a unique three-digit filename.
- Frontmatter parses as YAML and contains only the required keys.
- `id` matches the filename and README link.
- `status`, `severity`, and list fields use the allowed shapes and values.
- Title, date, severity, and category match the README table row.
- All required body sections exist and contain evidence or an explicit `TBD`.
- Related incident IDs and referenced paths actually exist, when asserted.
- `git diff --check` passes.

Useful repository checks:

```bash
ls docs/incidents
sed -n '1,35p' docs/incidents/NNN-short-kebab-case-title.md
rg -n '^id:|^title:|^date:|^status:|^severity:|^category:|^services:|^tags:|^related_incidents:|^doc:' docs/incidents/NNN-short-kebab-case-title.md
git diff --check
```
