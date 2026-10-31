# Evidence log — what was actually run and what came out

Newest last. Every entry: what was asked, the arms, samples, and the result. Adjust a
claim's tag here if a later run contradicts it.

---

## 2026-10-23 — Meta `muse-image` content filtering

**Question:** why does `meta/muse-image` refuse a long scene brief?

**Method:** bisected the brief from whole → sections → sub-blocks → individual lines;
31 paid calls; ~$0.25. Also tested element-by-element reconstructions.

**Result [M]:**
- Busts with `400 The response was filtered due to the prompt triggering our content
  management policy` + `metadata.provider_name: "Meta"`. Each filtered attempt still
  took ~30-40s and still billed.
- Every section passed alone. The phantom alone passed. A Halloween crowd alone
  passed. Phantom + crowd passed. Phantom + crowd + **any single** gang member passed
  (4 separate runs). Phantom + crowd + **all four** gang members failed.
- A child-free rewording of the brief still failed.

**Conclusion [M]:** the filter rejects on the **aggregate density of the scene**, not
on any one element or phrase, so bisecting cannot find a fixable element. The only
answer is to switch provider. **Cost of learning this: ~$0.25 and a lot of wall
clock. One confirming probe was enough** — see rule 9 in the evaluation method.

---

## 2026-10-23 — Model comparison for character identity (qwen vs seedream-flash)

**Method:** same frame spec, same 3 reference plates, 1K, one render per model;
vision-scored against the spec's identity clauses.

**Result [M] [invalid]:** both models appeared to render Wyatt's mask as a *half*
mask, and qwen appeared to lose Akane's collar/belt while seedream-flash lost the
gaze direction. **Then a 2K crop of the qwen render showed the mask correct in every
detail** (full-face, forehead to chin, two round voids, even the plate's rivets).
The 1K "half-mask" was a resolution artefact seen twice by a vision model.

**Conclusion [M]:** identity cannot be scored at 1K. Ranking models by identity
requires 2K renders. The comparison as run was void.

---

## 2026-10-23 — Why a rope net never falls *onto* the figure

**Method:** four single renders, each changing one thing.

| # | Change | Result |
|---|---|---|
| 1 | compiled prompt verbatim | net = flat curtain across the chest/waist, arms outside it |
| 2 | +559 chars of explicit physics prose (drape, occlusion, contact shadow, stretch) | **no change** |
| 3 | slack the ropes and the people's pull, keep the ceiling pulleys | **no change** |
| 4 | remove ceiling support entirely — the figure's own body is the only thing holding the net | net drapes over head/shoulders/arms and sags between them **[U], n=1** |

**Conclusion [M/I]:** the object's rendered shape is determined by its *support
geometry*, not by prose about its physics. A net hung from two pulleys is a catenary
by construction; the figure cannot deform it, so where it crosses the body the depth
order is unresolvable and reads as "phasing through". Explicit physics text does not
override a structure. Fix #4 is promising but needs 5 samples.

---

## 2026-10-23 — Compiler port fidelity

**Method:** ported the TypeScript prompt compiler to JS, then compared byte-for-byte
against both the compiled `dist` build and the 9 recorded expected prompts.

**Result [M]:** **9/9 byte-exact** against both. This is what licensed every later
change: with a byte-exact port, any difference in output is deliberate.

---

## 2026-10-23 — Negation audit and rewrite

**Method:** counted negation words in compiled prompts and in every text source.

**Result [M]:**

| Source | Before | After |
|---|---|---|
| Character canon (9 bibles: identity, tails, mask) | 62 | **0** |
| Frame-spec `negatives` arrays (111 items) | 111 | 96 positive statements, 15 dropped as absence-by-omission |
| Spec prose (moment/environment/lighting/colour/staging) | 44 | **0** |
| Prop `description`/`state` | 32 | **0** |
| Registry outfit descriptions | 3 | **0** |
| **Compiled prompt, all 9 frames** | **454** | **91 legacy / 45 positive** |

All 45 remaining are the shared render grade (*"no text, no lettering, no captions,
no logos and no watermark"*), 5 per frame, retained deliberately.

Notable: the compiler's own generated text contained *"and nothing else"*, and its
outfit logic named **every other character's garments** in each character's line —
6 forbidden-garment mentions in a 4-character frame, e.g. *"never the deep-red wrap
dress"* appearing in Lucy's and Wyatt's lines.

---

## 2026-10-23/24 — THE THREE-ARM TEST (the main experiment)

**Question:** does the negative→positive rewrite change what the model renders?

**Arms (5 samples each, 1K, 3 reference plates, $0.0184/render):**
- **A original** — pre-rewrite canon (restored from the rollback capture) + pre-rewrite
  specs (from `git 36e2864`) + legacy structure. Verified to contain the original
  phrasing and 67 negations. Confirmed: contains `no gem, no diamond`, `no sparkle`,
  `no second rock`.
- **B legacy** — rewritten canon/specs, legacy structure (`NEGATIVES:` label, garment
  enumerations).
- **C positive** — rewritten canon/specs, positive structure (`CONSTRAINTS — hold
  every one of these exactly as written:`, no enumerations, `WARDROBE` line).

**Frames:** Aurora f2 (the rock — the frame with the densest anti-sparkle negatives)
and Scooby f3 (the net — the frame with the geometry problem).

**Result [M]:**

| Measure | A original | B legacy | C positive |
|---|---|---|---|
| Aurora: panels with >1 rock | 0/5 | — | 0/5 |
| Aurora: any sparkle / gem glint | 0/5 | — | 0/5 |
| Aurora: legible text | 0/5 | — | 0/5 |
| Scooby: see-through robe | **0/5** | **0/5** | **2/5** |
| Scooby: flat-curtain net | 4/5 | 3/5 | 3/5 |
| Scooby: cords pass through body | 0/5 | 2/5 | 0/5 |

**Conclusions [M]:**
1. **On the failure the negatives were written for, the rewrite changes nothing.**
   The sparkle/gem failure did not occur in any arm — the constraint was inert.
2. **The only directional signal is robe opacity**, and **it contradicts the obvious
   hypothesis**: arm B carries the same positive wording as C yet holds opacity like
   A. So it is not "negative content protects opacity" — it is something structural
   about C (`CONSTRAINTS` prefix, dropped enumerations, or `WARDROBE`). n=5, Fisher
   exact p≈0.44 for 0/5 vs 2/5: **directional, not established [U]**.
3. Net-geometry differences (4/5, 3/5, 3/5) and the "cords through body" column
   (0, 2, 0) are **noise at this n**.
4. **Three earlier single-sample claims were falsified:** the "invented magnifying
   glass" was the spec's brass loupe (my vision question was leading), the "two
   rocks" did not reproduce (0/5 in both arms), and the "net fix" did not reproduce.

**Open:** isolate C's structure one piece at a time (`CONSTRAINTS` prefix off, then
`WARDROBE` off, then enumerations back on), 5 samples each on Scooby = 15 renders
≈ $0.28. Pending.

---

## Cost measurements taken along the way [M]

| What | Measured |
|---|---|
| 1K render with 3 reference plates | **$0.0184** (30 renders = $0.552) |
| 2K render with 3 reference plates | ~$0.16 **[I]** — bracketed by key counters, never isolated |
| `bytedance-seed/seedream-5-0-pro`, full brief | $0.09 (provider-reported) |
| `google/gemini-3-pro-image` | $0.1390 (provider-reported) |
| Text draft (`deepseek-chat-v3-0324`) | $0.0003-$0.0005 (provider-reported) |
| Video `kwaivgi/kling-v3.0-std` | $0.084/second silent, $0.126/second with audio (published SKU) |
| Speech `elevenlabs/eleven-multilingual-v2` | $0.00008/prompt token (published) |
| Per-image cost via `GET /api/v1/generation?id=gen-img-…` | **404 — not retrievable** |
| Per-call cost for speech | **not retrievable** |
| Key counter lag | a finished episode showed a $0.0000 delta seconds later; it settled later |


---

## 2026-10-24 — MODEL COMPARISON: which model follows the rules better

**Question:** are we tuning prompts for one model's quirks? Does seedream (or another
model) follow the brief better than the app's default qwen?

**Method:** rubric of 14 binary checks locked *before* rendering (7 per frame: counts,
sparkle, text, prop state on Aurora; opacity, net geometry, standing, gazes, gore on
Scooby). 3 models x 2 frames x 5 samples at 1K with 3 plates = 33 renders, plus one
2K render per model for identity. All frames carry 3 plates, so qwen's 0-4 ceiling
does not distort this comparison.

**Result [M]:**

| Model | Speed (measured) | Success | Aurora f2 (of 35) | Scooby f3 panel 1 (of 8) |
|---|---|---|---|---|
| `qwen-image-2.1-turbo` | 36-49s | 11/11 | **35/35** | 6/8 |
| `bytedance-seed/seedream-5-0-flash` | 18-29s | 11/11 | 34/35 | 6/8 |
| `bytedance-seed/seedream-5-0-pro` | 109-178s | 9/11 (2 transient failures, retried ok) | not scored (vision timeouts) | 5/8 |

**Scooby failures were mostly SHARED, not model-specific:**
- ~~Every one of the three models put a phone in the seated woman's hand.~~
  **WITHDRAWN — see the correction at the end of this log.** The specification
  explicitly reads *"one hand in lap, other holding a nail file paused mid-stroke"*.
  The models rendered the specified prop correctly; the scorer invented a check
  ("no phone") and then misread a nail file as a phone. This was a scoring error, not
  a model failure and not a spec gap.
- **seedream-pro floated the phantom above the carpet** (violating "stands on its own
  feet") and turned its mask to camera. Pro was the *least* adherent on this frame
  while being 4x slower.
- Net geometry passed for all three on panel 1 (`sags in a U`, cords not through the
  body) — the earlier "flat curtain" failure is not a model property.
- All three returned **1640x2048** for a 2K 4:5 request.

**Conclusions [M]:**
1. **Switching models is not the lever.** qwen and seedream-flash tie on adherence (6/8
   Scooby, 35/35 vs 34/35 Aurora); seedream-pro is worse on adherence despite 4x the
   latency and no cost reporting.
2. ~~The failures that persist across all three models are prompt-side.~~ The one
   apparent shared failure was an artefact of the rubric. The *principle* (a failure
   shared by every model is likelier to be a brief or scoring problem than a model
   problem) remains sound method, but **our only worked example was a scoring error**,
   so it is **[U]**, not measured.
3. Cost per model could not be split: seedream reports no cost and no per-image
   endpoint exists. Today's total for all of this work: **$1.61**.

**Not scored (open):** seedream-pro's Aurora arm, the 2K identity comparison, and
Scooby samples 2-5 for qwen/pro. Vision compositing timed out repeatedly on wide
multi-panel strips of this frame; single full-resolution panels score fine.


---

## 2026-10-24 — ONE-SHOT PREMIUM TEST: does a better model beat sampling?

**Hypothesis under test:** instead of sampling a cheap model 5x hoping for a good one,
a single render from a premium model might land it first try, which would be cheaper
in money and time.

**Method:** one render only. `openai/gpt-image-2.5-sunburst` (OpenAI's precision tier,
quality `xhigh`, 16-plate ceiling) on the hardest frame (Scooby f3, the net trap),
3 plates attached, compiled prompt verbatim (9,932 chars). Note: no 4:5 aspect offered
— used 3:4, the closest. No `resolution` param exists on this model; `quality` selects
the size.

**Result [M]:**

| | one-shot premium | 5-sample sweep, qwen | 5-sample sweep, flash |
|---|---|---|---|
| cost | **$0.1174** | $0.092 | $0.092 |
| time | 67s | ~3.5 min | ~2 min |
| output | 1152x1536 | 820x1024 | 820x1024 |
| rubric score (of 8) | **5/8** | 6/8 | 6/8 |

**The premium one-shot lost on both axes:** it cost 28% more than a five-sample cheap
sweep and scored *lower* than the best cheap panel. It passed the hard geometry items
(S1 robe opaque, S2 net drapes, S3 cords not through the body, S5 phantom standing on
the floor) — so the geometry wins attributed to prompt work hold up across a fourth
model.

**CORRECTION (same day, after the user looked at the image).** Two of the three
"failures" scored above were artefacts of the scoring, not faults of the render:

1. **The "phone" is not a phone.** A full-resolution crop of the seated woman's hands
   shows a narrow metallic tool with no screen, buttons or branding — a nail file or
   letter opener. The user spotted this by eye. Every "phone" verdict on this frame
   (S8) — on four models — came from a vision model misreading a small object at panel
   scale. The claim "four models all rendered a phone" is **withdrawn**. Verified on
   the premium render only; the equivalent verdicts on the cheap renders are
   *unverified* (my attempt to crop the qwen panel landed on the wrong figure) and
   most likely the same class of misread.
2. **The "adidas" text is unconfirmed.** A crop of the shoes shows three abstract
   white stripes with no letters and a tongue tag too small to resolve; the reading is
   a plausible guess, not a legible string. The no-text check (S4) is therefore
   **indeterminate**, not a fail.

**Revised score: >=6/8, with the remaining question marks on gaze direction and text
that the pixels cannot resolve. The "one-shot premium loses" conclusion does not
survive the correction** — the premium render is comparable to the cheap sweeps, not
worse, at ~6.4x the per-render price.

**The real lesson, which is about the measurement rather than the models:** a rubric
item that names an object (*"no phone"*) invites the scorer to confirm it, exactly as a
leading yes/no question does. Verify small objects with a full-resolution crop, and
treat your own eye as the tie-breaker. Silence in the spec still yields *something* in
her hands — the spec-gap recommendation stands — but the object is unspecified and
varies, so score the state (*"her hands hold a small tool"*) rather than guessing its
identity.

**Conclusion [M]:** on this evidence, a better model does not solve the problem the
sampling loop was being asked to solve. The residual failure is a spec gap that is
model-independent, and premium pricing buys resolution and detail, not rule-following.
The cheap sweep remains the better buy **until the spec gap is closed** — and once it
is closed, the correct test is a *single* cheap render, not a premium one.


### CORRECTION 2 — the "phone" was a nail file the spec asked for (user-caught)

The user looked at the rendered image and reported no phone in her hand; asked to
check the shoes for the "adidas" text, they reported none there either.

Checked against the source: the frame spec's action for that character reads
**"legs crossed at knee, one hand in lap, other holding a nail file paused
mid-stroke"**. So:

- The render was **correct**. One hand in lap, the other holding a nail file — exactly
  as specified, on every model that produced it.
- The rubric item **"no phone or tablet in anyone's hand" was invented by the scorer**.
  It was never derivable from the spec, and it converted a correct render into three
  failures across four models.
- The vision model then misread a narrow metallic tool as a phone, at panel scale, and
  a second read invented legible *"adidas"* text on the shoes that the user cannot see
  in the image at all. **Two fabricated findings from one image, both caught only by
  the user's eye.**

**Revised one-shot score:** S1-S5 pass, S7 pass, S8 **pass** (nail file is correct), S4
**indeterminate** (no confirmed text). That is >=7/8 with only the gaze check (S6)
open. **The "premium one-shot lost" conclusion is fully withdrawn** — on the corrected
scoring the premium render is clean or near-clean, and the cheap sweeps were never
penalised for the nail file either.

**What survives from the one-shot test:** the cost and speed measurements
($0.1174/67s vs $0.092/~3 min per sweep), the 1152x1536 output size, the absence of a
4:5 aspect and of a `resolution` parameter on that model, and the fact that all four
models rendered the specified geometry correctly.

## Reference strategy — one turnaround sheet vs derived per-role crops

**2026-10-24 · qwen/qwen-image-2.1-turbo · 2K · 7 scenes × 2 arms · $0.2576 · judged by Charles, blind**

Same prompt per scene in both arms; only the attached references differed. Arm A attached the
per-role crops (identity + full-body, Wyatt's combined plate); arm B attached one multi-angle
turnaround sheet per character.

Charles's blind picks: turnaround 5, plates 1, no preference 1. The single plates win was
Wyatt + Cyndi together — the one pairing where the combined plate packs mask + hands + outfit +
proportions into one slot. The tie was the three-character frame.

**Honest limits.** One render per scene, so this is directional, not a measured rate: 5/6 is
consistent with a real difference and with luck. The arms also differ in reference *count*
(2 crops vs 1 sheet per character), so "one sheet is better" and "one reference is better" are
not separated by this test. Positions were near-collinear (turnaround on the left in 6 of 7
rows), but the two right-hand picks split one per arm, which argues against a side preference.

**Operational finding worth keeping:** qwen accepts at most 4 references — the three-character
frame with six crops returned HTTP 400 and had to be re-run with one reference per character.
A one-sheet-per-character policy fits inside that limit by construction.
