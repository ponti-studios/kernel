---
name: kernel-animate
kind: skill
tags:
  - design
  - motion
  - animation
  - ui
license: MIT
description: >
  A consolidated motion skill covering the full animation lifecycle: building
  from scratch, Emil Kowalski's design-engineering philosophy, finding places
  that don't animate but should, auditing a codebase's motion and writing fix
  plans, strict review of a diff, a ready-made recipe library, and a naming
  glossary. Load the relevant reference below rather than a standalone skill.
when:
  - animating a component, adding motion, or building a transition
  - naming a motion effect from a vague description
  - finding places in a UI that don't animate but should
  - auditing a codebase's motion or producing prioritized fix plans
  - reviewing a diff's animation code against a high craft bar
  - looking up ready-made implementations (press, dropdown, toast, drawer, ...)
outputs:
  - Implementation, findings, plans, or verdicts per the loaded reference's workflow
termination:
  - The applicable reference's definition-of-done checks pass for the task
allowedTools:
  - Read
  - Write
argumentHint: the animation task or motion question
---

# Kernel Animate — consolidated motion skill

One skill routing across six workflows plus a recipe library and glossary.
Pick the reference that matches the task and follow it end-to-end.

## References

| Task | Reference |
| --- | --- |
| Build an animation from scratch (gate → purpose → tool → properties → curve) | `references/build.md` |
| Ready-to-build implementations (press, dropdown, tooltip, modal, drawer, toast, stagger, drag) | `references/recipes.md` |
| Emil Kowalski's design-engineering philosophy — the bar behind everything | `references/craft.md` |
| Name a motion effect from a vague description | `references/vocabulary.md` |
| Find places that don't animate but should | `references/opportunities.md` |
| Audit a codebase's motion and write self-contained fix plans | `references/improve.md` |
| The eight audit categories and exact target values | `references/audit.md` |
| Plan format for improvement plans | `references/plan-template.md` |
| Review a diff's animation code | `references/review.md` |
| Precise review values (curves, durations, springs, performance) | `references/standards.md` |

## Cross-cutting rules

- **Frequency gates everything.** Keyboard-initiated and 100+/day actions never
  animate; delight is reserved for rare/first-time moments.
- **`transform` and `opacity` only**, origin-aware entrances, never `scale(0)`.
- **UI stays under 300ms** with strong custom easing tokens — never built-in
  curves or `ease-in`.
- **Transitions and springs over keyframes** for anything triggered rapidly or
  reversible mid-motion.
- **Reduced motion and hover gating ship with the animation**, not as a
  follow-up.