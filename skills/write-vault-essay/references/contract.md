---
title: Longform Essay Contract
knowledge_type: contract
domain: vault/essays
scope: rewriting-source-files-into-write-vault-essays
status: active
updated: 2026-08-31
applies_to:
  - "notes/**"
  - "_distilled/**"
description: Binding gates for 900-1200 word New Yorker-style essays in the vault.
---

# Longform Essay Contract

This contract replaces `write-essay`'s 300-800w no-header rule for longform only. Output that violates any MUST below is rejected.

## Frontmatter (MUST)

Every essay in `notes/` MUST carry:

```yaml
slug: <dot-namespaced, matches filename without .md>
title: "<Title>"
category: <economics|media|culture|politics|technology|etc>
status: draft # or published only on explicit request
visibility: private # or public only on explicit request
type: essay
pubDate: null # or ISO date if publishing
updated: YYYY-MM-DDTHH:MM:SS.sssZ # bump on every edit
tags: [<kebab-case>] # 3-6
description: "<one-sentence, no period needed>"
opinionated: true # or false
```

- `slug` MUST equal filename stem.
- `updated` MUST be bumped on edit (per vault convention).

## Length & Structure (MUST)

- **Length:** 900-1200 words body (frontmatter excluded). 850-1450 is tolerable; <800 or >1500 fails. (The approved exemplar runs 1443w — expressiveness may push past 1200.)
- **Architecture (invisible but required):**
  1. **Strike** (1 para) — first sentence is already in the argument. No "In recent years...". Introduce or foreshadow the extended metaphor.
  2. **Setup** (2-4 paras) — what everyone gets wrong. How the metaphor reveals the truth.
  3. **Deepening** (2-3 paras) — push the metaphor, add evidence/cases (Barbie, Woman King, etc.).
  4. **Arithmetic/Proof** (2-3 paras) — numbers allowed. Show the math that makes the claim undeniable.
  5. **Obstacle** (1 para) — why isn't this obvious? Honest paragraph (incentives, fear, subsidy).
  6. **Exit** (1-2 sentences) — not a summary. A strike. End on the metaphor. Never a question or CTA.

## Style (MUST / MUST NOT)

**MUST:**

- Open cold. First line hesitates or argues: `Call any caterer...` / `You think you are talking to intelligence...`
- Carry **one** extended concrete metaphor (wedding vs. birthday, Stradivarius, etc.) — introduced by para 2, recurs in final para. Never abstract ("paradigm", "synergy").
- Vary paragraph rhythm deliberately: at least two single-sentence landings, no two adjacent body paras same length. Sequence like 2,5,1,4,1,6 — never 3,3,3. **Rhythm and landings are judged on body paragraphs only, across `###` breaks** — the title and headers are structural breaks, not content, and never count as landings. A single-sentence landing may sit right next to a header; it must not sit next to another body paragraph of equal length.
- End on a strike. Last line lands and stops.
- Use fragments when they complete a thought better than a full sentence.

**MUST NOT (inherited from ponti voice canon):**

- No exclamation points, no emoji, no "In conclusion", no "key takeaways" section.
- No hedge words: arguably, perhaps, interestingly, some might say.
- No academic transitions: thus, therefore, however, furthermore.
- No `we` as false consensus. Use "you" for direct address when needed.
- No explaining the metaphor. Trust the reader.

**RELAXED for longform (vs. write-essay 300-800w):**

- **Headers ALLOWED:** `###` section breaks (2-4) to orient a 1000w read. Never `#` inside body (title is the H1).
- **Statistics ALLOWED:** Numbers, dollar figures, percentages are evidence for economics/media essays. Cite source file — never invent. Prefer inline figures (`$125M`, `94%`) over footnotes.
- **Italics ALLOWED sparingly:** One word per ~250 words max, only to mark the metaphor's shibboleth (*wedding*, *bridal*) or film/book titles. No bold for emphasis.
- **Length:** 900-1200 supersedes 300-800.

## Voice (MUST)

Full binding voice rules live in `voice.md` (Longform Voice Contract). Summary:

- Inherit `ponti voice canon/references/voice-foundation.md` and `style-contract.md`: essential, honest, still; Kanso/Ma/Shibui/Wabi-sabi; direct address, declarative, specific, calm authority.
- **Plus the seven New Yorker Instruments (MUST, see `voice.md`):** open on a scene not a thesis; live the metaphor (new physical detail each section, landed in the final line); one dry-wit moment from precision; exactly one earned widening reference; clause-stacked sentences breaking to short strikes; staged arithmetic; the writer present as a sensibility.

The negative rules prevent AI-slop; the instruments prevent the brief. A 1000w essay that passes every prohibition but opens like a news brief and uses none of the instruments is a structured brief, not an essay — rewrite it.

## Archival (MUST)

After essay passes all gates and is written to `notes/<slug>.md`:

- Source file MUST be moved to `_distilled/` via `git mv <source> _distilled/` (or `mv` if untracked). Preserve basename; do not rename. Destination: `_distilled/<filename>`.
- `_distilled/` is append-only, per vault directory map. Never delete source; never copy and leave original.
- If `_distilled/` does not exist, create it.
- Verify after move: `ls _distilled/<basename>` exists and `ls <source>` does not.
- Archival is part of termination: skill is not complete until move is verified.

## Gates (automated via `scripts/check_essay.py`)

Run `python3 .agents/skills/write-vault-essay/scripts/check_essay.py notes/<slug>.md` (or `bash scripts/validate.sh notes/<slug>.md`) to gate. Bash covers `wc -w` / `grep` quick checks; Python handles frontmatter, paragraph rhythm, and combined reporting — do not use `python3 -c` one-liners.

Essay fails if `check_essay.py` reports errors:

- Frontmatter missing or `slug != filename`
- <800 or >1500 words (tolerable 850-1450, ideal 900-1200)
- No single metaphor or metaphor explained
- Uniform paragraph lengths — rhythm fails only when it becomes systemic (3+ adjacent same-length pairs, or a triple run). A lone 7,7 or 4,4 pair is the approved exemplar's own pattern and passes as a warning. Blockquotes (quoted material) never count toward rhythm. Need ≥2 single-sentence body landings.
- Opens with context or ends with question/CTA
- Uses forbidden transitions, hedge words, or exclamation
- Source not archived to `_distilled/` after write

Note on counting: the checker's sentence counter drops punctuation-only fragments, so a paragraph ending in `."` or `.)` is counted correctly, not as a phantom extra sentence. Quote-terminated sentences (`he said.`) are fine.

Fix and re-run `check_essay.py` until `PASS` before writing to `notes/`.
