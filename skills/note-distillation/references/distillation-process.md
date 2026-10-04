---
title: Distillation Process
knowledge_type: process
domain: vault/notes
scope: collapsing-a-long-document-into-atomic-notes
status: active
updated: 2026-08-26
applies_to:
  - "notes/**"
---

# Distillation Process

How to take one large chunk of writing (LLM transcript capture, essay draft, brain dump) and convert it into durable atomic notes. Goal: each note answers one question completely and survives independently of the source.

## Prime directive: place, don't manufacture

Distillation is PLACEMENT, not manufacturing. File creation is a cost — naming burden, link maintenance, discovery friction — and premature splits calcify: "merge later" almost never happens because nobody notices two notes belong together. Therefore:

> **For each unit, find the note whose question the unit answers. Extend that note. Create a new file ONLY when no existing note asks that question.**

A good distillation is measured by the MINIMUM set of file changes that gives every durable idea a canonical home — often some mix of extensions, new files, and added links. A section in the right file beats a thin orphan file.

For a worked example of this process applied to a real capture, read [exemplar-fat-people.md](exemplar-fat-people.md). The note scaffold IS this document: Step 5 defines the exact frontmatter; the sections below (Key discriminations, Failure mode, Status & positioning, Related) are optional — drop what doesn't apply, keep `Related`.

## Step 1 — Read whole, then inventory

Read the entire source before writing anything. List every candidate unit:

- **Theories / frameworks** — named models, taxonomies, causal claims ("X causes Y")
- **Insights** — sharp single observations worth keeping verbatim-ish
- **Topics** — subjects explored at length that deserve their own home
- **Arguments** — positions taken against some default view

Mark each unit with its strength: is this a *finished* idea, a *seed*, or *repetition*? Seeds still get notes — mark them as such rather than padding them out.

## Step 2 — Derive the domain prefix

Before naming anything, enumerate existing prefixes so the set lands in the corpus's namespace:

```bash
ls notes/*.md | sed 's|.*/||; s|\..*||' | sort | uniq -c | sort -rn
```

- If the source's domain fits an existing prefix (e.g., economics, business, politics), reuse it.
- Mint a new prefix only when nothing fits. Flag the new prefix in the summary back to the user — new namespaces are a corpus-level decision.
- A single source may span multiple domains; split units across prefixes rather than forcing one.

## Step 3 — Find the home (decision tree)

For each candidate unit, search first:

```bash
grep -rliE "<key terms>" notes/
```

Then classify every hit, in priority order:

| Situation | Action |
|---|---|
| An existing distilled note **asks the same question** | **EXTEND it** — add a section, sharpen its claims, fold the unit in. This is the preferred outcome. |
| An existing file **asks the question but has no answer** (question-outline, study guide) | Create the answer-note; then extend the outline with a short "Working answers" section LINKING to it. Don't bury a crisp framework inside bullet hierarchies, don't leave the outline pointing nowhere. |
| No existing home asks this question | Create new note (must pass Step 4) |
| Exact duplicate content | Skip; report the overlap |
| Same topic, different angle, own searchable identity | New note + cross-link as siblings |
| Same topic, contradicting position | Both survive + explicit tension link — contradictions in a thinking corpus are data, not errors |
| Existing match is a **raw capture** (`chatgpt-share-*`, voice transcript) | Distill on top of it — raw captures are source material, not competitors. If the capture contains ONE dominant idea, the distilled note may replace its live position (capture moves to `_distilled/`); if several, extract alongside it |
| Existing match is already **distilled** | Extend it; do NOT fork a competing canonical home |
| Existing note is a *variant* territory | Follow vault convention: preserve branches with `.branch` / `.pt2` suffixes and `related:` links — never delete variants |

One canonical home per fact. When unsure whether to CREATE or EXTEND: **extend** — merging orphaned files back together almost never happens in practice.

## Step 4 — Apply the granularity test

Creation must pass ALL of these; extension must not break them:

1. **Answers its own question** — a new file exists because NO existing note asks this question. An extension keeps the target note asking exactly one question; if the folded unit drags in a second concern, that second concern is the thing that deserves the new file.
2. **Standalone linkability** — an unrelated future note could link to it without needing its siblings for context.
3. **Searchable title** — the title answers a question someone would actually think to ask ("What are the resource archetypes?" ✓).
4. **Size band ~15–80 lines** — under ~15 lines, fold into its closest sibling instead of creating; over ~80 after extension, the note holds two concerns: split out whichever arrived last.

Name after the **idea**, not the source: `business.scale-suicide.md`, never `fat-people-eat-too-much-distilled.md`. The title is what someone should think when they need it.

## Step 5 — Write with the frontmatter contract

Every distilled note carries:

```yaml
updated: '<ISO timestamp>'
status: draft
slug: <dot.namespaced.slug>
visibility: private
title: <Idea Name>
type: note
source: "[[<original-capture-file>]]"
```

`slug:` MUST match the filename. `source:` points at the origin document so provenance survives — as a `[[wikilink]]`. Do not delete or rewrite the source capture yourself as part of distilling (unless explicitly instructed): conversion adds a layer, it doesn't replace it.

## Step 5b — Retire, keep, or route the source

What happens to the source depends on what it IS:

| Source type | After distillation |
|---|---|
| **Raw capture** (`chatgpt-share-*`, voice transcript, working dump, unstructured brain dump) | MOVE to `_distilled/` at vault root. Its value is fully extracted; retirement is the default. |
| **Publishable essay/draft** (has publication metadata: `pubDate`, `category`, polish) | KEEP in place. The essay itself is an artifact with a publish path — distillation creates reference notes alongside it, it doesn't consume it. |
| **Structured extraction / semi-distilled doc** | KEEP in place; treat as a sibling artifact. Link to it; consolidate only if genuinely redundant. |

```bash
mv <raw-capture>.md _distilled/   # captures only — never essays
```

- Moving preserves provenance — `[[wikilink]]` sources still resolve, since `_distilled/` is inside the vault.
- Deletion is reserved for explicit user instruction only.
- If the source was already deleted by the user before this convention applied, record it in the frontmatter instead: `source: "<name> (source capture deleted <date>)"`.
- **Wikilink by FILENAME, not slug.** Obsidian resolves `[[wikilinks]]` by filename; source files whose frontmatter `slug:` differs from their filename (common pre-existing drift) will not resolve via slug. If you spot that drift, flag it to the user.
- **Route biographical facts to their canonical home.** When a content-side source contains personal life events, the coverage destination may be outside `notes/` entirely — e.g., `personal/memories.md`. The coverage table records wherever the fact's one canonical home is.

## Step 6 — Voice and ownership (contract)

MUST preserve the author's intellectual position and voice:

- In LLM transcripts, ideas raised by the user are **the author's ideas** even when an assistant phrased the polished version. Write distilled notes as direct statements of the theory ("Leaders confuse company scale with resource scalability"), not as reportage ("The user argued that...").
- Keep signature phrases and personal quotes where they carry identity.
- Strip transcription artifacts (filler words, broken sentences). Do not sanitize positions — organize, don't soften.
- If the source contains planning intent ("I want to build this into X"), capture it in a `Status & positioning` section so future work can find its thread.

## Step 7 — Link the set

- Each note links to the others under `## Related`; distinguish parent frameworks from sibling concepts.
- Point at raw captures when they contain adjacent threads.
- No orphans: every note in the set must be reachable from at least one sibling.

## Step 8 — Produce the coverage accounting table

The distillation is not done until every distinct unit from Step 1 is accounted for. Report a table mapping each source unit to its destination:

| Scale-suicide argument | `business.scale-suicide.md` (NEW) |
| Resource archetype taxonomy | `business.resource-archetypes.md` (NEW) |
| Unit X | extended `economics.existing-note.md` |
| Autobiographical detail | routed to `personal/memories.md` (canonical home) |
| (repetition of Y) | dropped — duplicate of existing note |

Target: **100% of units mapped, zero silent drops.** Dropped units must state why (repetition, noise, out of scope).

## Step 9 — Validate

Run the checker when the skill ships one, else verify by hand:

```bash
python3 .agents/skills/note-distillation/scripts/check_distillation.py notes/<new-note>.md ...
```

Checks: slug matches filename · required frontmatter fields present · `source:` resolves to a real file · updated timestamp bumped. Then regenerate the knowledge index if any skill references changed:

```bash
python3 .agents/skills/vault-maintenance/scripts/generate_knowledge_index.py
```

## Bulk-operation safety

Distilling creates many files and moves one:

- Confirm scope with the user before deleting ANY source file — the default is moving it to `_distilled/`, never deleting.
- Recommend a git commit checkpoint before large conversions.
- Report the full note set created AND the retired source path at the end.
