# Directory Structure as Communication: A Technical Narrative

**Branch**: `002-consolidate-commands-structure`  
**Date**: February 2026  
**Author**: Engineering team  
**Audience**: Anyone wrestling with directory structure and organizational clarity in evolving codebases

---

## Why This Document Exists

This essay is about a small refactor that changed where files live. But it's really about something larger: how directory structure either communicates intent or obscures it. When a new developer can't answer "where does this belong?", the structure is failing as a communication medium. This document explores that failure and what to do about it.

---

## The Problem Space

### What Kind of Problem Is This?

This is a **naming and co-location problem**—specifically, a case where the directory structure no longer reflected the actual relationships between components. The `src/commands/` directory had become a mixed-purpose container holding four distinct types of things: command definitions, authoring templates, prompt fragments, and agent-specific customizations.

This is a common category of problem in evolving systems. As features grow, directories accumulate artifacts that made sense individually but collectively create confusion. The issue isn't that the original decisions were wrong—it's that the system evolved past the structure that once served it.

### How Did It Manifest?

The symptom was simple: no one could confidently answer where something belonged. A developer adding a new agent customization prompt had no clear answer about whether it belonged in `commands/` or somewhere else. The structure told them "everything is here" but didn't say why.

More specifically, the `profiles/prompts/` directory lived under `commands/` but contained prompts specific to agents in `orchestration/agents/`. The relationship was inverted. Agent definitions were in one place, their customizations in another—bound by convention rather than structure.

The symbol name was also misleading: `PROFILE_PROMPTS` suggested a generic "profile" concept that no longer matched what the code actually did. The name was a historical artifact, accurate once but no longer.

### Why Did It Emerge?

This problem emerged through **organic growth without structural discipline**. The commands directory was created to hold command-related code, and as new capabilities arrived—templates, prompts, profiles—they were added there because "it was commands-related." No one made a wrong decision; each addition was reasonable in isolation. The accumulation is what created the problem.

This is a pattern worth recognizing: structural debt accumulates through individually reasonable decisions. No single commit creates it; it's the gradual drift away from a coherent structure.

---

## The Solution

### Guiding Principles

The fix was guided by two principles that apply broadly:

**Co-location reflects ownership and relationship.** When two things are conceptually related, their locations should make that relationship visible. Agent customizations belong with agents—not because of a rule, but because they are meaningless without the agents they customize.

**Structure should answer questions, not create them.** A good directory structure lets a developer answer "where would X be?" without reading code. If the answer requires investigation, the structure is failing as communication.

### Architectural Choices

We made three specific changes:

1. **Cleaned the commands directory.** `src/commands/` now contains only templates and prompts—the authoring and composition layers for commands. This is the narrowest correct scope.

2. **Moved agent prompts to agent location.** The old `src/commands/profiles/prompts/` became `src/orchestration/agents/prompts/`. The prompts now live alongside the agents they customize. The path itself communicates the relationship.

3. **Renamed the symbol.** `PROFILE_PROMPTS` became `AGENT_PROMPTS`. Names that don't match what they represent are a tax on every future reader.

### What Was Considered and Rejected

We considered keeping the profiles directory but moving it under `orchestration/`. This would have reduced import changes but preserved the mixed-purpose problem. We rejected it because it didn't solve the core issue—just moved the confusion.

We considered creating a `.github/commands/` directory to mirror the source structure in exported artifacts. This was rejected because `.github/` is for output, not input—mixing those creates its own confusion.

We considered keeping the `PROFILE_PROMPTS` name to minimize changes. This was rejected because the misleading name was itself part of the problem. Renaming is cheap; ongoing confusion is expensive.

---

## The Implementation

The implementation was straightforward: move files, update six import statements from three paths, rename a symbol across thirteen references. The export pipeline required no changes—it didn't reference the old paths.

The key verification was confirming nothing broke: export pipeline still works, TypeScript compiles cleanly, test suite passes at 100%. The fix was structural, not behavioral.

---

## What Was Not Changed

This was a structural cleanup, not a redesign. Several things were explicitly left alone:

- **Command templates** were reorganized but not modified—they're still templates for the same commands
- **Agent loading logic** remained unchanged—only the import paths changed, not how agents consume prompts
- **Export artifacts** stay at `.github/prompts/`—that location wasn't the problem
- **Profile features** were not redesigned, just reorganized under the correct name

---

## Transferable Insights

**Directory structure is a communication medium.** It should answer questions, not create them. When developers hesitate at "where does this belong?", the structure is failing.

**Mixed-purpose directories are a smell.** If a directory contains multiple types of things that aren't obviously related, it's telling you the mental model has drifted.

**Renaming is cheap.** A misleading name is a tax on every future reader. The cost of changing it is low; the cost of not changing it compounds.

**Co-location reduces cognitive load.** Things that are conceptually related should be structurally near each other. It makes the system easier to explore and reason about.

**Structural debt accumulates through reasonable decisions.** No single commit creates it; it's the gradual drift. The fix is periodic structural review—asking "does this still make sense?" before the drift becomes entrenched.

---

## Closing

This was a small refactor: six files, thirteen references, one renamed symbol. The code change was trivial. But the insight is larger: directory structure is an interface to every future developer. It either communicates the system's mental model or it doesn't.

The fix didn't require new patterns or complex engineering. It required looking at the structure and asking "what is this actually telling people?" When the answer no longer matched reality, we aligned the structure with the concept. That's the general principle: structure should follow mental model, not the other way around.
