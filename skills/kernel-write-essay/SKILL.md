---
name: kernel-write-essay
license: MIT
kind: skill
tags:
  - writing
  - essay
  - content
  - monotone
description: >
  Transforms raw notes into a sharp, voice-aligned Monotone essay (300–800 words).
  Self-contained prompt — load and run. No CLI additions needed.
when:
  - user provides source material and wants a Monotone essay
  - user says "rewrite this" or "polish this draft"
outputs:
  - Polished essay (300–800 words) — no section headers, no academic transitions
termination:
  - 300-800 words. Over 800: failure.
  - No section headers (not ###, not **bold**, nothing)
  - At least two single-sentence paragraphs
  - No two adjacent paragraphs same length
  - Last line is a strike, not a summary
allowedTools:
  - Read
  - Write
argumentHint: source material (notes, transcript, or rough draft)
---

# Write Essay

Transforms raw notes into polished essays. Voice rules are provided separately by the kernel-voice skill. This skill handles essay structure only.

---

## CRITICAL — Length

**300–800 words. Target 500.**

900 words is a failure. If it's 400 and lands hard, stop. Do not stretch.

---

## CRITICAL — No Section Headers

Zero headers in the body. Not `### Section Title`. Not `**Bold Topic:**`. Nothing that breaks the flow into labeled sections. The structure must be invisible.

---

## CRITICAL — Paragraph Rhythm

- **At least two paragraphs must be a single sentence.** These are landings — the sharpest claims isolated in white space.
- **No two adjacent paragraphs may be the same length.** The eye must never settle. Sequence like: 2, 5, 1, 4, 1, 6, 3, 1 — NOT 3, 3, 3, 4, 4, 3.
- Count sentences before writing. Vary deliberately.

---

## Structure — One Metaphor

Build the entire essay around one concrete metaphor. Not as decoration — as the structural spine. Examples:
- "The Stradivarius problem" — a perfect violin makes no sound without a musician
- "The warehouse" — intelligence isn't storage, it's orchestration
- "Steam engines" — LLMs generate power from nothing, but power ≠ purpose

The metaphor must:
- Be introduced by paragraph 2
- Carry every paragraph — each one relates back to it
- Be concrete (violin, warehouse, engine, not "paradigm")
- Never be explained directly — the reader gets it

---

## Architecture (invisible to reader)

1. **Strike (1 para)** — Drop the contradiction in the first sentence. Introduce the metaphor.
2. **Setup (2–4 paras)** — What everyone gets wrong. How the metaphor reveals the truth.
3. **Deepening (2–3 paras)** — Push the metaphor further.
4. **Obstacle (1 para)** — Why isn't this obvious? The most honest paragraph.
5. **Exit (1–2 sentences)** — Not a conclusion. A strike. End on the metaphor.

---

## Execution

Below is source material. Transform it into a polished essay following every rule above.

Output only the finished essay. Format:

```
# Title

[Essay body — no headers, just prose]
```

No commentary. No "here's your essay." No markdown fences around the output. Just the title and body.
