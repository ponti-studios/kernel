---
name: write-video
kind: skill
tags:
  - writing
  - video
description: >
  Writes creator-led 3-5 minute video scripts, production plans, and editing
  checklists. Use when the user wants a video script, rewrite, production plan,
  shot list, lightweight outline, or shorts cutdown.
when:
  - user wants a video script or script rewrite
  - user needs a production plan, shot list, or editing checklist
  - user wants a lightweight video outline
  - user asks for shorts cutdowns
  - user invokes /write-video
outputs:
  - Complete video script (450-750 words) with production notes and shot list
  - Production plan or editing checklist
  - Lightweight outline (hook, 3 points, close)
  - Shorts cutdown from an existing script
termination:
  - Script is 450-750 words with tight opening, production notes, and shorts cutdown
  - Production plan covers all editing and delivery checklist items
allowedTools:
  - Read
  - Write
argumentHint: video topic, rough idea, or existing script to produce/adapt
---

# Write Video — Creator Script & Production

Writes creator-led video scripts, production plans, and outlines.

---

## Routing

Load only the reference the task requires:

| Task | Reference |
|---|---|
| Script or script rewrite | `references/creator-contract.md` |
| Production plan or editing checklist | `references/producer-contract.md` |
| Quick outline only | No reference — use Lightweight Outline Mode below |

---

## Lightweight Outline Mode

For quick outline-only requests. No reference needed.

Return:
1. **Title** — working title
2. **Hook** — one sentence that creates tension or curiosity
3. **Point 1** — one line
4. **Point 2** — one line
5. **Point 3** — one line
6. **Close** — one sentence

---

## Default Script Behavior

When writing a full script:

1. Extract the strongest thesis — the one idea worth 3-5 minutes of someone's attention.
2. Write for 3-5 minutes (450-750 spoken words). Prefer tight pacing over exhaustive coverage.
3. Make the opening tight and tension-forward. No throat-clearing, no "in this video I'm going to."
4. Include production notes, shot list, caption beats, alternate hooks, and shorts cutdowns when useful.
