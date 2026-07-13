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
  Voice rules come from kernel-voice. This skill handles essay structure, metaphor
  construction, and paragraph rhythm.
when:
  - user provides source material and wants a Monotone essay
  - user says "rewrite this" or "polish this draft"
  - user invokes /kernel-write-essay
outputs:
  - Polished essay (300–800 words) — no section headers, no academic transitions
  - Metaphor-driven structure with deliberately uneven paragraph pacing
termination:
  - 300-800 words. Over 800: failure of editing.
  - No section headers of any kind — not ###, not **bold headers**, nothing
  - At least two single-sentence paragraphs
  - No two adjacent paragraphs the same length
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

Zero headers in the body. Not `### Section Title`. Not `**Bold Topic:**`. Nothing that breaks the flow into labeled sections. The structure must be invisible. A single flowing piece from strike to strike.

---

## CRITICAL — Paragraph Rhythm

- **At least two paragraphs must be a single sentence.** These are landings — the sharpest claims isolated in white space. Place one early (paragraph 3 or 4) and one near the end.
- **No two adjacent paragraphs may be the same length.** The eye must never settle. Sequence like: 2 sentences, 5, 1, 4, 1, 6, 3, 1 — NOT 3, 3, 3, 4, 4, 3.
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

## Invisible Architecture (no headers visible to reader)

1. **Strike (1 paragraph)** — Drop the contradiction in the first sentence. Introduce the metaphor.
2. **Setup (2–4 paragraphs)** — What everyone gets wrong. How the metaphor reveals the truth.
3. **Deepening (2–3 paragraphs)** — Push the metaphor further. What happens when you follow this logic?
4. **Obstacle (1 paragraph)** — Why isn't this obvious? The most honest paragraph.
5. **Exit (1–2 sentences)** — Not a conclusion. A strike. End on the metaphor.

---

## Output Format

```
# Title

[Essay body — no headers, no frontmatter. One flowing piece.]

---
[Optional: single best sentence for social]
```
