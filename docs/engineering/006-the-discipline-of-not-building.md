# The Discipline of Not Building

**The real skill is knowing what not to create.**

---

## The Things We Built That We Didn't Need

**The agent orchestrator.** A system that would look at a user's request, determine which specialist agent was appropriate, and route the request to that agent. It would have been clever. It would have been another abstraction to maintain.

We deleted it. Users route themselves. They know what they want. They type `/ghostwire:code:review`, and the code gets reviewed. The orchestrator would have added latency and complexity for a routing decision a user could make faster.

---

**The dual integration branches.** We had `dev` for integration and `main` for releases. The idea was that `dev` caught problems before they reached `main`. The reality was that `dev` caught delays before it caught problems. Features waited in `dev` for unclear reasons. Bugs were fixed in `dev` and re-fixed in `main`.

We deleted `dev`. Now there's `main`. Features merge when they're ready. Releases happen from `main`. The integration point is the pull request, not the branch.

We gave up the feeling of a safety buffer. We gained speed.

---

**The parallel command families.** We had `ghostwire:spec:*` for specifications and `ghostwire:workflows:*` for execution. The distinction was that specifications were "planning" and workflows were "doing."

The distinction was artificial. A specification is a workflow in the planning phase. The artifact model was identical. The user experience was different — and worse. Two families meant two things to learn, two things to document, two things to maintain.

We deleted `ghostwire:spec:*`. Now there's `ghostwire:workflows:*`. The lifecycle is linear: plan, create, work. One family. One mental model.

---

## Why We Keep Building Things We Don't Need

**Future flexibility.** "What if we need this later?" is the enemy of simplicity now. The feature you build for hypothetical future use adds maintenance cost today. If the future arrives and you need something different, you'll have built the wrong thing anyway.

The right time to build for the future is when the future is the present.

---

**Solving the immediate problem.** When someone needs a routing system, the orchestrator feels necessary. When someone needs a staging area, `dev` feels necessary. When someone needs a distinction, a parallel system feels necessary.

These solutions solve real problems. They also create ongoing costs. The discipline is distinguishing between problems that need systems and problems that need conventions.

A convention — "we merge directly to main" — is cheaper than a system — "we integrate in dev, then merge to main."

---

**The appeal of control.** Systems feel safer than conventions. A `dev` branch is a control mechanism. An orchestrator is a control mechanism. A schema is a control mechanism.

Control is seductive. It promises predictability.

The cost is complexity. Systems have to be maintained, understood, and debugged. Conventions just have to be followed.

---

## The Test

Before building, ask:

**What happens if I don't?**

If the answer is "things break" — people will put skills in the wrong directory, models will be misconfigured, agents will behave unexpectedly — then you need a system.

If the answer is "nothing bad happens, people will figure it out" — then the system is optional. Consider whether the optionality is worth the maintenance cost.

---

## The Cruelty of Clever

The cruelest technical debt isn't the legacy system you inherited. It's the clever thing you built that worked once and burdened everything after.

A 42-agent system seemed reasonable when there were 10 agents. The 11th specialist felt necessary. So did the 12th. By the time there were 42, the system was coherent — in a complex way. Deleting it felt like losing capability.

We deleted it anyway. The capability — the specialized behaviors — lived in profiles. The agents themselves were just routing infrastructure.

The clever routing infrastructure had been solving a problem we didn't have. We just hadn't noticed.

---

## What We Gave Up

We gave up flexibility we never used.

The orchestrator could have routed requests intelligently. We never needed that intelligence — users routed themselves. The flexibility was theoretical.

The `dev` branch could have caught integration problems. It mostly caught delays. The control was illusory.

The `ghostwire:spec:*` commands could have distinguished planning from execution. They didn't — the distinction was artificial. The parallel system was confusing.

In each case, we traded hypothetical capability for real simplicity. The trade was right.

---

## The Rule

Before building, exhaust convention.

Can a folder structure solve this? Can a naming convention solve this? Can a documented practice solve this?

If yes, document the convention and move on.

If no — if the problem genuinely recurs in ways that convention can't address — then build the system.

Build the simplest system that solves the problem. Not the most flexible system. Not the most extensible system. The simplest one.

And build it knowing that someday, you might delete it.
