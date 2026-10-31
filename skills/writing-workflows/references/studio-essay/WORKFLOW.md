# Essay

A rewrite for publication, not a new take: the essay inherits the script's voice and structure and must not introduce claims the script does not make.

## Use it

```bash
cd <installed-package>/references/studio-essay
scripts/run.sh --stage essay --script <script>.json
```

`--dry-run` resolves config and prints what would be sent, with no key and no network:

```bash
scripts/run.sh --stage essay --dry-run
```

## Input

`--script` — the master script JSON (bare draft or an artifact wrapper).

A master script looks like `{ "title": "…", "sections": [{ "title": "…", "body": "…" }] }`.
Produce one with the [studio-script](../studio-script/WORKFLOW.md) skill.

## Output

`{ title, content }` — `content` is Markdown, ready for a press root.

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

- Long scripts produce long essays; there is no length flag — trim by editing the script, not the prompt.
- Markdown comes back as a string inside JSON, so check the fences survived before publishing.

## Definition of done

- The draft file exists and matches the shape above.
- The usage log was written (it is what the ledger backfills from).
- For a fan-out stage, the draft traces back to the script it was given — never regenerate the
  script to fix a downstream draft.

## Tests

```bash
node --test
```
