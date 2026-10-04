---
name: share-import
description: Import a faithful ChatGPT or Gemini share conversation into the vault. Use only for retrieving and preserving the transcript; route later analysis or distillation to its specialist skill.
license: MIT
when:
  - importing a ChatGPT or Gemini share conversation into the vault
  - preserving a shared transcript verbatim
outputs:
  - verbatim imported transcript via the supplied extractor
termination:
  - first and final real turns verified
  - transcript is preserved without summarization or transformation
argumentHint: the share URL to import
---

# Share Import

Use the supplied extractor for the source host, verify the first and final real turns, and preserve the transcript verbatim. Do not summarize, analyze, or transform it during import.

## Canon (inlined)

Migrated from `Documents/agents/canon/` — read the applicable file before acting:

- `references/canon-maintenance-contract.md`
