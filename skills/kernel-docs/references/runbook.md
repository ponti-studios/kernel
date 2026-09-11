# Runbooks and operational guides

Write executable operational truth: runbooks, checklists, deployment flows,
and environment contracts. These are the docs agents read before touching
environments, routes, databases, auth, or deployments — a wrong claim here
costs more than a wrong claim anywhere else. Lead with the command. Verify
before claiming.

## Shapes

### Runbook (ordered flow)

```markdown
# <Operation> runbook

## Prerequisites
- Exact versions, accounts, or access required, each checkable.
- Environmental precondition with its check command in backticks.

## Steps
1. <command, marked with expected outcome>
   Expected: <the exact output/signal that means it worked>
   If it fails: <the diagnostic to run, the fallback, and when to stop and
   escalate>

## Verification
- <commands + expected results that prove the operation landed>
- Anything that is blocked or not yet verified is named explicitly as such —
  never convert an unrun check into a passing result.
```

Every step pairs a command with its expected outcome and its failure handling.
A step without all three is a wish, not a step.

### Checklist (gate)

```markdown
# <Release|Change|Deploy> checklist

- [ ] <item that is checkable, with the command that proves it> — e.g.
  `pnpm typecheck` passes on `HEAD`.
- [ ] <"classify X" steps that route to the owning contract first>
- [ ] <each environment variable has an owner and a delivery phase>
- [ ] <migrations are understood and their apply path is stated>
- [ ] <runtime verification of the public route/service, not just unit tests>
- [ ] <rollback path stated before execution, not after>
```

A checkbox is only ticked by evidence. If no evidence exists, the item stays
unticked and the block becomes the report.

## Writing rules

- **Lead with the command.** The first line of a guide is the command to run;
  context follows only if it changes the outcome.
- **Cite the source of truth.** Environment contracts reference the schema file
  and the owning service config, not a paraphrase. When the doc says a variable
  exists, the reader can find it in code.
- **Order matters and is stated as order.** "Run CI, then deploy" is a claim
  about sequence; write it as an ordered list, and say what ordering protects
  against.
- **Failure handling is non-optional.** Every destructive or irreversible step
  states its rollback or stop-and-report condition.
- **Active voice, present tense.** Runbooks describe what happens when you run
  them, not what "we" did during an incident.

## Guardrails

- Never claim an operation is verified without running the check. Blocked
  verification is reported as blocked, not as passing.
- Never state a route, environment variable, or service configuration from
  memory — confirm it in the repo's docs/operations files and the owning
  config before writing it.
- Never turn a runbook into an incident retrospective. If an incident happened,
  that is `write-incident-report`'s job; the runbook then carries the
  prevention, not the story.
- Never write a checklist item that has no way to prove it. If it can't be
  checked, it isn't a checklist item — it's a goal, and belongs in a proposal.