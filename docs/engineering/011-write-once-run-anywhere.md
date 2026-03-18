# Write Once, Run Anywhere

**The abstraction level you choose determines the surface area you own.**

---

## The Lock-In Problem

We had built something for one harness.

Our agents assumed specific tool APIs. Our commands used OpenCode-specific formats. Our skills lived in OpenCode-specific directories. To run in GitHub Copilot, we would have had to rewrite everything.

This is the lock-in problem. When your system assumes a specific runtime, you're coupled to that runtime. The coupling feels invisible when you're happy with the runtime. It becomes visible the moment you want to change.

---

## The Naive Response

The naive response to lock-in is: build adapters.

For each new harness — Copilot, Cursor, Claude Code — write an adapter that translates your system's output to the harness's format. The core system stays the same. The adapters change.

This works. It's also incomplete.

The adapters are simple at first. Then they diverge. Copilot's format changes. Claude Code adds a feature that your adapter can't handle. Cursor removes something your adapter depends on.

The adapters become their own codebase. Their own maintenance burden. Their own source of bugs.

The lock-in hasn't disappeared. It's moved.

---

## The Real Question

The real question isn't "how do we support multiple harnesses?" It's "what should be harness-specific, and what shouldn't?"

Harnesses differ in:

- **Tool formats**: How they represent file edits, bash commands, search results
- **Directory conventions**: Where they look for skills, commands, configuration
- **Prompt injection**: How they add context to system prompts

These differences are real. They can't be abstracted away.

Harnesses share:

- **Workflow logic**: What steps a developer goes through to accomplish something
- **Agent personas**: How an agent thinks, reasons, approaches problems
- **Domain knowledge**: Rails conventions, architecture patterns, security principles

These commonalities are also real. They can be shared.

---

## The Abstraction Level That Works

We chose to make **agents harness-neutral** and **adapters harness-specific**.

Agents are pure reasoning personas. They contain no tool API calls. They reference tools conceptually ("edit a file") rather than specifically ("use the OpenCode Edit tool").

Adapters translate between the conceptual and the specific. When an agent says "edit the file," the OpenCode adapter translates that to the OpenCode edit tool. The Claude Code adapter translates it to the Claude Code edit command.

The agents don't know the difference. They don't need to.

---

## What We Gave Up

We gave up the idea of a single adapter that handles everything.

Some things genuinely differ between harnesses. Cursor has features that Copilot doesn't. Claude Code has different context windows. These differences can't be abstracted — they have to be handled.

By accepting that harnesses differ, we stopped trying to hide the differences. We made them explicit in adapters. The adapters do one thing: translate between the abstract and the concrete.

---

## The Pattern

When building for multiple environments:

**Identify what the environments share.** Workflow logic, domain knowledge, agent reasoning. These can be shared code.

**Identify what the environments differ in.** Tool formats, directory conventions, prompt syntax. These belong in adapters.

**Choose the right abstraction level.** If your shared code assumes a specific environment, it's not actually shared. If your adapter-specific code contains shared logic, it should be moved up.

The goal isn't to make everything the same. It's to make the shared parts actually shared.

---

## The Test

Ask: if we changed the target environment, what would break?

If the answer is "everything," the abstraction level is too low. Everything is coupled to the environment.

If the answer is "the adapters," the abstraction level is right. The core is shared; the edges are adapted.

---

## What We Learned

Abstractions that hide differences are leaky. The differences show up somewhere — usually in the adapters, which become unmaintainable.

Abstractions that expose differences are honest. They acknowledge that harnesses differ, and they handle the differences explicitly.

The honest approach is harder to design. It's easier to maintain.

Choose the hard thing.
