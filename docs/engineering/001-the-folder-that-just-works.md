# The Folder That Just Works

**The best interface is a directory.**

---

## The Problem We Invented

Once, we had a skill discovery problem.

Skills lived in `.claude/skills`. Also in `.github/skills`. Also in user-level config directories. Also in plugin-bundled defaults. Also in paths explicitly declared in the JSON config file. Each origin had slightly different validation rules, slightly different scope semantics, and slightly different fallback behavior.

The code that consolidated all of these into a final usable set had branching logic scattered across the loader, the merger, the async loader, the config composer, and the plugin init function.

We called it "skill discovery." What it did was run `ls` in six places and merge the results.

---

## The Instinct to Complicate

Here's what happened: somewhere early in the project, someone needed skills to be discoverable from a second location. The reason was legitimate — they wanted project-level skills separate from user-level skills. So we added a second discovery path.

Then someone needed plugin-bundled skills. So we added a third path.

Then someone needed the export command to include skills from a different location than the runtime. So we added a fourth path with slightly different merge semantics.

Each addition solved a real problem. Each addition felt necessary. None of them felt like the beginning of a system that would eventually require a 200-line `discoverSharedPipelineSkills` function with four priority tiers, three fallback modes, and collision diagnostics.

The instinct to solve problems with code is good. The failure mode is forgetting that some problems are already solved by convention.

---

## What We Learned

A directory with a consistent name is a discovery mechanism.

If you put `SKILL.md` in `.agents/skills/`, and the system looks in `.agents/skills/`, you have skill discovery. No merge policies. No precedence hierarchies. No collision diagnostics. Just: put your file here, it gets loaded.

This isn't a new insight. It's how Unix works. Filesystem paths are the original discovery mechanism. `PATH` is just a list of directories to search. We re-implemented `PATH` in TypeScript with Zod schemas and async loaders, and we called it "skill discovery."

The irony is that the simpler system — a folder — would have worked from the beginning. The complexity we added didn't add capability. It added maintenance burden.

---

## The Rule

**Before building a discovery system, ask: can a directory solve this?**

If you need to find things, put them in a directory. If you need to prioritize things, use subdirectories (project, user, system). If you need to prevent collisions, use naming conventions.

If you need more than that — if you need runtime composition, conditional loading, or cross-reference validation — then build the system. But build it knowing what you're trading away.

---

## What This Isn't

This isn't an argument against all abstraction. Sometimes you genuinely need a manifest. Sometimes generated output needs to reflect composed state. Sometimes cross-reference validation catches real bugs.

This is an argument against building abstraction before you understand what you're abstracting. The instinct to "solve" a problem that is already solved by `mkdir` and `ls` is the instinct that creates systems requiring 200-line documentation to explain.

---

## The Folder That Won

In the end, we chose `.agents/skills` as the canonical location. Not because it was technically superior to `.github/skills` or `.claude/skills` — all three are just directories. We chose it because:

1. It matched the OpenAI Codex convention for scoped discovery
2. It avoided namespace collision with GitHub-specific tooling
3. It was short enough to type

The entire "skill discovery" system reduced to: look in this folder.

Sometimes the best interface is a path.
