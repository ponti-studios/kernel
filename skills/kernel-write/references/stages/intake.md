# Stage 0 — Intake & Canon

First stage. Nothing is drafted until the source and canon are set.

## Action

1. Identify the source material: notes, transcript, brief, rough draft, or conversation.
2. Classify the request — the content pipeline (essay-first) or a standalone artifact (doc, dossier, transcript, workshop).
3. Load the canon before any drafting:
   - `kernel-voice` for voice rules.
   - `../voice-foundation.md` for the Monotone voice foundation.

## Gate

- The source is identified and its gaps known.
- Canon is loaded. Do not draft without it.

## Output

Return a brief in this exact structure:

```
# Brief

**Source:** <what the input is: notes / transcript / draft / brief>
**Classification:** <content pipeline | standalone artifact>
**Canon:** <voice rules applied — kernel-voice + voice-foundation>
```

