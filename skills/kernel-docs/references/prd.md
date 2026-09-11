# PRDs and product briefs

Write requirements artifacts that make product decisions upstream of code: a
PRD decides *what and why*; code decides *how*. A PRD is a `proposal` until it
ships — `status: proposed`, nothing to verify against yet. When it ships it
either graduates to a `reference`/`architecture` doc or is deleted.

## Shape (in order)

```markdown
# <Feature or product name> — PRD

## Problem
Why this exists. One short paragraph: the user situation, the pain, the cost of
not building it. Facts and evidence, not adjectives.

## Goals and non-goals
- **Goals** — 3–7 testable outcomes. `Users can share a link and the recipient
  opens the same state in under 30s.`
- **Non-goals** — what this explicitly does not do, so scope disputes have a
  place to land. Name real temptations, not strawmen.

## Users
Who uses it and what each role needs. One line per role: actor, context, and
what they can do that they couldn't before.

## Feature specifications
One normalized block per feature (see below). Every promised behavior lives
here, with testable acceptance criteria, so implementation and QA share one
definition of done.

## Open questions
Decisions deferred on purpose, with the person/team who owns each and a
deadline when one exists. Anything the author could not resolve from input
belongs here, explicitly — not hidden in a requirement.

## Out of scope
The non-goals plus anything raised during drafting that this PRD declines to
cover, one line each with the reason.
```

## Feature normalization

Split every lumped capability so each feature is independently testable. One
block per feature:

```markdown
### Feature F-01: <title>

**Actor**: <user role / system / external service>
**Data**: <data classes touched>
**Trust Boundaries**: <boundaries crossed, e.g. browser→server, server→storage>

**Updated Requirements**:
- <requirement, kept or rewritten>
- <requirement added to close a gap>

**Acceptance Criteria**:
- <behaviorally testable: an actor, an action, an observable outcome>
- <boundary conditions: failure modes, unauthorized actors, malformed input>

**Securability Notes**: <only if material — route full security requirements to
prd-securability-enhancement>
```

Rules for requirement lists:

- Acceptance criteria are behaviorally observable (a test or audit can confirm
  pass/fail), specific about boundary conditions, tied to a verifiable artifact
  (log line, response code, denied action). Ambiguous "secure", "robust", or
  "fast" language is not acceptable.
- When a feature says "user logs in", "user uploads a file", "admin can X",
  "we have a public API", or "AI/LLM-backed", the security gaps are predictable.
  Route the PRD through `prd-securability-enhancement` when security matters;
  do not hand-wave.
- Never write requirements the product can't verify.

## Worked minimum example

**Input:** "Users can reset their password by entering their email; the system
sends a reset link."

```markdown
### Feature F-01: Password reset via email

**Actor**: Unauthenticated user claiming an account
**Data**: Email (PII), reset token
**Trust Boundaries**: browser → public API → credential store

**Updated Requirements**:
- User can request a reset by entering an account email.
- The response is identical whether or not the email matches an account.

**Acceptance Criteria**:
- Submitting a non-existent email returns the same body, status, and timing as
  a valid one (within tolerance).
- A reset token cannot be redeemed after 15 minutes or after first use; both
  produce a generic failure and a logged `reset_token_invalid` event.
```

## Quality checklist (run before emitting)

- [ ] Problem paragraph is facts, not adjectives
- [ ] Goals are testable outcomes; non-goals name real temptations
- [ ] Every feature has an ID, actor, data, and trust boundaries
- [ ] Every acceptance criterion is behaviorally testable
- [ ] Open questions and out-of-scope are explicit, not implied
- [ ] Security-sensitive features routed through `prd-securability-enhancement`
- [ ] The artifact validates under the repo's `docs/FORMAT.md` contract when it
  lives in `docs/`

## Guardrails

- Never write acceptance criteria you could not turn into a test.
- Never assert user demand or market size without evidence; mark estimates as
  estimates.
- Never let a PRD narrate "how we got here" — the shape above has no history
  section, and it shouldn't gain one.
- A PRD that ships and becomes true graduates to reference/architecture or is
  deleted — the same lifecycle as any `proposal`.