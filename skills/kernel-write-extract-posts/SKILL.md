---
name: kernel-write-extract-posts
license: MIT
kind: skill
tags:
  - pipeline
  - social
  - content
  - monotone
description: >
  Extracts social media content from a polished essay: one long-form X post
  (500–1000 words) plus 1–2 TikTok clip ideas. Self-contained prompt — load
  and run. Outputs markdown consumable by the queue step.
when:
  - user wants to extract social posts from an essay
  - running the Monotone pipeline extract step
outputs:
  - Markdown file with 1 long-form X post + 1-2 TikTok clip ideas
  - Structured for consumption by queue command
termination:
  - X post is self-contained (standalone argument, no "read the essay" required)
  - X post is 500–1000 words
allowedTools:
  - Read
  - Write
argumentHint: path to polished essay file
---

# Extract Posts

Extract social media content from a polished essay. Voice rules are provided separately by the kernel-voice skill.

---

## Part 1: X Post

Write a single long-form X post capturing the essay's core argument:
- 500–1000 words
- Self-contained — someone who hasn't read the essay should get the full argument
- In the author's voice: calm, precise, contrarian-but-warm
- No thread numbers, no "1/" markers — a flowing long post
- A strong opening line that stops the scroll
- Ends with resonance, not a call to action

## Part 2: TikTok Clips

1–2 clip ideas. Each needs:
- A hook line (first 2–3 seconds)
- Approximate timestamp from a hypothetical video version
- Visual idea (what's on screen)
- A one-line caption

---

## Execution

Below is a polished essay. Extract social content from it following every rule above.

Output in this exact markdown format:

```
# Extracted Posts

## X Post

[500-1000 word long-form post]

---

## TikTok Clips

### Clip 1

- **Hook:** [first 2-3 seconds]
- **Timestamp:** [approx]
- **Visual:** [what's on screen]
- **Caption:** "[one-line]"

### Clip 2

- **Hook:** [first 2-3 seconds]
- **Timestamp:** [approx]
- **Visual:** [what's on screen]
- **Caption:** "[one-line]"
```

No JSON. No commentary. No "here are your posts." Just the markdown output.
