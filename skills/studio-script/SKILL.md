---
name: studio-script
description: "Use when turning an idea or rough draft into a master script — or when revising one. This is the source every other studio writing skill reads."
license: MIT
metadata:
  version: "1.0.0"
  author: ponti-studios
  category: Creative
  tags:
    - ponti-studios
    - writing
    - script
---

# Master script

This is the only writing skill that takes prose. Everything downstream consumes its JSON output, so the script is the approval gate: get it right before fanning out, because regenerating a fan-out stage never re-runs this one.

## Use it

```bash
cd ~/.agents/skills/studio-script
scripts/run.sh --brief "the idea" --out "$STUDIO_DRAFTS_DIR"
```

`--dry-run` resolves config and prints what would be sent, with no key and no network:

```bash
scripts/run.sh --brief "x" --dry-run
```

## Input

`--brief` — the idea or rough draft; `@path` reads a file.

A master script looks like `{ "title": "…", "sections": [{ "title": "…", "body": "…" }] }`.
Produce one with the `studio-script` skill.

## Output

`{ title, sections: [{ title, body }] }` — prose per section, not bullets.

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

- A brief that is already well organised still gets restructured — say what to preserve if that matters.
- The script is data, not an article: sections are the unit, and every fan-out skill reads them by title and body.

## Definition of done

- The draft file exists and matches the shape above.
- The usage log was written (it is what the ledger backfills from).
- For a fan-out stage, the draft traces back to the script it was given — never regenerate the
  script to fix a downstream draft.

## Tests

```bash
node --test
```
