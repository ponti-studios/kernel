---
name: studio-video
description: "Use when writing a YouTube script or a short-form video script from an approved master script."
license: MIT
metadata:
  version: "1.0.0"
  author: ponti-studios
  category: Creative
  tags:
    - ponti-studios
    - writing
    - video
---

# Video scripts

Two shapes from one source: long-form structure for YouTube, beat-driven for TikTok/Reels/Shorts. Both start from a hook because that is what decides whether the rest is watched.

## Use it

```bash
cd ~/.agents/skills/studio-video
scripts/run.sh --stage youtube --script <script>.json
scripts/run.sh --stage short-video --script <script>.json
```

`--dry-run` resolves config and prints what would be sent, with no key and no network:

```bash
scripts/run.sh --stage youtube --dry-run
```

## Input

`--script` — the master script JSON.

A master script looks like `{ "title": "…", "sections": [{ "title": "…", "body": "…" }] }`.
Produce one with the `studio-script` skill.

## Output

`youtube`: `{ title, hook, segments: [{ heading, script }], callToAction }`
`short-video`: `{ hook, beats: [string], callToAction }`

Written to `$STUDIO_DRAFTS_DIR/<stage>-<timestamp>.json`, with one usage log per call beside the
other skills' logs.

## Configuration

| Variable | Default | Used for |
|---|---|---|
| `STUDIO_DRAFTS_DIR` | `~/Documents/studio-drafts` | where drafts are written |
| `STUDIO_USAGE_DIR` | `~/.hominem/ai_usage` | one JSON log per call |
| `OPENROUTER_TEXT_MODEL` | `deepseek/deepseek-chat-v3-0324` | the model, unless `--model` overrides |
| `OPENROUTER_API_KEY` | env → `openrouter_api_key` in `~/.pontistudios.studio.yml` | the call |

All four can be set in `~/.pontistudios.studio.yml` (`drafts_dir`, `usage_dir`, `model_text`,
`openrouter_api_key`); an exported variable wins over the file.

## Pitfalls

- `segments` is long-form only; a short-form script with beats will not render as a YouTube script.
- The hook is rewritten per format — do not reuse the YouTube hook for a 30-second cut.

## Definition of done

- The draft file exists and matches the shape above.
- The usage log was written (it is what the ledger backfills from).
- For a fan-out stage, the draft traces back to the script it was given — never regenerate the
  script to fix a downstream draft.

## Tests

```bash
node --test
```
