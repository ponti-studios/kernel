# Design System Standards

This document defines the non-negotiable product standards for the project’s UI work. It is **not** a general style guide and it is **not** framework-agnostic. It exists to remove ambiguity, reduce implementation drift, and keep decisions consistent across the supported stack.

## Scope

This skill applies to the project’s supported frontend surfaces only.

- **React web is supported**
- **React Native is supported where the product surface requires it**
- **Next.js is not supported**
- Do not assume rules from one platform automatically transfer to another
- When a rule is platform-specific, say so explicitly

## How to use these standards

Treat these standards as the default answer. Do not present multiple equally valid options unless the project truly supports them.

When a decision is made, include the reason for it:

- what the rule is
- why it exists
- what tradeoff it avoids
- what happens if you ignore it

If a rule is wrong or outdated, update the standard itself. Do not bypass it ad hoc in product code.

## Standards-first posture

This project is standards-heavy by design.

- Prefer explicit rules over vague advice
- Prefer consistent constraints over developer preference
- Prefer hard requirements over “best effort”
- Prefer concrete examples over general principles
- Prefer a single approved pattern over many acceptable ones

If something can be specified, it should be specified.

## Prescriptive writing rules

Every guideline in this skill should be written as an instruction, not a suggestion.

Good:

- Use semantic HTML for interactive elements
- Trap focus in overlays
- Keep interactive targets at least 44px square
- Use tokens for all spacing, color, radius, and elevation values

Bad:

- Consider using semantic HTML
- Try to trap focus
- Smaller touch targets may be okay in some cases
- Tokens are preferred when convenient

## Required reasoning standard

Every rule must be justified well enough that another engineer can defend it in review.

A valid justification includes at least one of:

- accessibility
- consistency
- performance
- maintainability
- cross-platform correctness
- reduced user confusion
- reduced implementation risk

If a rule has no rationale, it should not be in the standard.

## Decision-making hierarchy

When standards conflict, resolve them in this order:

1. Accessibility and user safety
2. Platform correctness
3. Product consistency
4. Performance
5. Visual preference

Do not optimize visual polish at the expense of access, correctness, or maintainability.

## Framework policy

- Do not introduce Next.js patterns into this skill
- Do not describe the system as framework-agnostic
- Do not generalize implementation details beyond the supported stack
- Use platform-specific guidance when it matters
- Use shared language only when the rule truly applies to both web and native

## Review expectation

If you are reviewing UI work, look for:

- whether the correct standard was applied
- whether the implementation followed the prescribed pattern
- whether the reasoning for any deviation was documented
- whether the code remains consistent with the rest of the system

If the work deviates from the standard without a strong reason, treat that as a defect.

## Escalation rule

If a requested design decision cannot be supported by the current standards:

1. identify the missing or conflicting rule
2. explain why the current standard is insufficient
3. propose the new standard
4. update the reference before treating the implementation as correct

## Bottom line

This design system is meant to be precise, enforceable, and opinionated. The goal is not to allow every reasonable approach. The goal is to make the right approach obvious and repeatable.
