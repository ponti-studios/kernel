# The Abstraction Tax

**Every abstraction you add is a loan against future understanding.**

---

## The Receipt

When you write an abstraction, you get something immediately: cleaner call sites, a named concept, a single place to modify behavior. You feel productive. The code looks better.

The debt accrues silently.

It shows up as the new engineer who needs three hours to understand why there are four ways to discover skills. As the bug that only reproduces in the config-composer code path and not in plugin init. As the integration test that passes because it mocks the abstraction, never catching the bug that only exists in the real implementation.

Abstractions compound. They don't decay.

---

## The Skill Discovery System

We built a skill discovery system with seven discovery origins:

1. Project-local `.claude/skills`
2. User-level config directories
3. Plugin-bundled defaults
4. Explicit paths in the JSON config file
5. `.github/skills`
6. `.agents/skills`
7. System-level defaults

Each origin had different validation rules. Each had different scope semantics. Each had different fallback behavior. The code that merged these into a final set lived in five different files.

The final set — what skills were actually available at runtime — was a function of which code path ran first, which varied based on how the caller had invoked the loader. If a skill appeared in two places, which one won depended on conditions that required reading multiple files to trace.

When the export command produced a manifest that didn't match what the runtime resolved, we spent a week tracing the divergence through the merger, the async loader, the config composer, and the plugin init function.

The abstraction had been paying dividends for months. The bill came due all at once.

---

## The Command System

We called it "command." It meant:

1. A source definition (what the developer writes)
2. A rendered template (what gets sent to the model)
3. A generated registry (what the system indexes)
4. An invocation token (what the user types)

All called "command." All in the same namespace. All vaguely related to each other, but in different ways.

The problem wasn't naming. The problem was that four distinct concepts had been conflated into one, and the conflation lived in the code. Every piece of code that touched commands had to know which meaning applied in which context.

We spent three months disentangling this before we could add a new command type without worrying about which of the four "command" concepts we were affecting.

---

## The Agent Factory

We had 38 agents defined as TypeScript factory functions. We had 29 agents defined as Markdown files. Both loaded into the system. Both could be used at runtime. Neither was sure which one was authoritative.

When they diverged — and they did — we had to manually reconcile. When we added a new agent, we had to add it twice. When we deprecated one, we had to deprecate twice.

Two formats. Two loading systems. Two maintenance costs. One didn't know about the other.

---

## Why We Keep Doing This

Abstractions feel good. When you write `discoverSkills()`, you're solving the immediate problem: the call site is clean, the concept is named, the behavior is centralized.

The cost is deferred. It shows up as complexity in the next feature, the next bug, the next engineer.

We keep building abstractions because we optimize for the moment we're in. The abstraction solves today's problem. Tomorrow's problem — understanding the abstraction — is someone else's problem.

This is rational. It's also how technical debt accumulates.

---

## The Test

Before adding an abstraction, ask:

**What does this cost if it becomes permanent?**

Not "what does this solve" — that's the benefit column. Ask: what happens if this abstraction is still here in three years, maintained by someone who didn't write it, applied to use cases I didn't anticipate?

If the answer is "it will be fine," add the abstraction.

If the answer is "it will require documentation, a migration path, and a deprecation strategy," consider whether the problem you're solving is worth that cost.

---

## What We Chose

We chose one discovery path. One loading system. One format.

We deleted the others.

The cost was migration: every user who had skills in `.github/skills` or `.claude/skills` had to move them. The benefit was clarity: no more precedence rules, no more collision diagnostics, no more "which path wins" questions.

The loan was paid. The abstraction tax was charged. We decided to stop borrowing.
