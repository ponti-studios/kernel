---
name: studio-universe
description: "Use when compiling or editing Ponti Studios character canon or frame prompts. Compiles frame specs into deterministic prompts from the bibles."
license: MIT
metadata:
  author: project
  version: "1.0"
  category: Creative
  tags:
    - ponti-studios
    - universe
    - prompt-compiler
    - canon
---

# Studio Universe — canon and the prompt compiler

The universe is Chase's cast and the rules that keep it consistent across every
generation: **bibles hold every character fact, `registry.json` holds pointers
and extraction rules, and the compiler turns a frame spec into a prompt.**
Same inputs, byte-identical output, every time.

## When to use

- Building a prompt for any frame containing universe characters.
- Adding or editing a character, outfit, tail block, or mask block.
- Editing a bible (prose, heights, identity blocks).
- A generated image drifted (wrong outfit, wrong proportions, mask wrong) and
  you need to know whether the canon or the renderer is at fault.

## Hard rule

**Never hand-write a character block into a prompt.** Compile it. The bibles
exist so an LLM does not re-derive Lucy's freckles or Wyatt's mask from memory
— that is exactly how a render ends up with hand tattoos the canon forbids or
a phantom floating inside the screen instead of standing on the stage.

## Where things live

| Thing | Path | Authority |
|---|---|---|
| Character facts | `data/bibles/<character>/PROMPT.md` | sole authority on that character |
| Pointers + rules + structured data | `data/registry.json` | extraction rules, outfits, heights, shared blocks |
| Naming / who-is-who | `data/UNIVERSE.md` (+ `data/ledger-history.csv`) | names, fold records, citizen list |
| Frame specs | `sets/<set>/specs/frame*.json` (fixtures: `test/fixtures/specs/`) | the frame's own geography |
| Expected prompt output | `test/fixtures/expected/*.prompt.txt` | regression baseline |

Everything above is **inside this skill**. A studio checkout is not required to
read canon or compile a prompt; `scripts/lib/resolve.mjs` prefers `data/`.

Marker convention: `<!-- PROMPT-BLOCK-START: <id> -->` … `<!-- PROMPT-BLOCK-END: <id> -->`.
The compiler extracts marker-to-marker and strips the marker lines.

## Two voices

The compiler has two modes, and the difference is not cosmetic:

| Voice | What it emits | Use for |
|---|---|---|
| `positive` (**default**) | states what IS; garments attributed only to their owner; `CONTENT` instead of `NEGATIVES`; a `WARDROBE` distinctness line | generation |
| `legacy` | reproduces the app's output byte-for-byte, including `never the …` garment enumerations | app parity, and the fixture baseline |

Image models do not reliably represent negation — naming a thing raises the odds
of it appearing, whether or not the sentence says "no". The legacy compiler
shipped 40-129 negation words per frame, and its outfit logic told **every**
character about the **other** characters' garments as prohibitions
(`never the deep-red wrap dress` appears in Lucy's and Wyatt's lines). In a
four-character frame that is six forbidden-garment mentions, which is a
dress-swap generator — the failure mode is in `output/kit-evidence/`.

## Procedure: compile a frame prompt

1. Write or pick the frame spec (contract: `references/frame-spec.md`).
2. Check cast readiness — `scripts/registry-report.sh` shows height,
   outfit count, tail blocks and whether a mask block exists.
3. Compile:
   ```bash
   scripts/compile-frame.sh <spec.json> --out /tmp/frame3.prompt.txt --report-negations
   ```
   It refuses with a named code (`COMPILE REFUSED — MISSING_FIELD`) rather
   than emitting a prompt with a hole in it. Exit 1 = spec rejected,
   exit 2 = usage/lookup problem. `--report-negations` lists the canon blocks
   still shipping negation, which is the rewrite workload.
4. Use `--voice legacy` when you need the app's exact output, and
   `--compiler dist` to run the monorepo build itself (legacy only — asking for
   positive voice with the dist compiler is refused rather than silently
   downgraded).
4. Feed the compiled prompt to the renderer verbatim (see the
   `openrouter-image-generation` skill for the model choice and cost rules).
5. If the render still drifts, the fault is in the canon or the spec — fix it
   there and recompile. Never patch the prompt text by hand.

## Procedure: after ANY canon edit

Every edit to a bible, the registry, or the compiler must keep the fixture
suite byte-exact:

```bash
scripts/check-fixtures.sh    # expect: 9 byte-exact, 0 failed; exit 0
scripts/test.sh              # registry + schemas + root resolution + fixtures
```

Drift is a signal, not noise: an edit that changes a fixture's prompt changed
canon a frame depends on. Decide deliberately whether that is intended, and if
so re-record the expected output. Never edit the expected file to make the
check pass.

## Definition of done

- `check-fixtures.sh` exits 0 (or the drift is understood and re-recorded).
- `test.sh` passes — registry shape, bible markers, root resolution, fixtures.
- `registry-report.sh` still lists the character with the height, outfits and
  blocks you expect.
- No character prose was retyped into a prompt, spec, or skill — the compiler
  remains the only producer of block text.

## Scripts

Entry points are `scripts/*.sh` (bash wrappers that exec `node`); the
implementation is `scripts/lib/*.mjs`. Zero dependencies: ESM on Node 24, no
`npm install`, no build step.

| File | Job |
|---|---|
| `scripts/lib/compile.mjs` | the compiler — a direct port of `packages/universe/src/compile.ts`, byte-identical to it on all nine fixtures in legacy voice |
| `scripts/lib/resolve.mjs` | the single seam: where canon, the compiler and the fixtures live, plus `~/.pontistudios.studio.yml` |
| `scripts/lib/registry.mjs` | registry access — loads/validates the registry, resolves `data/registry.json` or `registry/registry.json`, character lookups |
| `scripts/lib/schemas.mjs` | registry + frame-spec shapes as plain checks (the zod schemas, message-for-message, without zod) |
| `scripts/lib/compile-frame.mjs` | CLI: spec → prompt |
| `scripts/lib/registry-report.mjs` | CLI: what the registry knows, per character |
| `scripts/lib/check-fixtures.mjs` | CLI: the byte-exact baseline |

**The skill is self-contained.** Canon lives in `data/`, the fixtures in
`test/`, and `compile-frame.sh` runs the ported compiler by default — reading a
bible, compiling a prompt or running the fixtures needs no monorepo, no
`pnpm build` and no network. `resolve.mjs` still *understands* a checkout for
one purpose: `--compiler dist` app-parity runs, which are skipped (and reported
as skipped) when no build is present. Nothing imports a repo module at load
time, so a deleted checkout cannot break the skill.

## References

- `references/frame-spec.md` — every spec field, and all 17 refusal codes with their fixes.
- `references/canon.md` — bible layout, marker convention, adding a character/outfit/tail, one-fact-one-home.
- `references/port-plan.md` — how these skills absorb the monorepo; the single implementation seam.

## Configuration

Nothing needs configuring: canon ships inside the skill at `data/`, and that is
the default root. The variables exist for the two cases where something else
should win — pointing at a live checkout, or pointing at a different canon.

All of these can be set once in `~/.pontistudios.studio.yml` (key names:
`studio_root`, `universe_root`) instead of exported; an environment variable
still wins over the file.

| Variable | Default | Used for |
|---|---|---|
| `STUDIO_UNIVERSE_ROOT` | the skill's `data/` | registry and bibles; set it to compile against another canon |
| `STUDIO_ROOT` | unset | no longer needed: the canon lives in this skill's `data/`; only a legacy dist build would use it, and none exists |
| `STUDIO_UNIVERSE_ENTRY` | `$STUDIO_ROOT/packages/universe/dist/index.js` | the built TypeScript compiler, if it lives elsewhere |
| `STUDIO_CONFIG` | `~/.pontistudios.studio.yml` | an alternative config file |

Root resolution order: `STUDIO_UNIVERSE_ROOT` → config `universe_root` → the
skill's `data/` → `$STUDIO_ROOT/universe`. **A candidate only counts if it
actually holds a registry**, so an environment variable left pointing at a
deleted checkout falls back to the shipped canon and says so on stderr instead
of failing the run.

Module overrides (`STUDIO_PROVIDERS_ENTRY`, `STUDIO_EDITORIAL_ENTRY`, `STUDIO_CONFIG_ENTRY`) belong to the other studio skills; this one needs only the universe overrides above.

## Pitfalls

- **Measured evidence on the positive-voice rewrite (3 arms x 5 samples x 2 frames).**
  Arms: A original wording + legacy structure; B rewritten wording + legacy
  structure (`NEGATIVES:` label, garment enumerations); C rewritten wording +
  positive structure (`CONSTRAINTS`, no enumerations, `WARDROBE`). 1K with
  character turnaround sheets, ~$0.018 per render:

  | measure | A original | B legacy | C positive |
  |---|---|---|---|
  | Aurora: panels with >1 rock | 0/5 | — | 0/5 |
  | Aurora: panels with any sparkle/glint | 0/5 | — | 0/5 |
  | Aurora: panels with legible text | 0/5 | — | 0/5 |
  | Scooby: panels with see-through robe | **0/5** | **0/5** | **2/5** |
  | Scooby: panels with a flat-curtain net | 4/5 | 3/5 | 3/5 |

  Conclusions that the data supports, and the ones it does not:
  1. **On the failures the negatives were written for, the rewrite changes
     nothing measurable** — the sparkle/gem failure did not occur in either arm,
     so the "negatives invite what they forbid" effect is not observable on the
     rock frame at 1K. Do not cite the rewrite as a quality win.
  2. **The one directional signal is robe opacity** (0/5, 0/5, 2/5). Note this
     argues AGAINST "negative content protects opacity": arm B carries the same
     *positive* wording as C yet holds opacity like A. The suspect is therefore
     the positive *structure* — the `CONSTRAINTS — hold every one of these
     exactly as written:` prefix, the dropped garment enumerations, or the added
     `WARDROBE` line — not the absence of negatives.
  3. **Single renders are not evidence.** Three separate single-sample claims of
     mine (an "invented magnifying glass", "two rocks", "the rewrite fixed the
     net") all failed to reproduce under 5 samples. The loupe was specified in
     the spec all along. Score with >=5 samples per arm, or not at all.
  4. The net-geometry differences (4/5 vs 3/5 vs 3/5) are noise, not an effect.
- **The shared render grade stays negative on purpose.** It contributes 5
  negations to every frame ("Absolutely no text, no lettering, no captions, no
  logos and no watermark"), and text/watermark suppression is the one place a
  negative earns its keep: the training signal is unusually strong there, and
  across every render inspected it worked — no text, lettering or logo appeared
  in any of them. Leave it; revisit only if an image actually ships with text.
- An unmatched negative in a spec's `negatives` list is **kept and reported**
  rather than dropped, because silently discarding a constraint loses
  information. Prohibitory garment tails (`— never the X`) are stripped while
  the positive half of the sentence is preserved.
- The compiler validates *structure*, not truth. A `DENYLISTED_PHRASE` refusal
  means a banned phrase crept into prose; a passing spec can still describe
  nonsense geography. Read the compiled prompt before rendering.
- Shared outfit ids must be declared in `spec.shared_outfits`, or the second
  cast member gets `SHARED_OUTFIT` — that check exists to stop two characters
  wearing the same garment in one frame.
- Every cast entry needs `outfit_id`. It is required when the character has
  outfits, and must be an explicit `null` when the character has none —
  omitting the key entirely is a `MISSING_FIELD` refusal even for a character
  with no outfits (Cyndi in, say, a costume-only frame).
- Anchors are matched by substring against `floorplan.anchors` keys, so renaming
  an anchor breaks every spec that referenced it.
- Choice of render model is not this skill's business; identity drift from a
  weak model is not a canon bug.

- **Read the spec before calling a render wrong.** A seated character appeared to hold
  a phone in every model's render; the spec's action line in fact says *"one hand in
  lap, other holding a nail file paused mid-stroke"*, and the models had rendered the
  specified prop correctly. The "violation" was an invented check plus a misread
  object. Before editing canon to fix a "failure", quote the spec sentence that the
  render violates — if there isn't one, the spec was never violated.
- **State the state of hands and props anyway.** Where the spec *is* silent about a
  hand, a pocket, a tray or a posture, the model decides for itself: prefer *"her hands
  are empty and resting in her lap"*, *"the tray of the case is empty"*, *"both feet
  flat on the stage boards"*. (Hypothesis, not measured — see `image-model-craft`.)

## Reference images

One **turnaround sheet** per character (`registry.json` → `plates.turnaround`), holding front,
three-quarter, profile, back and head views. All four sheets share the filename `turnaround.webp`,
so a folder is `PROMPT.md` + that one image; refer to a sheet by its folder (`wyatt/turnaround.webp`),
never by filename alone.

The derived crops (`identity-plate`, `full-body-plate`, `combined-plate`, `mask-plate`) were retired
after a blind test (October 2026, 7 scenes, 2 variants): the sheet was preferred in 5 of 6 decisions.
Record of that test: `image-model-craft/references/evidence-log.md`. Crop the sheet per job when a
frame genuinely needs a face-only or mask-only reference — never store a derived plate in the library.

Register policy: **animated-cel only**. Photoreal is paused; no photoreal reference is held, and
photoreal prose in the bibles is history, not guidance.
