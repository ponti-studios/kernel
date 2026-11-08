---
name: tower-bridge
description: "Use when building a video with the tb CLI (Tower & Bridge)."
license: MIT
---

# Tower & Bridge (tb) video pipeline

## When to Use

- Building or rebuilding a Tower & Bridge episode video (idea / essay / episode mode).
- Running the tb pipeline stages: new, script, audio, align, specs, stills, render.
- Diagnosing specs validation failures, stale stages, or render issues.

`tb` turns an idea, essay, or existing script+audio into a 1920×1080/30fps MP4 with captions and chapters. Repo: `~/Developer/tower-bridge`. CLI installed editable (`pip install -e .`).

## Chain (episode mode, the common case)

1. `tb new <slug> --mode episode --script <script.md> --audio <master.mp3> --words <words.json> --title "..." --accent contention --root <episodes>`
2. `tb script <slug> --root <episodes> --provider fixture` then `tb approve <slug> script --by <name> --root <episodes>`
3. `tb audio <slug> --root <episodes>` (fixture mode copies `providers/audio/master.mp3` + `words.json`)
4. `tb align <slug> --root <episodes>`
5. `tb specs <slug> --root <episodes> --provider fixture` (or `command` with `TB_SPECS_CMD`)
6. `tb stills <slug> --root <episodes> --scale 1` then `tb approve <slug> stills --by <name> --root <episodes>`
7. `tb render <slug> --root <episodes> --scale 1 --concurrency 2`

Idea/essay modes run the writer provider instead of starting from a script; smoke fixture is `scripts/demo.sh`.

## Fixture provider layout

- `providers/specs.json` — the planner output (must exist for `--provider fixture`).
- `providers/audio/master.mp3` + `providers/audio/words.json` — for the audio stage.
- Copy from `fixtures/<name>/providers/...` into the episode's `providers/` before running.

## Specs validation (strict in current main)

- One section per turn, in script order; first section `title`, last `close`.
- Visual kinds (`process`, `chart`, `build`, `compare`, `diagram`, `race`, `custom`) need a `shot` with a `transformation` and ≥2 beats; otherwise demoted to `statement`.
- Shot beat `cue` must be a verbatim phrase from the section's narration words (resolved against `align.json`). An unresolvable cue fails validation.
- Shot `intent` must be one of: `evidence`, `mechanism`, `contrast`, `chronology`, `verdict`, `transition`, `spectacle`.
- Schema field names that bite: statement uses `support` (not `body`); diagram uses `note` (not `caption`) and has no `x`/`y` on nodes; `close` requires `signoff`; chart bars use `label`+`value`.
- Grounding: numbers in content must appear in the section's provenance turn(s) or an earlier turn (zero tolerance). The check only recognises digit tokens (`0-9`), so a script that spells numbers as words ("ninety-nine") yields zero grounded digits — any visual carrying a numeric value fails. Consequence: `chart` bars (numeric `value`) and diagram `value`s are unusable with word-numbered narration unless the narration contains digits; use `process`/`statement` with word labels, or add digits to the script (and regenerate audio).
- Defects (variety, peaks, statement-share) are soft warnings printed by `tb specs`; the stage still completes.

## Pitfalls

- Silent audio: if you generate audio with `anullsrc` for a quick build, the video has no sound. Use a real master.mp3 (trim with ffmpeg `-t <seconds>`) to get audio.
- Render of a multi-minute 1080p video takes several minutes; the terminal tool caps foreground runs at ~180 s, so run `tb render` in the background (`background=true`, `notify_on_complete`) and poll, or split into shorter episodes.
- The fixture `specs.json` (9-turn bake-off) has shot cues that no longer resolve under the new stricter validation; fix cues to verbatim words from the narration before validating.
- `tb specs` via the opencode provider (`TB_SPECS_CMD=...providers/__pycache__/tb_specs_opencode.cpython-313.pyc`) can produce visual kinds, but their shots often fail cue/grounding checks and get demoted to statements. Prefer a hand-fixed variety specs for choreography demos.
- Slides must represent what the narration says: build one section per turn, content grounded in that turn's words (no invented quantities), and verify the contact sheet against the audio before approving stills.
- A `.pyc` provider can be invoked directly: `python3 providers/__pycache__/tb_specs_opencode.cpython-313.pyc`.

## Status / gates

`tb status <slug> --root <episodes>` shows stage freshness and gates. `specs=pass, manifest=pass, contact-sheet=pass, duration=pass, outputs=pass` means a clean build. Stale stages must be regenerated.
