---
title: Ponti Studios Documentation System
knowledge_type: standard
domain: ponti-studios/projects
scope: writing-documentation
status: active
updated: 2026-08-25
slug: ponti-studios-documentation-system
owner: charlesponti
applies_to: []
---
# Ponti Studios Documentation System

> **Boundary with write-essay:** this reference owns WHAT documentation must exist and where (structure, naming, one-home-per-fact). writing-workflows owns HOW to write a document once you know it is needed (choosing shapes, filling content). Structure questions come here; writing-craft questions go there.

This is the canonical rule set for structuring documentation. Its two goals, in order:

1. **Eliminate duplication** — every fact has exactly one home.
2. **Maximize search** — a fact is reachable by the question it answers, not by who wrote it.

## The seven principles

### P1 — One canonical home per fact

Every fact — a thesis, a model, an audience, a contract, a number — has exactly one file that owns it. That file is decided by the oldest question the fact answers (P2). Every other page that needs the fact links to its home; it never restates it. If two files state the same fact, one of them is a bug.

### P2 — Facts live in the layer that answers their question

A file's layer is its job, not its folder. Each fact goes to the layer that answers the question it belongs to:

| Layer | Answers | Holds | Canonical prefix |
| --- | --- | --- | --- |
| **Vision** | Why does this exist? | Thesis, beliefs, non-negotiable promise | `vision.md` |
| **Strategy** | What are we trying to prove? | Problem, audience, evidence, open questions | `brief.md`, `research/` |
| **Product** | What does the product do now? | Current model, surfaces, boundaries | `product.md`, `features.md` |
| **Design** | How should it behave? | Interaction and data contracts | `design/` |
| **Decisions** | Why did we choose this? | Tradeoffs, rejected directions, guardrails | `decisions/` |
| **Plan** | What comes next and when? | Roadmap, backlog | `roadmap.md`, `backlog.md` |
| **Ops** | How do we run it? | Policies, procedures, release data | `operations.*`, `policy.*` |
| **Reference** | Where is the lookup data? | IDs, links, registries | `reference/` |

A fact that belongs in **Design** must not also live in **Strategy**. When a research finding becomes a product commitment, the finding stays in research and the product contract links to it — it is not copied.

### P3 — Indexes are maps, not summaries

An `_index.md` links to the pages in its scope and says one line about each. It never restates their content. If an index page carries more than a single-sentence description of a child, the child owns that content.

### P4 — Contracts restate nothing from an older layer

A design contract may repeat a vocabulary word, but it does not re-argue the thesis it sits on. When a lower layer needs the higher layer's reasoning, it links to the decision or thesis and moves on.

### P5 — Narrative deliverables are dated snapshots

Pitch copy, marketing pages, and App Store metadata are deliverables, not knowledge pages. They may restate the promise, but they must be marked `status: dated` or carry an explicit date, and they must link back to the product contract so the snapshot can be reconciled with current truth. Never update a deliverable in place as if it were the contract.

### P6 — Rules are centralized, not repeated

How-to-organize guidance (this document, change checklists, "don't duplicate" warnings) lives in exactly one place: here. A page that needs a rule links to it. Do not paste a governance paragraph into an index or contract. A single authoritative rule prevents the rules themselves from drifting into four versions.

### P7 — Search wins via the hub + backlinks

Maximize search in two ways: every page that owns a fact is linked from its nearest index (the hub), and every page that would once have duplicated a fact links to its home (the backlink). A vault-wide search for any concept therefore returns the canonical home plus the pages that genuinely use it — not N copies of the same paragraph.

## Applying the system

1. **Find the fact's question** (P2) and its canonical layer.
2. **Check whether the fact already has a home** before writing it anywhere.
3. **Link, don't copy.** If a page needs a fact, reference the home. If the link text needs to carry meaning, use an anchor: `[[home#section|meaningful label]]`.
4. **If you must restate** (a deliverable, a summary paragraph), make it a one-line pointer plus the link, never a full restatement.
5. **When moving a fact**, update its home and every inbound link in one change.

## Change checklist

When a fact's home changes:

1. move or rewrite the canonical file;
2. update the nearest `_index.md` hub line;
3. update every page that linked to the old home;
4. verify no page still states the fact inline (P1);
5. run the wikilink verification pass for the project.

## Status vocabulary

- `active`: maintained and part of the current model
- `experimental`: maintained for validation, not yet a core commitment
- `planned`: approved direction without a maintained implementation
- `historical`: retained for context only
- `dated`: a snapshot deliverable, reconciled against the contract by date