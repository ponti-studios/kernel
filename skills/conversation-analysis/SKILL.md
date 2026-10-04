---
name: conversation-analysis
description: Analyze an AI or human conversation for themes, arguments, patterns, and retrievable facts. Use when the requested outcome is reflective analysis; not for atomized notes or an operational meeting brief.
license: MIT
when:
  - analyzing an AI or human conversation for themes and arguments
  - producing reflective analysis rather than atomized notes or a meeting brief
outputs:
  - thematic analysis with retrievable facts per references/full-prompt.md
termination:
  - analysis preserves the source intellectual position
  - themes, arguments, and patterns are evidenced from the transcript
argumentHint: the conversation transcript or export to analyze
---

# Conversation Analysis

Read `references/full-prompt.md`. Produce the requested narrative and retrieval artifacts without changing the source's intellectual position.

## Canon (inlined)

Migrated from `Documents/agents/canon/` — read the applicable file before acting:

- `references/canon-collaboration-standard.md`
