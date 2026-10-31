# Worked example: the Switchyard fleet

The design as built for Charles's agent fleet. Repository: `ponti-studios/switchyard`, design docs under
`docs/learning-loop/` (overview, signals, knowledge model, retro, retrieval, measurement, rollout,
risks). Read those before extending it; they are the contract of record.

## Where knowledge lives

- Global skills repo: `~/Developer/kernel`, skills in `skills/`. Validated by
  `python3 scripts/validate_skills.py`, `muse skills validate`, `python3 -m unittest discover -s tests`;
  every skill catalogued in `skills.sh.json`; a push to `main` deploys.
- One skill per repo (`<project>-conventions`) plus the existing craft tier (`ponti-principles`),
  with `references/map.md` holding the generated repo map.
- The fleet **opens a PR** there and never merges. That is a deliberate deviation from the repo's own
  "commit to main" convention.

## Rule format

```markdown
## Migrations run before tests

Run `goose -dir migrations up` before `go test`; the app does not migrate on boot.

- **Check:** `Makefile:test` — CI fails without it. Use **Review:** when nothing can mechanise it.
- **Why:** PR #548 review, 2026-10-27 — CI failed twice on a clean checkout.
```

Identity is `<skill>#<slug>` from the heading. No `Check:`/`Review:` line means it is a preference, and
it belongs in the conventions document instead.

## The ledger

`~/.switchyard/knowledge/`: `tasks.jsonl` (quality vectors), `rules.jsonl` (`injected`, `loaded`,
`hits`, `misses`, `last_confirmed_at`, `state`), `proposals.jsonl` (candidate + verdict + reason),
`bundles/<repo>-<ticket>.json` (per-task evidence), `status.json` (the last sweep's own health),
`vetoes.txt` (human-owned, one rule id per line).

The ledger directory is gitignored in the fleet repo: it is telemetry with a row per task and would churn
a deployable repo.

`loaded` is measured from the journal's file reads, which is why load compliance is a fact rather than
an assumption.

## The scoreboard as built (S0/S1)

| Piece | Where |
| --- | --- |
| quality vector, pure | `backend/lib/quality-vector.ts` |
| evidence bundle, pure | `backend/lib/evidence-bundle.ts` |
| append-only JSONL ledger | `backend/lib/ledger.ts` |
| sweep, dry-run default | `backend/retro.ts`, job `io.switchyard.fleet.retro` |
| reporting | `node dist-backend/fleetctl.js metrics [--repo R] [--since ISO] [--tasks] [--json]` |
| config | `retro: { enabled, apply, model, budget_usd_per_day, ledger_root }` |

Facts that cost time to discover and belong in the code, not in a future investigation:

- A task's state field is **`stage`**, and the janitor already owned the terminal vocabulary; reuse that
  exported set instead of writing a second definition.
- Old tasks have no `base_sha`. The merge commit's **first parent** is the base that yields a real diff;
  `merge-base(origin/main, head)` returns head once merged and silently zeroes the vector.
- The repo merges PRs with **two-parent merge commits**, which makes the reviewer-edit ratio
  unmeasurable there: record `merge_style` and a null ratio, and treat review comments plus post-merge
  churn as the substitute metric unless the repo switches to squash merges.
- Cost lives in `state.session_costs[session_id].usd` and in the runtime; the task's `cost_usd` is often
  still zero when the session is deleted at close-out. Close-out now reads the cost before deleting.
- Review threads are fetched by GraphQL; `PullRequestReviewThread` has no `diffHunk` (the comments do),
  and an outdated thread reports `line: null` with `originalLine` set — prefer `line ?? originalLine`.
- `gh pr checks` reports current state, so a merged PR reads all-green; the red→green history is not
  recoverable and must not be reported as if it were.

## The learning surface

`/learning` on the dashboard (nav entry on desktop and mobile) is the only place a human reads the
ledger. `GET /api/learning` is built by `backend/lib/learning-view.ts` — pure, testable — from the ledger
files, and cached 30 s because the feed polls every few seconds while the ledger moves hourly.

| Panel | Question it answers |
| --- | --- |
| headline | one computed sentence: evidence in, rules out, whether anything is changing future runs |
| what the next task reads | the corpus per skill (`active`/`enforced`/`quarantined`), with per-rule hits, misses and `loaded` |
| loop health | last sweep, duration, skipped, refused (disclosure), errors, and a stale badge |
| captured | tasks with friction, human comments (bot comments counted separately and excluded), rewritten files, gates failed |
| is the next agent better | the scoreboard, medians, `n`, and an explicit small-sample label |
| proposed and dropped | every candidate, its verdict and the reason, rendered only when proposals exist |

Rules this surface taught:

- **The sweep writes `status.json` so the page never parses a log it does not own.** A missing or stale
  status is rendered as "Not sweeping", not as blank space.
- **A figure with no data behind it is a dash.** A cost that was never recorded and a reviewer-edit ratio
  on a merge-commit repo both render `—`; a repo whose costs are all missing shows `—`, not `$0.000`.
- **The proposals panel stays hidden while empty.** An empty "proposed and dropped" list reads as a bug;
  the corpus empty state carries the explanation instead.
- **Verify it in a browser, not with curl.** The page fetches in `useEffect`, so SSR returns the loading
  shell and `grep` over the HTML finds nothing; assert on `document.body.innerText` after hydration, using
  a local browser (the dashboard is loopback-only).

## Retro levels

| Level | Output | Needs a model |
| --- | --- | --- |
| R0 | evidence bundle + quality vector | no |
| R1 | deterministic counters (reviewer-rewritten files, CI red→green, gates failed) | no |
| R2 | rule candidates from **review** evidence only (merged work, opening comments), ≤5 per task, every citation must exist in the bundle | yes, one call |
| R3 | promotion: batched conventions PR, craft-tier candidates | yes |

Sweep is a separate launchd job, dry-run by default, `--apply` to write, log-per-decision — same shape
as the janitor. It never runs inside dispatch.

## The extraction as built (S2)

| Piece | Where |
| --- | --- |
| prompt, strict-JSON parser, `ModelPort` | `backend/lib/extract.ts` |
| filters, rule rendering, unified diff, precision | `backend/lib/lesson-candidates.ts` |
| sweep integration, port wiring | `backend/retro.ts` (`extractRules`, `runtimeModel`, `skillsPort`) |
| review queue | `node dist-backend/fleetctl.js learning review \| accept <id> \| drop <id> --reason "…"` |
| config | `retro: { extract, max_candidates, skills_root }` |
| artifacts | `knowledge/patches/<repo>-<ticket>.patch`, `proposals.jsonl` |

**The model is the agent runtime, on a throwaway session.** `runtimeModel` opens a session in
`scratchpad/retro`, prompts it, polls `context()` for the final assistant text, reads `costUsd`, and
deletes the session — no second provider credential, and the loop's own spend lands in the same ledger.
`fleet/bin/run.sh` sources `./env`, so anything run by hand must source it too or the call dies with
`OPENCODE_SERVER_PASSWORD is not set`.

**The single most expensive bug is provenance.** Measured on the first four tickets: every comment
classified as human was the agent's own reply (`Fixed in c543fded2. …`), and every real finding came from
the external review bot that the "human only" filter excluded. Three classes now live in
`evidence-bundle.ts`: `evidence_class: review | reply`, `isSelfReport()` (thread position plus
`^(fixed|done|…)` and `fixed in <sha>`), and `isFleetAuthor()` for the fleet's own logins. `reviewEvidence()`
is the only admissible source, and `hasFriction()` uses it — so a task whose only comments are replies is
not friction and costs nothing.

**Ask for the invariant, not the change.** Without an explicit instruction the model writes file-local
restatements of the diff ("In `billing.repository.ts`, run the lock, count and insert in one transaction").
The prompt therefore demands: would this prevent a *different* change in the same area from going wrong?
Also instruct it to keep the half of a sentence that names the invariant rather than compressing, or
otherwise-good candidates are rejected by the 140-character claim limit.

**The parser is the hallucination guard.** Every `evidence_refs` entry must exist in the bundle's id set;
an invented id drops that candidate (not the batch). A reply that is not JSON is reported as
`unparseable` — a prompt defect, distinct from a bad rule. An unknown check kind degrades to the review
requirement instead of passing as a check.

**Version the extraction policy.** Rows record `extraction_version`; the sweep re-processes evidence
captured under an older version instead of skipping it. Without this, fixing the prompt changes nothing
for tasks already in the ledger, and the obvious workaround — deleting rows — is impossible in an
append-only log.

Measured cost: five candidates across three tasks for about $0.003, with a $1/day ceiling enforced from
the ledger's own `cost_usd` sum.

## Retrieved by the agent

One pointer line in the prompt (`Before you start, load the <repo>-conventions skill; its map reference
says where things live.`), the agent loads the skill, and `references/` is read on demand. Roughly
twenty tokens and flat as the corpus grows, versus an injected block that grows with every rule.

## Fleet specifics worth not re-learning

- **Session liveness has exactly one implementation.** `backend/lib/sessions.ts` owns the probe order,
  the trust-a-projected-state rule, and `isLiveState`/`isEndedState`; there is one `.active()` call site
  in the whole backend. Adding a second liveness check in a consumer is how the fleet relapsed into four
  disagreeing answers. When a snapshot fails, the pass is `unknown` — never an empty fleet — because
  `unknown` means "nobody is running" is how a live worker loses its worktree.
- **Measure before claiming a pattern.** `events.sqlite3` answers the question in one query: per-session
  event counts and kinds, longest run of an identical `meta.command`, non-zero `meta.exit`, and last
  work event versus `session.deleted`. Sessions commonly sit idle for hours after work stops, so wall
  time taken from deletion is meaningless.
- **Background jobs are separate launchd agents, dry-run by default.** Janitor, retro and friends run as
  their own job with `GIT_TERMINAL_PROMPT=0`, a plan-first pure module under `backend/lib/`, and a JSONL
  decision log. Never in the dispatcher's 60-second hot path.
- **A new launchd job is not installed until `fleet/bin/run.sh` knows its name.** The wrapper has an
  allowlist (`dispatcher|supervisor|janitor|retro|fleetctl`) and a plist hands it an entry point by name,
  so a job can load cleanly, log nothing and die every fire with `unknown fleet entry point`. Assert the
  contract in a test: every script agent is accepted by `run.sh` and has a plist that passes its name.
- **Reject conformance surfaces nothing consumes.** A spec-shaped API that no caller uses is a
  liability, not proof of conformance; the useful half of such a spec is usually a real observability
  gap that belongs in the existing endpoint.
- **Prose is priced per run; checks are priced once.** Fleet work that converts a convention into a CI
  step, lint rule or gate predicate is worth more than the same convention written more emphatically.

## Rollout and stop conditions

S0 scoreboard → S1 bundles and deterministic signals → S2 extraction behind a 70% human precision gate →
S3 first repo skill with the pointer → S4 checks, promotion, pruning. Abandon if precision stays below
70%, reviewer edits do not move after 30 merged tickets, loop cost exceeds 2% of task spend, or
regressions rise.
