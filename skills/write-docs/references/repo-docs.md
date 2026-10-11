# Repo docs (`docs/*`)

Write and maintain the living map: `docs/*` in a repository. The contract below
is the canonical format. When the repo has its own `docs/FORMAT.md`, that file
is the contract of record and wins over this reference.

## Frontmatter

Every doc opens with exactly this block. No optional filler fields — if a field
would always be `null` for this repo, it doesn't belong in the schema. Keys in
this order:

```yaml
---
title: <short noun phrase, no "What" prefix redundancy unless disambiguating>
summary: <one sentence, what the doc is for, not what it contains>
type: architecture | reference | guide | proposal
status: active | draft | proposed
owner: <github username>
tags: [<lowercase, kebab-case>]
related: [<relative paths to other docs/*.md files>]
updated: <YYYY-MM-DD, bump on every substantive edit>
---
```

Field rules:

- `title` — noun phrase. Drop redundant product prefixes unless needed to
  disambiguate inside a multi-product docs tree.
- `summary` — what the doc is *for*, not what it contains. One sentence.
- `type` — decides the shape of the body (see below).
- `status` — `active` (true today, keep in sync with code), `draft` (being
  written, may be wrong), `proposed` (design for future work, nothing to verify
  against yet).
- `owner` — the GitHub username accountable for keeping it true.
- `tags` — lowercase kebab-case only.
- `related` — relative paths that resolve to real `docs/*.md` files. Use `[]`
  when none apply. Verify each path resolves before committing.
- `updated` — ISO `YYYY-MM-DD`. Bump on every substantive edit. An `active` doc
  with an `updated` date older than the code it describes signals re-verify,
  not trust.

## Body shapes by `type`

- **architecture** — how a system is built and why it's split that way.
  Layers/components → API surface → operational surface → read next.
- **reference** — dense facts about one mechanism (a pipeline, a config
  surface). No narrative, no "we decided" — just what's true today and where to
  look in code.
- **guide** — how to run a command or workflow. Lead with the command. Provide
  exact commands and expected outcomes, then failure handling.
- **proposal** — not built yet, or partially built. Problem → recommended shape
  → open questions. `status: proposed` until it ships, then it either graduates
  to `reference`/`architecture` or gets deleted.

## Lifecycle

- The precise rule for pruning: a doc is deleted, not archived, once it stops
  being true and nothing in the current system depends on knowing the history.
  Git history is the archive.
- `docs/*` is a living map, not a log.
- When editing an existing doc: verify every retained claim against the code as
  it stands now, drop claims that no longer hold, add citations that were
  missing, and bump `updated`. Do not append "update notes" or edit history to
  the body — that's what git is for.
- When a doc's content has been superseded by a newer doc, delete the old one
  and make sure `related` links in the remaining docs don't point at the void.

## Editing checklist

```text
frontmatter present, exactly the schema keys, in order
type/status in the allowed enums
tags lowercase kebab-case
updated is an ISO date and was bumped by this edit
related paths all resolve to existing files
every factual claim checkable in code carries a file:line or file citation
no throat-clearing / hedging / narration sentences
no retrospectives or "we decided" history
git diff --check passes
```

Run the mechanical checks with the bundled validator. The script ships in
this skill's `scripts/` directory; run it from the target repo root with the
skill directory path (the directory containing the SKILL.md you are reading):

```bash
python3 <write-docs skill dir>/scripts/check_frontmatter.py docs
```

The validator reports missing frontmatter, unknown keys, out-of-order keys, bad
enum values, malformed tags, non-ISO dates, and `related` links that resolve to
nothing. Fix every reported line before handoff; the report is the same audit a
human runs, so pass it silently.

## What belongs in docs/ and where

- **`docs/operations/`** — runbooks, deployment and environment contracts, the
  ops discipline. These are the docs agents must read before touching
  environments, routes, databases, or deployments. Never let them drift into
  narration; they are executable contracts.
- **`docs/*/architecture.md`** — long-lived system map. Keep it short enough to
  be fully read; point at code for the rest.
- **`docs/experiments/`** — documented experiments and their explainers. They
  still follow the contract; an experiment is a `reference` or `guide` like
  anything else.
- Cross-product docs (e.g. `docs/connections/`) follow the same frontmatter;
  use `related` to link the set, with the index doc linking outward.

## Guardrails

- Never hand-edit a doc into conformance with a fake `updated` date — bump it
  truthfully and on every edit.
- Never copy a doc's structure from memory; read two examples from the target
  repo first.
- Never write "TODO" placeholders into an `active` doc unless the missing fact
  is genuinely unknowable today; then mark it explicitly as unknown rather than
  plausible.
- Never add fields to the schema without updating the repo's `docs/FORMAT.md`
  and this reference together.