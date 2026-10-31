# Kernel Animate — consolidated motion skill

One skill routing across ten references: build, review, audit-and-plan,
discovery, and language. Invoke with the animation task or motion question.
Pick the reference that matches the task and follow it end-to-end.

## Definition of done

- The applicable reference's definition-of-done checks pass for the task

## References

| Task | Reference |
| --- | --- |
| Build an animation from scratch (gate → purpose → tool → properties → curve) | [build.md](references/build.md) |
| Ready-to-build implementations (press, dropdown, tooltip, modal, drawer, toast, stagger, drag) | [recipes.md](references/recipes.md) |
| Emil Kowalski's design-engineering philosophy — the bar behind everything | [craft.md](references/craft.md) |
| Name a motion effect from a vague description | [vocabulary.md](references/vocabulary.md) |
| Find places that don't animate but should | [opportunities.md](references/opportunities.md) |
| Audit a codebase's motion and write self-contained fix plans | [improve.md](references/improve.md) |
| The eight audit categories and exact target values | [audit.md](references/audit.md) |
| Plan format for improvement plans | [plan-template.md](references/plan-template.md) |
| Review a diff's animation code | [review.md](references/review.md) |
| Precise review values (curves, durations, springs, performance) | [standards.md](references/standards.md) |

## Cross-cutting rules

- **Boundary with [kernel-design](../kernel-design/WORKFLOW.md).** This skill implements and audits animation
  code; [kernel-design](../kernel-design/WORKFLOW.md) decides motion values, tokens, brand, and
  reduced-motion behavior. Motion values resolve to the project's shared token
  source — extend it, don't fork a parallel system.

- **Frequency gates everything.** Keyboard-initiated and 100+/day actions never
  animate; delight is reserved for rare/first-time moments.
- **`transform` and `opacity` only**, origin-aware entrances, never `scale(0)`.
- **UI stays under 300ms** with strong custom easing tokens — never built-in
  curves or `ease-in`.
- **Transitions and springs over keyframes** for anything triggered rapidly or
  reversible mid-motion.
- **Reduced motion and hover gating ship with the animation**, not as a
  follow-up.
