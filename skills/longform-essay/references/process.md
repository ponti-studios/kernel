---
title: Essay Rewrite Process
knowledge_type: process
domain: vault/essays
scope: rewriting-source-files-into-longform-essays
status: active
updated: 2026-08-31
applies_to:
  - "notes/**"
  - "_distilled/**"
description: Ordered steps to reliably rewrite a source file into a vault longform essay and archive source.
---

# Essay Rewrite Process

Use this process every time the user says "rewrite @file into essay / new yorker essay / longform."

## Step 0 — Intake & Canon

1. Read source file fully. If `Read` output is capped at 50KB, re-read with `offset` until `End of file`.
2. Classify source: `transcript` (LLM chat), `docx-markdown` (pandoc output from `_assets/*.docx`), `notes` (raw capture), `draft`.
3. Count approximate source length; note load-bearing arguments vs. repetition.
4. Load canon:
   - `ponti voice canon/references/voice-foundation.md`
   - `ponti voice canon/references/style-contract.md`
   - `longform-essay/references/contract.md`
   - `longform-essay/references/voice.md`
   - `longform-essay/references/exemplars.md` (reference material for imitating the voice)
5. Output brief (internal):

```
# Brief
**Source:** <path, type, ~lines/words>
**Thesis candidates:** <2-3 one-sentence claims>
**Gaps:** <what numbers need verification, what is spitball vs. hard data>
```

Gate: source identified, canon loaded. Do not draft without it.

## Step 1 — Direction

Lock before drafting:

1. **One claim** — exactly one sentence the essay proves. If source argues five things, choose the one that survives without the others.
   - Bad: "Hollywood is broken in many ways."
   - Good: "Hollywood's $150M film costs are a wedding tax — status pricing, not physics."
2. **One concrete extended metaphor** — not abstract. Must be a physical system: wedding vs. birthday, Stradivarius, ant colony, sushi counter.
   - Introduced by paragraph 2, recurs in every section, lands in final sentence.
   - From source when possible (e.g., source's wedding vs. birthday); otherwise derive laterally.
3. **Audience & intent** — who it's for, why now.

Output:

```
# Direction
**Claim:** <one sentence>
**Metaphor:** <concrete metaphor — wedding vs. birthday — not "paradigm">
**Audience & intent:** <reader, why publish now>
```

Gate: one claim, one metaphor. User instruction overrides inference.

### Step 1b — Multi-essay sources (series transcripts)

If the source supports several load-bearing claims — a series transcript that keeps descending a level deeper, a long Q&A, a bundle of distinct arguments — do **not** force one essay. Ask, then decompose:

1. Propose a decomposition: one essay per claim, each with its **own claim + own metaphor**. Offer merges where claims are mutually supporting (e.g., "merge 1+4, keep 2 and 3 standalone").
2. Get the user's confirmation on the split before drafting. Never guess the split for a source with 2+ obvious essays.
3. Run the normal draft → gate → finalize loop **per essay** (each gated independently by `check_essay.py`).
4. Archive the single source once, after all essays pass. One source, N essays, one `git mv`.

Gate: split confirmed, one claim + one metaphor per essay.

## Step 2 — Draft

Write per `contract.md` (gates: length, structure, frontmatter) and `voice.md` (voice: seven New Yorker Instruments):

- 900-1200 words, `###` headers allowed (2-4), stats allowed with source fidelity.
- Invisible architecture: Strike → Setup → Deepening → Arithmetic → Obstacle → Exit.
- Paragraph rhythm: at least two single-sentence landings, no two adjacent same length. Plan sentence counts before writing: e.g., 2,5,1,4,1,6,3,1.
- Voice: essential, honest, still; then the seven instruments (scene before claim, lived metaphor, dry wit, one widening reference, breath rhythm, staged arithmetic, writer present). No hedges, no academic transitions, no exclamation, italics ≤1 per 250w.
- Preserve source numbers — do not invent. If source says "$30-50 spitball, conservatively $35", keep the conservative.
- Do not explain the metaphor.

Frontmatter: use the exact spec in `contract.md` (slug == filename, status, visibility, type, pubDate, updated, tags, description, opinionated).

Gate: length, headers, rhythm, metaphor carried to end, frontmatter slug == filename, voice instruments present.

## Step 3 — Critique (against longform contract, not content-pipeline 300w)

Run the gate checker (replaces ad-hoc `wc -w` / `grep` / `python3 -c`):

```bash
python3 .agents/skills/longform-essay/scripts/check_essay.py notes/<slug>.md
# --json for machine-readable: python3 .agents/skills/longform-essay/scripts/check_essay.py --json notes/<slug>.md
bash scripts/validate.sh notes/<slug>.md   # quick bash wc/grep + delegates to check_essay.py
```

Then map failures to rule anchors:

```
## Findings
- [opens cold] first line is context, not strike
- [one metaphor] metaphor introduced in para 4, not para 2
- [paragraph length] paras 3 and 4 both 4 sentences
- [statistics] $200M figure not in source — remove or mark TBD
- [hedge words] "perhaps" in para 6
```

Rule anchors: `frontmatter`, `length`, `opens cold`, `one metaphor`, `direct address`, `paragraph length`, `strike`, `fragments`, `academic transitions`, `false consensus`, `explains the metaphor`, `emphasis`, `ends with a question`, `hedge words`, `exclamation`, `key takeaways`, `uniform paragraphs`, `archival`. Voice instruments (from `voice.md`): `scene`, `lived metaphor`, `wit`, `widening reference`, `breath rhythm`, `staged arithmetic`, `writer present`.

If `check_essay.py` reports `PASS`, continue. If `FAIL`, hand to Step 4.

## Step 4 — Edit & Finalize

1. Address every fail — only fails. No taste edits.
2. Re-run `python3 .agents/skills/longform-essay/scripts/check_essay.py notes/<slug>.md` (or `bash scripts/validate.sh notes/<slug>.md`) to re-count words, re-check `slug == filename`, `updated` bumped, and forbidden words.
3. Write to `notes/<slug>.md` (dot-namespaced, per vault convention: `economics.hollywoods-wedding-tax.md`).
4. Verify: `check_essay.py` shows `PASS` (do not use bare `wc -w` / `grep` — the script is the source of truth).

Gate: `check_essay.py` PASS, file exists at `notes/`, `git status` shows `?? notes/<slug>.md` or `M`.

## Step 5 — Archive Source to _distilled (MUST, part of termination)

Archival is a binding rule in `contract.md`; the mechanics:

1. Ensure `_distilled/` exists: `mkdir -p _distilled`.
2. Move source file: `git mv "<source>" "_distilled/<basename>"` if tracked; else `mv "<source>" "_distilled/<basename>"`. Preserve basename exactly — do not rename. Do not copy; must be move.
3. Verify: `ls "_distilled/<basename>"` exists and `ls "<source>"` fails (no longer in place).
4. Check `git status` shows `D <source>` or `R <source> -> _distilled/<basename>` and `?? _distilled/<basename>` if untracked move.

Gate: `ls _distilled/<basename>` succeeds; source path no longer exists. Skill terminates only here.

Failure modes:
- If source is `_assets/...` and essay is derived, archival is still mandatory — vault rule: one canonical home per fact, pointer stubs only if needed.
- If user explicitly says "keep source", skip archival but note exception in output.

## Reliability Checklist (run via scripts every time)

- Did I read the entire source (paginate if capped)?
- If the source holds multiple claims, did I propose a decomposition and confirm the split with the user before drafting?
- Did I lock one claim + one metaphor per essay before drafting?
- Did I keep source numbers honest (no invention)?
- Did I `python3 .agents/skills/longform-essay/scripts/check_essay.py notes/<slug>.md` and get `PASS` (900-1200w, body rhythm, headers, forbidden words)?
- Did I write vault frontmatter with `slug == filename` (verified by `check_essay.py` and `bash scripts/validate.sh`)?
- Did I apply the seven New Yorker Instruments (from `voice.md`)?
- Did I `git mv` source to `_distilled/` and verify?

If any answer is no, do not ship. Never use `python3 -c` one-liners for these gates — the scripts are the reusable source of truth.