---
name: animated-presentation
description: "Build an animated video with the tb CLI: idea, essay, or episode to captioned MP4."
version: 1.0.0
author: Charles Ponti
license: MIT
platforms: [macos, linux]
metadata:
  hermes:
    tags: [video, tb, tower-bridge, remotion, tts]
    related_skills: []
---

# Animated Presentation (`tb` CLI)

`tb` turns an idea, an essay, or an existing script+audio episode into a
finished 1920×1080 / 30 fps video: a Remotion render reconciled to the master
audio, captions from word timestamps, and YouTube metadata with chapters.
Two hosts (Harriet Tower, Ted Bridge). Repo: `~/Developer/tower-bridge`
(CLI installed editable via `pip install -e .`). Contract: `SPEC.md` in the repo.

## When to Use

- Building or rebuilding an animated video (idea / essay / episode mode).
- Running the `tb` pipeline stages: new, script, audio, align, specs, stills, render.
- Setting up or troubleshooting `tb` (install, providers, render).
- Diagnosing specs validation failures, stale stages, or render issues.
- NOT for: Ponti Studios `studio-*` skills (different pipeline).

## Prerequisites

- Node 20+, Python 3.11+, ffmpeg/ffprobe on PATH.
- Install: `python3 -m venv .venv && . .venv/bin/activate && pip install -e .`
- Remotion: `cd remotion && npm ci && npx tsc --noEmit && npx remotion browser ensure`.
- API keys in env (never in repo): `OPENROUTER_API_KEY`, `TB_SCRIPT_CMD`, `TB_AUDIO_CMD`, `TB_SPECS_CMD`, `TB_TRANSCRIBE_CMD`.

## How to Run

```sh
tb new <slug> --mode idea|essay|episode [--input file] [--script s] [--audio a] [--words w]
tb run <slug>                 # runs the chain, stops at checkpoints
tb approve <slug> script|stills --by <name>
tb status <slug>
```

Stages are also separate verbs: `script audio align specs stills render`.
`tb status <slug> --root <episodes>` shows stage freshness and gates:
`specs=pass, manifest=pass, contact-sheet=pass, duration=pass, outputs=pass`
means a clean build. Stale stages must be regenerated.

## Three Modes

- **idea** — 1-2 sentences (verbatim in `input/idea.md`). Writer expands into a two-host script.
- **essay** — >=1500 words. Adapts into a script; requires `input/mapping.md` (every essay section mapped to turns or cut with a reason).
- **episode** — existing `script.md` + `master.mp3` (+ optional `words.json`). Skips generation.

## Chain (episode mode, the common case)

1. `tb new <slug> --mode episode --script <script.md> --audio <master.mp3> --words <words.json> --title "..." --accent contention --root <episodes>`
2. `tb script <slug> --root <episodes> --provider fixture` then `tb approve <slug> script --by <name> --root <episodes>`
3. `tb audio <slug> --root <episodes>` (fixture mode copies `providers/audio/master.mp3` + `words.json`)
4. `tb align <slug> --root <episodes>`
5. `tb specs <slug> --root <episodes> --provider fixture` (or `command` with `TB_SPECS_CMD`)
6. `tb stills <slug> --root <episodes> --scale 1` then `tb approve <slug> stills --by <name> --root <episodes>`
7. `tb render <slug> --root <episodes> --scale 1 --concurrency 2`

Smoke fixture is `scripts/demo.sh` (0.25 scale).

## Fixture provider layout

- `providers/specs.json` — the planner output (must exist for `--provider fixture`).
- `providers/audio/master.mp3` + `providers/audio/words.json` — for the audio stage.
- Copy from `fixtures/<name>/providers/...` into the episode's `providers/` before running.
- Fixture provider reads `providers/specs.json`, not `providers/specs/specs.json`.

## Provider Seam

No model/voice/credentials in the repo. Each creative stage is a seam:

- `fixture` — JSON/media already in the episode (golden fixtures, tests).
- `command` — operator-configured program speaking the JSON contract (`TB_*_CMD`).

Provider contract details: `docs/PROVIDERS.md` in the `tower-bridge` repo.

## Specs validation (strict)

- One section per turn, in script order; first section `title`, last `close`.
- Visual kinds (`process`, `chart`, `build`, `compare`, `diagram`, `race`, `custom`) need a `shot` with a `transformation` and ≥2 beats; otherwise demoted to `statement`.
- Shot beat `cue` must be a verbatim phrase from the section's narration words (resolved against `align.json`). An unresolvable cue fails validation.
- Shot `intent` must be one of: `evidence`, `mechanism`, `contrast`, `chronology`, `verdict`, `transition`, `spectacle`.
- Schema field names that bite: statement uses `support` (not `body`); diagram uses `note` (not `caption`) and has no `x`/`y` on nodes; `close` requires `signoff`; chart bars use `label`+`value`.
- Grounding: numbers in content must appear in the section's provenance turn(s) or an earlier turn (zero tolerance). The check only recognises digit tokens (`0-9`), so a script that spells numbers as words ("ninety-nine") yields zero grounded digits — any visual carrying a numeric value fails. Consequence: `chart` bars (numeric `value`) and diagram `value`s are unusable with word-numbered narration unless the narration contains digits; use `process`/`statement` with word labels, or add digits to the script (and regenerate audio).
- Turn coverage: `tb specs` requires every spoken turn mapped exactly once in script order; a fixture specs.json covering fewer turns fails with "turn tN is not mapped".
- Turn word limits: target 60-220 words, warning 40-260, hard error over 300. `parse_script` raises `ValidationError` on >300. Split long turns.
- Defects (variety, peaks, statement-share) are soft warnings printed by `tb specs`; the stage still completes.

## Scene kinds (12 total)

`title`, `statement`, `build` (animated numbered list with connectors), `code` (highlighted lines), `race` (side-by-side lanes with outcome), `compare` (two panels), `diagram` (animated node-and-edge flowchart, SVG, 1000×420 viewBox), `chart` (animated bar chart with counting numbers), `timeline` (horizontal timeline with animated markers), `quote` (large pull quote on dark ground with accent quotation mark), `process` (numbered steps with accent numbers), `close` (headline + signoff, must be last).

- Using only `title`/`statement`/`close` scenes produces text slides. Prefer richer kinds for visual variety. The `Stage` component includes a subtle animated grid background (6% opacity, drifting) on every scene. The design law mandates black/white/greys + one accent; richer visuals require revising the design law, not just adding scenes.
- Extension protocol: a new kind = one Remotion component + a schema entry in `specs/specs.schema.json` + an entry in `KINDS` (`tb/manifest.py`) + a test still. Components take duration as a prop (fill exactly their section's frames). Kinds are never removed in a way that breaks existing specs; deprecate instead.

## Key Pitfalls

- **Silent audio:** if you generate audio with `anullsrc` for a quick build, the video has no sound. Use a real master.mp3 (trim with ffmpeg `-t <seconds>`) to get audio. The golden fixture uses a silent bed; never commit `*.mp3`/`*.mp4`/`*.wav` — they are gitignored; CI regenerates.
- **Render time:** a multi-minute 1080p video takes several minutes (5400 frames ≈ 2-3 min); the terminal tool caps foreground runs at ~180 s, so run `tb render` in the background (`background=true`, `notify_on_complete`) and poll, or split into shorter episodes. Use timeout ≥600s.
- **Stale stages after code changes:** status marks specs/stills/render stale; regenerate in order (specs → stills → approve stills → render), not render alone.
- **Stale fixture cues:** the fixture `specs.json` (9-turn bake-off) has shot cues that no longer resolve under stricter validation; fix cues to verbatim words from the narration before validating. `episodes/the-bake-off/specs.json` is review evidence for the 9-turn fixture, not the 19-turn episode; do not reuse it for the long script.
- **Opencode specs provider:** `tb specs` via the opencode provider can produce visual kinds, but their shots often fail cue/grounding checks and get demoted to statements. Prefer a hand-fixed variety specs for choreography demos.
- **Audio integrity:** master audio is passed through untouched (no re-encode except final mux); loudness measured and reported, never altered.
- **Word timestamps:** `align` needs `words.json`. If missing, set `TB_TRANSCRIBE_CMD` (whisper-cpp or Parakeet). Parakeet provides word-level timestamps via `--print-segments` (10ms frames; group tokens by `word_start=true`). Model must be downloaded separately. Without accurate timestamps, captions and manifest timing drift. In episode mode with no `words.json` and no transcriber, the audio stage fails.
- **Checkpoints:** `tb run` stops at script and stills. Use `--yes` to skip for a single run (logged). `--force` re-runs a current stage.
- **Mapping (essay mode):** every essay section (Markdown headings) must map to at least one turn or be cut with a reason. Unmapped sections fail `tb script`. The essay MUST contain `##` headings — title-only fails with "no sections found". Minimum 1500 words; shorter inputs should use idea mode. Idea mode produces `input/outline.md` (5-9 beats) and `input/sources.md` when the writer returns `outline`/`sources` fields.
- **Turn IDs:** specs reference turn ids like `t01`. Split turns produce `-2` parts (e.g., `t01-2`).
- **Accent audit:** red (`#E4181B`) only via the sanctioned mechanisms (Monotone mark + one named semantic state per video).
- **Git history:** assets must not enter git history. Use `git filter-repo --path-glob '*.mp3' --invert-paths` if they slip in, then force-push (refspec `+branch-name` form if `--force` is blocked). After cleanup, check `git log` — a worker agent may re-add assets in a follow-up commit; reset --hard to the clean commit and force-push again.
- **Slides must represent the narration:** one section per turn, content grounded in that turn's words (no invented quantities); verify the contact sheet against the audio before approving stills.

## Validating choreography / planner after a pull

- `cd remotion && npm ci` then `npx tsc --noEmit` (new commits add deps such as `@remotion/rive`).
- `pip install -e .` from repo root so `tb` resolves to this worktree, not a stale shim.
- `python -m pytest tests/test_components.py tests/test_planner_passes.py tests/test_shots.py tests/test_clean_frame.py tests/test_custom_scenes.py tests/test_smoke.py tests/test_idea_essay.py`
- `python3 evals/choreography/run_eval.py` (thresholds: example-match ≥80%, beat recall ≥80%, 0 grounding violations, demotes ≤10%).
- `python3 evals/planner/run_eval.py` (baseline 33/35; must not regress).

## Building a video from a fixture (no model)

1. Size silent audio to the fixture `words.json` last `endMs`: `ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t <seconds> ...`.
2. `tb new <slug> --mode episode --script <script.md> --audio <master.mp3> --words <words.json> --title ... --accent contention --root <episodes>`.
3. `cp fixtures/<name>/providers/specs.json <episodes>/<slug>/providers/specs.json`.
4. `tb script <slug> --provider fixture` then `tb approve <slug> script --by <who>`.
5. `tb audio <slug>` (fixture copies audio/words), `tb align <slug>`.
6. `tb specs <slug> --provider fixture`.
7. `tb stills <slug> --scale 1` then `tb approve <slug> stills --by <who>`.
8. `tb render <slug> --scale 1 --concurrency 2`.

## Verification

```sh
python3 -m unittest discover -s tests   # 65 tests, ~2 min
npx tsc --noEmit                          # in remotion/
bash scripts/demo.sh                      # smoke test, 0.25 scale
```

## OpenRouter TTS Provider

A working `TB_AUDIO_CMD` using OpenRouter's `gpt-audio-mini` (streams PCM16,
converted to MP3 via ffmpeg; word timings from Parakeet transcription of the
generated audio):

```sh
export TB_AUDIO_CMD="python3 <skill-dir>/scripts/openrouter_tts.py"
export OPENROUTER_API_KEY="sk-or-..."
tb audio <slug> --provider command
```

Gemini Flash Lite is text-only on OpenRouter (no TTS). The only audio-output
model is `openai/gpt-audio-mini`. Word timings come from Parakeet transcription
of the generated audio (not from the TTS). For a TTS that returns word timings
natively (OpenAI TTS, ElevenLabs, Google Cloud TTS), use the same seam.

Full provider source: `references/openrouter-tts.md`. Working implementation: `scripts/openrouter_tts.py` beside this file.
