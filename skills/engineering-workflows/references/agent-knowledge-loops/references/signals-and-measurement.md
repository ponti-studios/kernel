# Signals and measurement

What an agent fleet already knows about a task, what each signal proves, and how the resulting metric
lies. Use when designing the evidence side of a knowledge loop.

## The ladder

Rank signals by how hard they are to spoof; a lesson may only cite from the top half.

| Rung | Signal | Proves | Spoofable |
| --- | --- | --- | --- |
| 5 | post-merge regression | the work was wrong and reached the default branch | no |
| 4 | the comment that **opens** a review thread, from anyone but the loop itself | a reviewer read the diff and challenged it | no |
| 3 | CI red → green | a machine check failed and something fixed it | no |
| 2 | gate outcome, retry count | a fleet rule rejected the work | partly |
| 1 | nudge or escalation text | the fleet believed the work was stuck | yes |
| 0 | a reply in a review thread (`Fixed in <sha>`, "done in …"), the agent's own summary, anything from the loop's own logins | the author believes it is finished | entirely |

Rungs 0–2 are counters (how often does a rule fire?), never evidence. Rung 4 is the sharpest: a
reviewer who rewrites a hunk is unambiguous, where a comment can be argued with.

**Authorship does not move a signal up the ladder.** Where agents act for a person they post under that
person's login, so a rung-4-looking comment from the owner's account is usually rung 0 wearing a rung-4
name. Rank by structure — thread position, and whether the text is answering something — and treat a
third-party review bot as a reviewer, because an adversarial reading of the diff is exactly what rung 4
means.

## Per-signal notes

| Signal | Extraction | Lies when |
| --- | --- | --- |
| event journal (tool calls, exits, durations, paths) | one query per task | you read it as quality — it records what happened, never whether it was right |
| review threads | already fetched for gating; **check the query selects `path`, `line`, `originalLine`, `diffHunk`, `url`** — many do not, and without a path there is no scope key | a thread was resolved by the author without a change |
| reviewer diff (`git diff <agent head>..<merge commit>`) | two git calls, needs the claim-time base sha; valid for **single-parent merges only** | the merge is a two-parent merge commit, whose diff also carries everything else that landed meanwhile — record the style and null the ratio instead |
| CI red→green pairs | one API call per task | flaky checks; pair only when a check went red once and green after one commit |
| nudges, escalations | free, already in state | always, as evidence — counters only |
| cost and wall time | session record | wall time taken from session deletion: sessions can sit idle for hours after work stopped, so use the last **work** event |
| token counts | usually absent from journals; usage events often carry no payload | assuming they are recoverable |
| regressions | needs a convention (revert trailer, label) | never wired, in which case the guard-rail metric does not exist |

## Quality vector (one row per terminal task)

`task`, `repo`, `ticket`, `kind`, `base_sha`, `agent_head`, `merge_commit`, `cost_usd`,
`wall_seconds`, `agent_lines`, `reviewer_lines`, `review_comments` (human vs bot), `review_rounds`,
`fix_commits`, `force_pushes`, `ci_runs`, `ci_red_runs`, `nudges`, `escalations`, `gates_failed`,
`retries`, `reverted`, `knowledge_loaded`.

Primary metrics: **reviewer edit ratio** (`reviewer_lines / agent_lines`), rework per pull request,
cost per merged ticket, regression rate. Reviewer edits are preferred over comment counts because a
comment can be answered with an argument and a rewritten line cannot.

## Making the comparison honest

- Segment by ticket kind and size; a month of small chore tickets improves every average for free.
- Report medians, not means; one large rewrite dominates a mean of five.
- Print n with every number; below ten merged tickets, say "no evidence yet".
- Cost includes the loop: extraction calls plus whatever the knowledge costs to load.
- Regressions veto: a fall in corrections accompanied by a rise in reverts is a regression in disguise.

Same ticket twice is unaffordable, so compare interrupted time series per repo, corroborate with a
staggered rollout, and use replay only to tune extraction — never as a quality signal, because a
replay has no reviewer.

## Ways the metric lies

| Failure | Looks like | Defence |
| --- | --- | --- |
| conservative drift | fewer corrections because less work is attempted | track tests and acceptance coverage alongside |
| question suppression | fewer comments because the agent stops asking | count questions in the change description |
| pattern copying | copying the nearest file, mistakes included | regression rate |
| change splitting | many tiny changes to keep per-change numbers low | report per ticket as well |
| harder work | corrections rise because the agent is trusted with more | compare against the baseline mix |
| measurement drift | the scoreboard disagrees with the source system | reconcile monthly; a wrong scoreboard is worse than none |
