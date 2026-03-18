# Prevention Over Detection

**A failing pre-commit hook costs seconds. A production incident costs hours. Build accordingly.**

---

## The Detection Trap

We had a testing problem.

Code reviews happened after the code was written. Tests ran after the review was approved. Deployments happened after the tests passed.

The process was sequential: write, review, test, deploy. When something failed — and something always failed — the failure was detected late. The cost of fixing it was high. The code had already been reviewed. The test had already been written. The deployment had already been staged.

This is the detection trap. We were building systems to detect problems, not prevent them.

---

## What Prevention Looks Like

Prevention means catching problems before they propagate.

**Schema validation on write.** When a developer creates a skill, the schema validates immediately. The error is caught before the skill is committed. The cost is a Zod schema and a pre-commit hook: minutes of development, seconds of runtime.

**Deterministic generation.** When a manifest is generated, it must be reproducible. Identical source input must produce identical output. If it doesn't, the generation is nondeterministic — a bug. The test for nondeterminism runs on every generation: minutes of development, seconds of runtime.

**Quality gates.** Before a release, specific invariants must hold. Schema validation passes. Generation is deterministic. Conformance tests pass. The release is blocked if any gate fails: hours of development, seconds of decision.

Each prevention system costs development time. Each prevents production incidents.

---

## The Math

Production incident:
- Detection: hours (customer report, alert, investigation)
- Diagnosis: hours (root cause analysis)
- Fix: hours (code, test, deploy)
- Impact: user trust, revenue, team morale

Prevention system failure:
- Detection: seconds (pre-commit hook failure, CI failure)
- Diagnosis: minutes (read the error message)
- Fix: minutes (edit the file, recommit)
- Impact: none (code didn't ship)

The math favors prevention. Every prevention system is an investment with negative expected cost — if it catches even one problem, it pays for itself.

The reason we don't build prevention systems is that they're boring. Incident investigations are exciting. Pre-commit hooks are mundane. The drama goes to detection; the work goes to prevention.

---

## What We Built

We built quality gates.

Not in the dramatic sense — not an elaborate framework with dashboards and SLA tracking. In the practical sense: specific, automated checks that run before certain actions are allowed.

**Schema validation gate.** Every build validates all schemas. If any spec is malformed, the build fails. The error message lists the exact violations.

**Generation determinism gate.** Every manifest generation is idempotent. Running the generator twice with the same input produces identical output. If it doesn't, the generation fails.

**Conformance gate.** Critical commands are tested across all harness environments. If a command behaves differently on Claude vs. Codex, the difference is documented and the regression is flagged.

Each gate is a function. Each function runs in CI. Each failure blocks the pipeline.

The gates are boring. The failures are rare. The incidents are rarer still.

---

## What We Gave Up

We gave up the freedom to ship broken things.

Before the gates, a developer could write a malformed spec, commit it, and have it merged. The malformed spec would cause problems later — at runtime, in production, when a user encountered the broken behavior.

After the gates, the malformed spec fails CI. The developer fixes it. The merge is clean.

This sounds obvious. It's also a cultural shift. The gates say: the cost of fixing problems is paid by the developer at commit time, not by users at runtime.

Some developers resist this. They want the freedom to merge first, fix later. The gates remove that freedom.

The removal is intentional.

---

## The Principle

**Invest in prevention proportional to impact, not proportional to likelihood.**

A rare bug in a low-traffic feature might seem like it doesn't need prevention. But the impact — when it hits a user — is the same as a common bug in a high-traffic feature.

The question isn't "how likely is this bug?" It's "what happens if it ships?"

If the answer is "a user has a bad experience," prevention is worth building. If the answer is "nothing," don't build the prevention.

Most bugs, when they ship, cause bad user experiences. Build accordingly.

---

## The Pre-commit Hook

The pre-commit hook runs schema validation on every commit. It takes 200ms.

Two hundred milliseconds is imperceptible. It doesn't interrupt flow. It doesn't add friction.

But it catches every malformed spec before it reaches the remote. Every time the hook catches a problem, it saves an hour of debugging, a merge rollback, and a user-facing incident.

The hook is unglamorous. It's four lines of bash. It runs on every commit.

It's also one of the most cost-effective pieces of code in the system.
