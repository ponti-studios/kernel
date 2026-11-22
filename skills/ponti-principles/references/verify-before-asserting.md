# Verify before asserting

A false claim that a tool, parameter, field, record or capability is missing, broken, unsupported or fixed usually traces to one of four causes: a wrong parameter name, a default filter, a write-only field, or a premise inherited from an earlier run. Verify against the live surface before reporting it.

## Workflow

1. State the claim in one sentence — "X does not exist", "tool Y ignores its filter", "this fix is live" — and do not report it yet.
2. Read the live contract for the surface: the tool's current input schema, the CLI's `--help`, the API's current docs. Confirm every parameter name you used exists in it exactly. A probe that passed an undeclared parameter proves nothing — many validators silently strip unknown keys, so a wrong key looks exactly like a server-side bug.
3. Check the defaults and filters that shape a default view before concluding absence: pagination, status or closed/archived filters, date windows, account or calendar selection, opt-in flags. Re-run with the filter explicitly widened and compare.
4. Run one control probe that should succeed if the surface works: a known-good record, a known parameter value, a minimal valid payload. If the control also fails, the problem is the probe, the auth, or the surface — not the specific item.
5. Distinguish write schema from read schema: a field can be accepted on write and absent on read-back, or vice versa. Check both before claiming a field exists or is missing.
6. Read back after any mutation or fix claim: re-fetch the changed record, re-run the failing case, reconcile counts against an independent total. "This fix is live" follows a live test passing, not a merge or a code read.
7. Re-derive any premise inherited from earlier work — a count, an archived set, a previous agent's conclusion — from a fresh read before building on it.

## Output contract

A report that something is missing, broken, unsupported or fixed names: the live contract checked, the defaults or filters widened, the control probe and its result, and the read-back or reconciliation. If one of these could not run, the claim is reported as unverified instead of asserted.

## Rules

- Never report a tool or API bug from a probe whose parameter names were not first confirmed against the live schema.
- Never claim a record does not exist from a default view without checking the filters that hide closed, archived or out-of-window entries.
- Never claim a capability is unsupported from documentation alone when a lower-level surface can be probed directly.
- Never present an earlier run's premise as current fact without a fresh read in this run.
- When verification contradicts the first claim, correct it in one plain sentence, fix the work, and move on.
