# Stage 2 — Generate

Goal: actually create the image via OpenRouter and save it to the Desktop,
each run in its own output folder.

## Steps

1. Write the brief summary from Stage 1 to a temp file (or pass via `--brief-file`).
2. Run the script from the skill directory **3 times** with the same prompt —
   generation always produces 3 versions, this is fixed and never a question
   for the user:

   ```bash
   bun run scripts/generate-image.ts --prompt "<final prompt>" --name "<short-slug>-v1" --brief-file "<path to brief>"
   bun run scripts/generate-image.ts --prompt "<final prompt>" --name "<short-slug>-v2" --brief-file "<path to brief>"
   bun run scripts/generate-image.ts --prompt "<final prompt>" --name "<short-slug>-v3" --brief-file "<path to brief>"
   ```

   - `--model` is optional; defaults to `google/gemini-3.1-flash-image-preview`.
     Only pass it if the user explicitly asked for a different model.
   - `--name` should be a short kebab-case slug derived from the subject
     (e.g. `neon-fox-portrait-v1`) — the script appends a timestamp itself.
3. The script requires `OPENROUTER_API_KEY` in the environment. If it exits
   with a missing-key error, tell the user to set it and stop — do not ask
   them to paste the key into chat.
4. Each OpenRouter call also logs its response metadata (model, token usage,
   provider, finish reason) to `~/.hominem/ai_usage/<timestamp>.json` — this
   happens automatically inside the script, nothing to do here. A logging
   failure is non-fatal and doesn't block the image from saving.
5. Read each run's stdout for its two saved file paths (image + sidecar
   brief, both inside that run's own `~/Desktop/<slug>-<timestamp>/` folder)
   and pass all of them to the deliver stage.

## Gate

Each run must exit 0 with both file paths printed. A run that returns a
text-only response with no image (an occasional model quirk, not a rejection)
should be retried once automatically before surfacing an error. On any other
non-zero exit, surface the script's error message to the user verbatim rather
than retrying silently — it may mean a bad model name, an invalid key, or an
OpenRouter-side error worth showing as-is.
