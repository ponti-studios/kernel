---
name: kernel-voice
license: MIT
kind: reference
tags:
  - voice
  - brand
  - writing
  - video
description: >
  Single source of truth for the Ponti Studios voice. All writing, video,
  and creative skills reference this file. Never invoked directly — loaded
  as context by pipeline commands.
when: []
outputs: []
termination: []
disableModelInvocation: true
allowedTools: []
---

# Kernel Voice — Ponti Studios Voice DNA

This skill is not invoked directly. It is the single source of truth for voice rules across all creative output.

Every writing, video, and content skill references this file. When the voice changes, it changes here — once.

---

## Routing

| Context | Reference |
|---|---|
| Writing an essay | `references/voice-foundation.md` + `references/style-contract.md` |
| Writing a video script | `references/voice-foundation.md` + video-specific rules in the write-video skill |
| Social posts or other short-form | `references/voice-foundation.md` + `references/style-contract.md` |

---

## Quick Reference

### The Voice in One Sentence

**Essential, honest, still. Say the hard thing plainly and get out.**

### The Four Rules

1. **Open on a strike.** No context. No setup. The first words are already in the argument.
2. **Say the hard thing plainly.** Don't perform intelligence. Don't gesture at depth.
3. **No filler. No hedges.** Cut "arguably," "perhaps," "interestingly," "some might say."
4. **In, done, gone.** No wind-down. The last line lands and stops.

### Never

- Exclamation points or emoji
- Italics or bold for emphasis
- Academic transitions ("thus," "therefore," "however," "furthermore")
- "In recent years..." / "Today I want to..." / "Let's dive into..."
- Explaining the metaphor
- Ending with a question or call to action
- Uniform paragraph or section lengths
- Hedge words pretending to be precision
