# Structure Is Communication

**The directory tells you what the system believes about itself.**

---

## What We Had

We had a `src/` directory organized by type:

```
src/
  agents/       # Things that think
  commands/     # Things that do
  hooks/        # Things that intercept
  tools/        # Things that can be called
  features/     # Things that are features
  shared/       # Things that are shared
```

This organization answered the question: what kind of thing is this?

It did not answer: what does this thing do?

---

## The New Developer Problem

A new developer joins. They need to add a command. Where does it go?

They look at `src/commands/`. Good start. They look at `src/agents/`. Hmm. Some agents are in `commands/`. Some prompts are in `commands/`. The relationship is unclear.

They look at `src/hooks/`. Hooks intercept things. But agents intercept things too. Is a hook different from an agent? If so, how?

The type-based organization worked for the people who built it. They knew the implicit rules. For everyone else, it was guesswork.

---

## What We Chose

We reorganized by domain:

```
src/
  orchestration/  # How the system drives itself
  execution/      # How the system acts on the world
  integration/    # How the system connects to harnesses
  platform/       # How the system is configured
```

"Orchestration" describes the work of coordinating agents, phases, and hooks. If you touch how work gets delegated, you work in `orchestration/`.

"Execution" describes the work of running commands, applying profiles, and producing outputs. If you touch what gets run, you work in `execution/`.

"Integration" describes the work of adapting to different AI harnesses. If you touch harness-specific behavior, you work in `integration/`.

"Platform" describes the work of configuration, schema, and user-facing settings. If you touch how users configure the system, you work in `platform/`.

---

## What Changed

The files moved. The code didn't.

`src/agents/planner.ts` moved to `src/orchestration/agents/planner.ts`. `src/commands/templates/` moved to `src/execution/templates/`. The relationships between files didn't change — only the directories containing them.

The change was cosmetic. Except that it wasn't.

---

## What the Structure Taught

The old structure said: we have agents, commands, hooks, tools, features, and shared things.

The new structure said: we have orchestration, execution, integration, and platform.

The first structure described implementation. The second structure described behavior.

A developer reading the new structure learned what the system did. A developer reading the old structure learned what kinds of files existed.

---

## The Communication Effect

When the structure communicates, the structure teaches.

A developer who sees `src/orchestration/` learns: this system has a concept called orchestration. It means coordinating agents and phases. If I want to understand how work gets distributed, I start here.

A developer who sees `src/execution/` learns: this system has a concept called execution. It means running commands and applying prompts. If I want to understand what gets done, I start here.

The structure answers questions before they're asked.

---

## What We Rejected

**Feature-based organization.** Put related files together by feature: `src/planning/`, `src/code-review/`, `src/research/`.

Rejected because: features are volatile. They change as the system evolves. When "planning" and "code review" merge into "workflows," the directories need to merge too. Domain-based organization is more stable.

**Layer-based organization.** Put files by layer: `src/domain/`, `src/service/`, `src/data/`.

Rejected because: layers describe architecture patterns, not domain behavior. "Service" doesn't tell you what the system does. "Orchestration" does.

**Alphabetical organization.** Just put everything in `src/` and search.

Rejected because: search is fine for finding known things. It's terrible for exploring unknown things. A developer who doesn't know what they're looking for needs structure to navigate.

---

## The Message

Every directory is a statement about what matters.

When you put hooks in `src/hooks/`, you're saying: hooks are a first-class concept. When you put agents in `src/agents/`, you're saying: agents are a first-class concept.

When you put everything in `src/orchestration/` or `src/execution/`, you're saying: what the system does is more important than what kind of file it is.

The statement shapes how people think about the system. Make it deliberately.

---

## The Rule

Before creating a directory, ask:

**What does this directory name communicate?**

If the answer is "it describes a file type," consider whether the file type is the most important thing about its contents.

If the answer is "it describes a behavior," the directory earns its name.

The directories you create are the vocabulary of your codebase. Choose them with the same care you'd choose any other interface.
