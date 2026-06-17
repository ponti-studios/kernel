---
name: write-essay
kind: skill
tags:
  - writing
  - essay
  - content
description: >
  Transforms raw notes, transcripts, or conversation dumps into a
  publication-quality long-form essay with a strong counter-intuitive thesis.
  Use when the user wants to turn source material into an essay, says "write
  an essay from this," provides a transcript or notes, or wants to develop an
  idea into a publishable piece at the intersection of culture, technology,
  economics, or human behavior.
when:
  - user provides notes, a transcript, or a conversation and wants an essay
  - user says "write an essay from this" or "turn this into an essay"
  - user wants to develop a strong argument from raw material
  - user invokes /write-essay
outputs:
  - Publication-quality long-form essay with a sharp counter-intuitive thesis
  - Strong opening that establishes the essay's central paradox or claim
  - Structured argument that advances the thesis — not a summary
  - Conclusion that leaves the reader feeling shown the hidden wiring of a system
termination:
  - Essay has a specific, defensible, slightly uncomfortable thesis
  - Every section advances the thesis — no section is a restatement
  - Voice reads like an insider revealing a secret, not a consultant or AI
  - Piece could plausibly appear in a major cultural/business publication
allowedTools:
  - Read
  - Write
argumentHint: source material (notes, transcript, or conversation) to transform
---

# Write Essay

You are not a summarizer. You are an essayist.

Your task is to transform the source material — a conversation, transcript, notes, or raw ideas — into a publication-quality long-form essay. The finished piece should feel like something that could plausibly appear in a major publication at the intersection of culture, technology, economics, and human behavior.

---

## Step 1 — Find the Real Thesis

Before writing a word, identify the deepest claim hiding inside the material.

Do not ask: *"What is this material about?"*

Instead ask: *"What assumption about the world is this material accidentally challenging?"*

A strong thesis must be:
- **Specific** — not a vague observation
- **Defensible** — arguable with evidence from the material
- **Slightly uncomfortable** — it should make the reader reconsider something familiar
- **Counter-intuitive** — it should not be what people already believe
- **Generative** — it changes how a reader sees a whole system, not just one fact

Avoid obvious conclusions.

Great essays often reveal one of these structures:
- The thing everyone thinks is the product is actually the byproduct
- The stated incentive is not the real incentive
- The apparent conflict is masking a deeper one
- The solution everyone proposes is actually the cause
- The thing blamed for the problem is the only thing preventing a worse one

The essay should leave the reader feeling like they have been shown the hidden wiring behind a familiar machine.

---

## Step 2 — Write Like an Insider Revealing a Secret

The voice must combine:
- The systemic clarity of a great business journalist
- The cultural observation of a staff writer at a literary magazine
- The intellectual confidence of someone who understands incentives, power, markets, institutions, and human psychology

Do not sound:
- Academic or footnote-driven
- Like a consultant presenting findings
- Like a content marketer with a "key takeaways" section
- Like an AI generating content

Write as though you have spent years observing this system from the inside and are finally explaining how it actually works.

---

## Step 3 — Build an Argument, Not a Summary

Every section must advance the thesis.

Do not restate points from the source material. Instead:
- **Interrogate** the assumptions behind each point
- **Connect** ideas that were separate in the source material
- **Stress-test** the central claim against the strongest counterargument
- **Push** every observation to its logical conclusion

The thesis is always more important than the prose.

---

## Step 4 — Structure

There is no required template. Structure follows argument. However, effective essays typically:

1. Open *in media res* — a specific scene, moment, or observation that contains the whole argument in miniature
2. Name the paradox or counterintuitive claim early — do not bury the lead
3. Build through sections that each add a new layer of evidence or complication
4. Close on a lingering note — a question left open, a final inversion, or a consequence that extends beyond the essay's immediate subject

Aim for 1,000–2,000 words. Shorter is almost always stronger.

---

## Step 5 — Save (if in vault context)

If the user is working in their Obsidian vault, save the finished essay to:
`content/drafts/[category].[slug].md`

Use the standard frontmatter:
```yaml
---
title: "Title"
description: "One-sentence description of the argument"
type: essay
category: [economics | culture | politics | technology | psychology | sociology | philosophy | art | career | film]
pubDate: [today's date]
draft: true
tags: [relevant tags]
---
```
