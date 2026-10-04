---
title: Worked Exemplar — fat-people-eat-too-much
knowledge_type: reference
domain: vault/notes
scope: distilling-a-long-transcript-into-atomic-notes
status: active
updated: 2026-08-26
applies_to:
---

# Worked Exemplar — `notes/fat-people-eat-too-much.md`

Reference run of the full process (2026-08-25). Source: a voice-transcript LLM dialogue in which the author developed his foundational business theory. ~1,400 words of raw transcript with filler.

## Step 1 inventory

| Unit | Type | Strength |
|---|---|---|
| "Scale suicide" thesis — mega-mergers fail internally, not via market harm | Argument | Finished |
| Infrastructure trap / synergy illusion / incentive misalignment | Mechanism supporting thesis | Finished |
| Three universal resource archetypes (hard-physical / perishable-time / scalable-intangible) | Framework | Finished |
| Airline ticket = concert ticket (time-decaying access) | Insight | Finished |
| Apple-doesn't-make-titanium (pipeline dependency) | Insight | Finished |
| "Leaders fail on particularities vs. what business they're actually in" + personal quote | Theory (root postulate) | Finished |
| Intent to build a video explaining the worldview | Planning intent | Seed |

## Step 2–3 decisions

- Prefix: no `business.*` existed; `economics.*` was considered but these are theory notes, not economics captures → minted **`business.`** and flagged it to the user.
- Overlap grep found two adjacent raw captures (`economics.mergers-content-suppression.md`, `economics.antitrust-modern-media.md`) — different angles (mergers-as-survival, antitrust critique), not duplicates → kept as siblings, cross-linked from the new set.

## Granularity calls

- Root postulate got its OWN note (`business.know-the-business-youre-in.md`) even though it's entangled with the archetypes — it passes standalone-linkability (someone could cite "know what business you're in" without caring about taxonomy).
- The three archetype mechanics were NOT split per-archetype: the table IS the framework; splitting would break it. One note.
- Scale-suicide mechanisms stayed inside the thesis note rather than becoming three micro-notes — each is under the size floor alone.

## Resulting set

- `business.know-the-business-youre-in.md` (root postulate + quote + positioning intent)
- `business.resource-archetypes.md` (taxonomy table + discriminations)
- `business.scale-suicide.md` (thesis + mechanisms + zombie-enterprise endpoint)

Structure: postulate → taxonomy → failure mode, linked parent-to-child; all three point back at `source: [[fat-people-eat-too-much]]` and sideways at the two raw sibling captures.

## Coverage accounting (final)

| Source unit | Destination |
|---|---|
| Scale-suicide argument | `business.scale-suicide.md` |
| Merger mechanism detail | `business.scale-suicide.md` (§ The mechanism) |
| Resource archetype taxonomy | `business.resource-archetypes.md` |
| Airline=concert insight | `business.resource-archetypes.md` (§ Key discriminations) |
| Titanium/pipeline insight | `business.resource-archetypes.md` (§ Key discriminations) |
| Particularities quote + core postulate | `business.know-the-business-youre-in.md` |
| Video/positioning intent | `business.know-the-business-youre-in.md` (§ Status & positioning) |
| LLM scaffolding ("here's how you can structure this...") | dropped — assistant framing, not the author's theory |

100% mapped. Original transcript left in place as source capture at run time; the user subsequently deleted it (2026-08-26) before the retirement convention existed — notes then carried provenance via `source: "fat-people-eat-too-much (source capture deleted 2026-08-26)"`. Going forward the convention is: **move the source to `_distilled/` at the vault root** (wikilink provenance keeps resolving); deletion only on explicit user instruction, with provenance strings as the fallback when a source is already gone.

## Retrospective under the place-don't-manufacture rule

This run predated the home-first directive and created three files. Under the current rule, `business.know-the-business-youre-in.md` and `business.resource-archetypes.md` would likely have been ONE file (~60 lines combined: postulate + taxonomy answer adjacent questions of the same framework), leaving two files total. They stand today because each passes standalone-linkability — but a future distiller should treat consolidation of those two as a live option if either ever falls under the size floor.

---

# Field Test (2026-08-26) — two sources from the former `content/` directory

> Note: `content/` merged into `notes/` later the same day; publish intent now lives in frontmatter (`pubDate`, `visibility`, `status`), surfaced via the vault-root `content.base`. Paths below are as they were at run time.

## Run A: `content/after-work.md` — single-theory capture ✅

- Inventory found ONE dominant framework → correctly produced one note (`work.purpose-equation.md`), no fragmentation.
- Home search found `philosophy.the-search-for-meaning.md` — an existing question-outline that ASKS the purpose question but has no answers. Correct move: create the answer-note, then extend the outline with a "Working answers" section linking to it. Don't bury frameworks in bullet hierarchies; don't leave outlines pointing nowhere.
- Source was capture-like → retired to `_distilled/after-work.md`.

## Run B: `content/defines.md` — short publishable essay ⚠️

- One claim (risk asymmetry of standing still) + one autobiographical paragraph.
- Created `philosophy.risk-asymmetry.md`; routed the France/coding/London/Thomson-Reuters life event to its canonical home `personal/memories.md` — coverage destinations can be outside `notes/`.
- **Did NOT retire the source**: it's a polished essay with publication metadata (`pubDate`, category), not a capture. Moving it would kill its publish path. This run exposed the capture-vs-essay distinction now codified in Step 5b.
- Validator also caught that the source's frontmatter slug (`risks-define-our-lives`) ≠ filename (`defines`) — wikilinks must go by filename; drift flagged to user.
