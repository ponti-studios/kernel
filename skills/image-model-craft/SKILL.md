---
name: image-model-craft
description: "Use when prompting, evaluating or debugging image models — evidence-based rules for what works and what doesn't."
license: MIT
metadata:
  author: project
  version: "1.0"
  category: Creative
  tags:
    - image-generation
    - prompting
    - evaluation
    - evidence
---

# Image model craft — what works, what doesn't, and how we know

Field notes from real work on a consistent-character universe (nine characters, nine
frames, ~60 renders). Every claim below is tagged:

| Tag | Meaning |
|---|---|
| **[M]** | Measured here, numbers in `references/evidence-log.md` |
| **[I]** | Inferred from evidence, not directly measured |
| **[U]** | Untested — a hypothesis worth testing, do not treat as fact |
| **[R]** | Ruled out by the user or by evidence (do not re-litigate) |

The single most important rule in this document: **one render is not evidence.**
Three separate confident claims from single samples were falsified by a five-sample
re-run in one afternoon (`references/evaluation-method.md`). Sample, or say you don't know.

## Hard rules (non-negotiable)

1. **Every generated image goes to `~/Pictures/imagegen/_inbox`**, named
   `<YYYYMMDD-HHMMSS>_<model>_<what>.<ext>` — **timestamp first so the folder sorts
   chronologically** — with `_index.md` listing them. Never leave
   renders in `/tmp`, a scratch dir, or a per-experiment folder — one inbox, so a human
   can review everything in one place.
2. **A model never judges an image. Not a vision model, not me, not any other model.**
   Never call image analysis on generated output. Never score, rank, pass/fail or
   "check" a render. Never report what an image "looks like" as evidence or as a
   finding. **Charles judges quality.** My job is to generate, name, file, and report
   parameters and cost.
3. **Report what was run, not how it looked:** model, prompt sha256, aspect, resolution,
   real pixel size, cost, file path. Quality verdicts belong to the human.
4. **Because computers cannot be trusted to judge images, every historical scoring claim
   in this skill is suspect.** Two fabricated findings (a "phone" and "adidas" text) were
   produced from a single image by model-based scoring and were caught only by the user's
   eye. Treat the retained scoring sections as a record of how the errors happened, not
   as guidance to follow.

## The rules, in order of how much they matter

1. **Compile prompts, never hand-write them [M].** Character blocks pasted by hand
   drift; a deterministic compiler gives byte-identical output for the same inputs
   and records the prompt hash. If your prompt is generated, the only differences in
   a run are the ones you chose.
2. **Attach the reference plates, and know the ceiling [M].** `qwen-image-2.1-turbo`
   accepts **0-4** reference images; `seedream-5-0` and `gemini-3-pro-image` accept
   **0-14**. A five-character frame exceeds qwen's ceiling structurally — no wording
   fixes that.
3. **Judge identity at 2K, judge composition at 1K [M].** At 1K a dark mask against
   dark hair reads as "half-mask" to a careful observer and to a vision model, while
   the same prompt at 2K renders the mask correctly. Identity verdicts from 1K
   renders are invalid; coarse failures (extra objects, garment swaps, text,
   translucency) are visible at 1K and iteration there is ~9x cheaper.
4. **Sample >=5 per arm before believing a difference [M].** Cost of being wrong is
   high: a "fixed" prompt that didn't fix anything is worse than no fix.
5. **State the positive [I].** Naming a forbidden thing raises its odds of
   appearing, and enumerating other characters' garments in a character's own line
   is actively harmful. But see rule 6 — the measured effect was *not* on the
   failure the negatives were written for.
6. **Do not expect the negative-to-positive rewrite to fix a failure that isn't
   happening [M].** On the frame whose spec said *"no gem, no diamond, no faceted
   stone, no sparkle, no star"*, the failure never occurred: 0/5 panels in **both**
   the original and rewritten arms. The constraint was inert, so the rewrite
   changed nothing measurable.
7. **Give the model a geometry it can resolve, or it will invent one [M/I].** A net
   hung from two ceiling pulleys renders as a flat curtain crossing the figure, and
   cords "pass through" the body. Removing the supports so the figure's own body is
   the only thing holding the net produced a proper drape — but that was a
   single-sample result **[U]** and needs 5-sample confirmation.
8. **Long physics paragraphs appended to a prompt do nothing [M].** 559 characters
   spelling out occlusion, contact shadows and stretching changed the render not at
   all. Fix the load-bearing clause, not the tail of the prompt.
9. **Diff your arms before you compare them [M].** After a content rewrite, the
   "legacy" arm still says `NEGATIVES:` but contains the *rewritten* text — so it is
   not the "before". Only git history or a restored copy is.
10. **Never quote a file path you haven't just written [M].** Twice in one session
    I gave delivery paths for files I hadn't copied. Copy, then read the path back
    off disk, then quote it.

11. **Check the spec, then check the pixels, before you record a failure [M].** The
    most serious error in this whole body of work was a rubric item invented by the
    scorer — *"no phone in anyone's hand"* — which scored a **spec-mandated prop** (a
    nail file, written into the action line) as a violation on four models, and then a
    vision model misread the tool as a phone. Two fabricated findings from one image,
    both caught only by the user's eye. A finding built on an invented check is worse
    than no finding, because it justifies work.
12. **A failure that reproduces on every model is likelier to be a brief or scoring
    problem than a model problem [U].** Sound as method; our only worked example
    turned out to be the scoring error above, so treat it as method, not as measured
    fact. Check the spec and the rubric before concluding anything about models.
13. **Do not swap models chasing fidelity [M].** Measured on the same rubric: qwen
    35/35 and seedream-flash 34/35 on one frame, both 6/8 on the other; seedream-pro
    was the *least* adherent (5/8) while being 4x slower. Model choice buys speed and
    plate capacity, not rule-following.

## Model choice, measured (2026-10-24, n=5 per model on one frame)

| Model | Speed | Verified success | Aurora (of 35) | Scooby p1 (of 8) \u2020 | Use it for |
|---|---|---|---|---|---|
| `qwen/qwen-image-2.1-turbo` | 36-49s | 11/11 | **35/35** | 6/8 | default; `n` up to 6, so it can batch samples |
| `bytedance-seed/seedream-5-0-flash` | **18-29s** | 11/11 | 34/35 | 6/8 | fast iteration |
| `bytedance-seed/seedream-5-0-pro` | 109-178s | 9/11 | not scored | **5/8** | avoid unless a long brief demands it |

All three returned 1640x2048 for a 2K 4:5 request. None reported a per-render cost.

\u2020 **The Scooby column is unreliable and kept only for the record.** It included an
invented check ("no phone in anyone's hand") that scored a spec-mandated nail file as a
violation, plus a text check the user could not confirm on the pixels — see the
corrections in `references/evidence-log.md`. The Aurora column (qwen 0/35 misses, flash
1/35) is unaffected, since its items produced no false failures. **Do not cite the
Scooby scores as evidence that one model follows rules better than another.**

## What to read when

| You want to… | Read |
|---|---|
| Know what has actually been measured, with numbers | `references/evidence-log.md` |
| Understand prompting mechanics (framing, negation, occlusion, counts, plates) | `references/prompt-mechanics.md` |
| Design a rendering plan a human can judge | `references/evaluation-method.md` (scoring sections superseded) |
| Look up a known failure mode (vision-derived rows are suspect) | `references/failure-catalogue.md` |
| Know what a model costs and can accept | `references/costs-and-capabilities.md` |

## Related skills (do not duplicate them)

- `openrouter-image-generation` — API mechanics, endpoints, the logging convention.
- `studio-universe` — the deterministic prompt compiler and the canon.
- `studio-imagegen` — rendering a frame spec end to end, with provenance sidecars.
- `studio-mediagen` — video clips and voiceover, where the money actually goes.

## Extending this

Append to `references/evidence-log.md` with: date, question, arms, samples per arm,
resolution, and the result. Tag new claims with the same four labels, and demote a
previous claim to **[U]** if a later run fails to reproduce it. No claim keeps its
**[M]** without a sample count behind it.
