---
name: agent-knowledge-loops
description: "Design how agents accumulate knowledge across tasks."
license: MIT
metadata:
  author: ponti-studios
  version: "1.1.0"
  category: AI
  tags:
    - agents
    - knowledge
    - learning-loop
    - fleet
    - conventions
  hermes:
    tags:
      - agents
      - knowledge
      - learning-loop
    related_skills:
      - switchyard-fleet-ops
      - ponti-principles
---

# Agent knowledge loops

## When to Use

Load this when the task is "make each new agent better than the last one", "write down what the agents
learn", "stop them rediscovering the same things", "accumulate conventions across repos", or when you
are designing any feedback path from task outcome into what the next run reads. Not for one-off prompt
tuning, and not for editing a single conventions file by hand.

## Two artifacts, never one

The most common design error is conflating them. When the user says "ledger", ask whether they mean the
bookkeeping or the knowledge; they are different artifacts and usually live in different places.

| | **Knowledge** | **Ledger** |
| --- | --- | --- |
| What | rules, conventions, repo maps | quality vectors, hit/miss counters, evidence refs, proposal log |
| Home | wherever the user's skills/docs live (portable, reviewed, versioned) | the tool's own state dir |
| Written by | the loop **proposes**, a human merges | the loop, automatically |
| Read by | every agent, at work | tooling; never an agent mid-task |
| Churn | a few lines a week | a row per task |
| If lost | the accumulated knowledge | history only |

Knowledge belongs where other agents can install it — a skills repo, a docs tree — because the value is
portability, not storage. The ledger is telemetry with a long retention window: it moves every task and
must never churn a versioned repo that deploys.

## Non-negotiables

1. **Checks over prose.** Every rule should name the check that catches a violation, or a named human
   review step. Prose costs tokens on every run and depends on obedience; a lint rule or CI step costs
   once. The loop's job is converting one into the other, and enforced/active is its health metric.
   The corollary runs the other way too: **a rule that restates a check the fix already shipped is a
   duplicate of that check.** If deleting the sentence loses nothing because something already fails when
   the invariant breaks, the artefact is the lesson — it runs on every change for free and cannot be
   skipped — and prose about it is a weaker copy. Ask "would anything catch this if the sentence were
   deleted?" before admitting a candidate. Mechanical form: if the candidate's check names a file the
   change itself touched, that check is the test the fix brought with it, so reject it as already
   enforced rather than filing it.
2. **Authorship is not provenance.** The rule is "only *review* teaches", not "only humans teach". An
   agent acting for a person posts under that person's login, so a comment from the owner's account is
   as likely to be the agent's own `Fixed in <sha>` summary as a real finding. Classify by structure and
   phrasing, not by who appears to have written it:
   - `review` — opens a thread and challenges the work. Admissible.
   - `reply` — answers one, or matches `^(fixed|done|addressed|…)` / `fixed in <sha>`. Never evidence; it
     describes the task instead of teaching a rule.
   - the loop's own agents and bots — excluded outright, whatever account they post from.
   A third-party review bot is a reviewer, not evidence. Read it: it is an adversarial reading of the
   diff and finds real defects. But a defect report is answered by a test, so a rule minted from one
   restates an artefact the change already ships, and the corpus becomes a transcription of that bot's
   review — advice the next task already gets on its own pull request. Admit a bot finding only when it
   survives the delete test in non-negotiable 1, which in a fleet that requires fixes to ship with tests
   is almost never. What stays excluded outright is the agent's own self-praise, whatever account it
   posts from.
   **Use that same classifier for the counters, not only for evidence selection.** A login-based
   `human_comments` count scores the agent's own replies as human review, and every downstream number
   inherits it: friction, the scoreboard, and any sentence the surface renders about human corrections.
   Classify once, then count with the classification.
2a. **Only merged work teaches.** A closed or abandoned change's review describes work that was thrown
   away; learning from it imports an opinion about a rejected approach.
3. **Precision beats recall.** A wrong rule is paid on every future task and is invisible. Require
   resolvable evidence per rule, date it inline, and gate the pipeline on a human accepting ~70% of a
   ten-candidate sample before anything is installed.
4. **Tier by blast radius.** Repo-specific rules stay in that repo's material. Anything global (a craft
   skill loaded everywhere) needs recurrence in two or more repos and a human decision.
5. **Decay is a proposal, never an edit.** Retire on repeated misses, on long silence, or on a one-line
   human veto file. The loop may propose; only a human removes.
6. **Never justify a feature with a failure you have not measured.** Query the event data before claiming
   a pattern exists — "the agents loop on a failing command" is testable and is usually false.

## Procedure

1. **Inventory existing signals** before instrumenting anything: event/journal logs, review threads, CI
   history, the reviewer's diff between agent head and merge commit, cost records. See
   `references/signals-and-measurement.md` for what each proves and where it lies.
2. **Build the scoreboard first.** One record per terminal task: cost, wall time, review comments,
   reviewer-edit lines, rework commits, gates failed, regressions. No knowledge is written yet; this is
   the only way to know later whether any of it worked. The numbers are only worth having if these hold:
   - **Base the diff on the merge's first parent**, not on `merge-base(default_branch, head)`: once a
     branch has landed, merge-base returns head itself and every agent diff collapses to zero.
   - **Check the merge style before trusting a reviewer-edit diff.** `diff(head..merge)` is the human's
     correction only for single-parent (squash, fast-forward) merges; on a two-parent merge commit it
     also carries everything else that landed on the default branch in the meantime. Record the style
     and null the ratio rather than publishing a contaminated number.
   - **Capture a metric before the artifact holding it is destroyed.** If close-out deletes the agent's
     session, read its cost first, or the scoreboard fills with zeros that read as free work. Record
     where each number came from (`state` / ledger / runtime / missing) so a gap stays visible.
   - **A post-merge snapshot is current state, not history.** PR check state reads green once merged, so
     "went red then green" is not recoverable from the PR API; name the field for what it actually is.
   - **Branches are reaped, PR refs are not.** When the head branch has been deleted, fetch
     `refs/pull/<n>/head` to recover the commits and diff them.
   - **Reuse the system's own word for "finished"** — its terminal-stage set and its state field, which
     is often not `status`. A second definition drifts and silently drops whole categories of task.
3. **Dry-run the extraction.** Deterministic evidence bundles first (no model), then one cheap model call
   per task *that had friction*, emitting structured candidates with evidence refs. Reject any candidate
   citing something absent from the bundle, and log every drop with its reason.
4. **Get a precision read from the human** on ten candidates. Gate on two things, in this order: any
   candidate citing evidence that does not support it, restating the ticket, or naming no check and no
   review step is a **hard fail** — fix the extraction before scoring anything. Then apply the ratio:
   below ~70% true, narrow the sources rather than loosening the filters. Print `n` beside the number and
   refuse to call it a verdict below ten judged candidates; a ratio over six says almost nothing, and a
   ratio can never catch the single fabricated citation that would poison the corpus.
5. **Install knowledge where agents load it**, with a deterministic pointer (one line in the task prompt
   naming the file or skill) so loading does not depend on description matching. Record whether it was
   opened — file-read events make that measurable.
6. **Convert to checks, then prune.** Each landed check removes its prose. Report corpus counts weekly; a
   corpus that stops changing is either broken or finished.

## Pitfalls

- **Prompt-only systems rot.** Every rule in the prompt is charged on every task forever; past a few
  hundred tokens the agent follows none of it. Invert: pointer in the prompt, knowledge in a file.
- **Optimising the metric.** Fewer review comments is easy if the agent does less, asks fewer questions,
  or copies the nearest file. Pair any "fewer corrections" metric with a revert/regression rate that can
  veto the improvement.
- **A rule without a check is a preference.** Send it to the conventions doc for a human to curate.
- **Ask for the invariant, not the change.** Handed a review comment, a model paraphrases it: "in
  `<file>`, run the lock, count and insert in one transaction" describes the diff it just read and is
  true exactly once. Put the test in the prompt — *would this prevent a different change in the same
  area from going wrong?* — and keep only what survives it.
- **Say what to do at the claim-length cap.** A length limit with no instruction silently deletes the
  candidates that were specific enough to need a clause. Tell the model to keep the half that names the
  invariant and drop the rest, never to compress two ideas with commas, and surface parser rejections in
  the review output so verbosity reads as the defect it is.
- **Version the extraction policy, and put the version in the skip key.** An idempotent sweep skips
  evidence it has already captured, so a fixed prompt never touches the old evidence and the queue keeps
  showing output from a policy you already replaced. Version the row; skip only when the stored version
  matches. A bump also re-processes the evidence — but it does not retract proposals the old policy
  already filed, so the queue still holds rows the new standard would never admit. Drop them explicitly,
  with a recorded reason per row (which also separates "bad rule" from "bad extraction" in the counts),
  or the surface keeps presenting a standard you have already abandoned as work waiting on a human.
- **Contradictions are silent.** Two rules that cannot both hold mean the codebase moved. Detect on
  shared subject plus opposite polarity, quarantine both, never pick one silently.
- **Count per candidate, not per record.** A proposal that is re-judged, superseded, or re-extracted
  leaves more than one row in an append-only log; summing rows reports a queue several times the real one
  and makes a five-item review look like eighteen. Latest verdict per id, keyed by a stable rule id.
- **Dedupe within the batch, and measure containment, not just overlap.** The most common duplicate is
  the same rule phrased twice in one call, which no comparison against installed rules will catch. Use
  `shared / min(|a|,|b|)` as well as Jaccard: an installed rule carrying one extra clause scores ~0.6
  against its own duplicate and slips through a pure Jaccard threshold.
- **Across sweeps, wording is the wrong key — dedupe on the evidence identity.** A re-sweep re-extracts
  the same task and paraphrases what it found, and a paraphrase slugs to a new id, so an id check never
  fires either. Measure before picking a threshold: same-lesson restatements score as low as 0.15 against
  each other while genuinely different lessons from the same PR reach 0.62. The distributions overlap, so
  any similarity threshold either misses most duplicates or merges distinct rules. Key on the artefact
  cited — same task plus an intersecting evidence ref is the same question, whatever the words — and
  keep similarity only for cross-task restatements.
- **A counter where an artefact belongs is not a check.** Told to name the check that would catch a
  violation, a model fills the required field with `ci:1` or `test:2`; the string is non-empty, so a
  "has a check" filter passes it and the rule survives on a citation that resolves to nothing. Validate
  the ref shape (a path or a named test) at parse time, or the check requirement is decorative.
- **Check where the corpus comes from, not only how much of it there is.** If every accepted rule cites
  the same third-party reviewer bot, the loop is transcribing that bot's defect reports — and each of
  those defects was fixed by a test, so the corpus is a prose copy of checks that already exist. Report
  it as a **defect in the corpus source**, not as a young loop: the fix is to require human evidence, after
  which the honest output of five bot-reviewed tickets is *nothing worth proposing*. Two moves keep
  this honest: withhold the bot's ids from the extraction prompt while keeping its bodies, so the model
  has the context and cannot cite it — an id it was never given then fails as invented evidence at the
  parser, and the filter is structural instead of an instruction it may ignore; and expect the queue to
  empty, not merely shrink, once the filter lands, because a bot-authored corpus is usually a handful of
  defects restated several times.
- **A queue with no verb is not a review surface.** Computing "26 candidates waiting for a verdict" and
  printing the CLI command to judge them leaves the work undone: nothing is accepted for days while the
  output piles up. The surface that shows pending candidates must carry the decision — accept, and drop
  with a required reason chosen from a short list — and its endpoint must write through the same function
  the CLI uses, so the two cannot drift. Refusing a drop without a reason is what keeps the precision
  count meaningful: an unexplained drop cannot separate a bad rule from a bad extraction.
- **A verdict that writes only a verdict row is the loop's last-mile failure.** Acceptance can succeed
  and change nothing: if no code appends the rule, or nothing renders it where an agent reads, the queue
  fills with decisions that never reach a prompt and every surface still looks healthy. Trace the whole
  chain before calling the loop done — accept → a rule row → a line in the skill or conventions file the
  agent loads → a pointer in the task prompt → a recorded read. Missing link anywhere means it is
  decoration, and the empty-corpus sentence must say so instead of implying the system is working.
- **Re-deriving what a docs map or an existing skill already says** wastes the corpus. Layout facts belong
  in a generated map; rules are for what a reviewer had to say. The same applies when asked to state what
  a loop should learn: search the skills corpus for the rule first, because a list of "new" lessons is
  usually half of what the governing skill already carries, and re-adding it spends the user's review
  twice.
- **A metric you cannot define must be null, not plausible.** Aggregate statistics hide this: a
  heavy-tailed ratio computed on a contaminated diff still looks like a number. Emit an explicit
  "unmeasurable" marker and say why, so the human can change the repo's merge policy instead of trusting
  a figure that means nothing.
- **An empty corpus must not look like success.** Zero rules, zero proposals and a healthy loop render
  the same way unless the surface says otherwise, so compute the sentence a human reads: with evidence
  captured but nothing installed it has to say *nothing is changing future runs yet*. A green tick over
  an empty table, or a blank panel, tells the operator the loop is working when it is merely idle — and
  the same rule applies to a figure with no data behind it, which is a dash rather than a zero.
- **Do not let the loop's own health be invisible.** Write a small status artefact at the end of every
  sweep (last run, duration, captured, refused, errors), dry runs included, and surface it next to the
  corpus. A loop that stops running is broken, not quiet, and nothing else in the system notices.

## References

- `references/signals-and-measurement.md` — signal ladder, extraction cost and failure modes per signal,
  the quality-vector field list, and how to compare periods honestly.
- `references/switchyard-worked-example.md` — the design as built in the Switchyard fleet: skills layout,
  retro levels, pointer line, ledger schema, rollout phases.
