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
  Voice rules come from kernel-voice. This skill handles essay structure only.
when:
  - user provides source material and wants a Monotone essay
  - user says "rewrite this" or "polish this draft"
  - user invokes /kernel-write-essay
outputs:
  - Polished essay (300–800 words) in authentic voice
termination:
  - Essay is 300-800 words with one metaphor carrying the whole argument
  - No section headers, no "in conclusion," no academic transitions
allowedTools:
  - Read
  - Write
argumentHint: source material (notes, transcript, or rough draft)
---

# Write Essay

Transforms raw notes into polished essays. Voice rules are provided separately by the kernel-voice skill. This skill handles essay structure only.

---

## Length

**300–800 words. Target 500.**

If the essay is 300 words and lands hard, stop. Do not stretch. Short essays respect the reader's time and force you to keep only what matters. A 900-word essay is a failure of editing.

---

## Structure — The Metaphor IS the Argument

The essay is built around a single metaphor or analogy. Not as decoration — as the structural spine.

Examples:
- "The Stradivarius problem" — a perfect violin makes no sound without a musician
- "The warehouse" — we treat intelligence as storage, but it's orchestration
- "Steam engines" — LLMs generate power from nothing, but power ≠ purpose

The metaphor should:
- Be introduced by paragraph 2 at the latest
- Carry the entire argument — every paragraph relates back to it
- Be concrete, not abstract — violins, warehouses, steam engines, not "paradigms"
- Never be over-explained — the reader gets it

### Finding the metaphor

If the source doesn't have one, find one. Ask:
- What is this actually like?
- What physical object or system does this resemble?
- What would a person who knows nothing about this topic recognize?

---

## Invisible Architecture

No section headers. No "First," "Second," "Third." Behind the scenes:

1. **The strike (1 paragraph)** — Drop the contradiction. First sentence makes the reader pause. Introduce the metaphor.
2. **The setup (2–4 paragraphs)** — What does everyone get wrong? How does the metaphor reveal the truth?
3. **The deepening (2–3 paragraphs)** — Push the metaphor further. What does the world look like through this lens?
4. **The obstacle (1 paragraph)** — Why isn't this obvious? The most honest paragraph in the piece.
5. **The exit (1–2 sentences)** — Not a conclusion. A strike. End on the metaphor.

---

## Paragraph Rhythm — MANDATORY

- At least two single-sentence paragraphs. These are landings — the sharpest claims in white space.
- No two adjacent paragraphs the same length. The eye must never settle.
- A sequence like: 2, 5, 1, 4, 1, 6, 3, 1 — not 3, 3, 3, 4, 4, 3.

---

## Output Format

A single markdown document:
- Title in `#` heading
- Essay body — no section headers, no frontmatter
- After `---`, one optional line: the single best sentence (for social use)
