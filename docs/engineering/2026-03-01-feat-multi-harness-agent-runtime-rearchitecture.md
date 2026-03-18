# Multi-Harness Support Through Canonical Schemas: A Technical Narrative

**Branch**: `2026-03-01-feat-multi-harness-agent-runtime-rearchitecture`  
**Date**: March 2026  
**Author**: Engineering team  
**Audience**: Anyone building tools that work across multiple AI agent environments

---

## Why This Document Exists

When a tool is designed for one AI environment, it's tailored to that environment's specifics. Commands work the way that environment expects, agents route the way that environment supports, and policies are enforced in ways that environment allows. But what happens when you want that tool to work in multiple environments—Claude, Codex, Copilot—each with different transport mechanisms and constraints?

This document explores that challenge: how to build one tool that behaves consistently across multiple AI harness environments, and what architectural choices make that possible.

---

## The Problem Space

### What Kind of Problem Is This?

This is a **multi-environment portability and consistency problem**—specifically, a case where the same tool needs to work correctly across different AI agent environments (harnesses) that have different interaction models, transport mechanisms, and capability constraints.

The core tension: the user wants `/ghostwire:workflows:plan` to mean the same thing whether they're in Claude, Codex, or Copilot. But each harness has different ways to invoke commands, route to agents, and enforce policies. Making behavior consistent requires understanding and managing those differences.

This is analogous to writing cross-platform code—you want one codebase that works on Windows, macOS, and Linux. The analogy is imperfect (these are AI environments, not operating systems), but the challenge is similar: abstract the differences so the core logic is the same.

### How Did It Manifest?

The symptoms were practical inconsistencies:

- **Command invocation**: Some harnesses use slash commands, others use different patterns. The same command might need different invocation mechanisms in different harnesses.

- **Agent routing**: The `@agent` syntax works across harnesses, but the underlying routing, tool policies, and model hints differ in implementation details.

- **Source of truth duplication**: The runtime loaded commands one way, export generated artifacts another way, and neither was clearly "the" source. Prompt composition happened at runtime through mutation, not at compile time through deterministic generation.

- **No conformance testing**: There was no way to verify that behavior was consistent across harnesses. Each harness could drift independently, and you'd only discover inconsistency when users reported problems.

### Why Did It Emerge?

This emerged because the tool was originally built for one harness (likely Claude), and the multi-harness requirement came later. The original architecture assumed a single environment, and the code reflected that assumption. When support for additional harnesses became a goal, the architecture didn't accommodate it cleanly.

This is a common pattern: systems are built for their initial context, and extending to new contexts requires architectural rethinking. The original architecture wasn't wrong—it just wasn't designed for the new requirement.

---

## The Solution

### Guiding Principles

Three principles guided the rearchitecture:

**Canonical schemas are the single source of truth.** Commands, agents, and prompt assets should be defined in declarative schemas that are harness-agnostic. The schemas are the authoritative definition; adapters translate them to harness-specific behavior.

**Adapters isolate harness-specific differences.** The core logic should not know about harness-specific transport mechanisms, policy enforcements, or invocation patterns. Adapters handle that translation at the boundaries.

**Generation should be deterministic and compile-time.** Rather than composing prompts at runtime through mutation, the system should generate complete artifacts at build time. This ensures consistency—there's no runtime variation to cause drift.

### Architectural Choices

The solution introduced several key concepts:

1. **Canonical Schemas**:
   - `CommandIntentSpec`: Defines what a command is (id, description, args, acceptance)
   - `AgentSpec`: Defines what an agent is (id, intent, route, tool policy, model hints)
   - `PromptAsset`: The prompt content itself (id, kind, body, version)

2. **Execution Plans**: Composites that bind intents to profiles to prompt assets—generated at build time, not composed at runtime.

3. **Harness Adapters**: Each harness (claude, codex, copilot) gets an adapter that:
   - Translates canonical commands to harness-specific invocation
   - Translates agent routing to harness-specific mechanisms
   - Translates policies to what the harness supports

4. **Generated Catalogs**: Single source-of-truth artifacts consumed by both runtime and export—generated from the canonical schemas.

### What Was Considered and Rejected

We considered maintaining harness-specific code paths within the core. This was rejected because it creates drift—harness-specific code diverges over time, and consistency is lost. The adapter boundary forces harness-specific logic to stay isolated.

We considered loading different schemas per harness (adapting at load time). This was rejected because it adds complexity to runtime. The canonical schemas should be the same for all harnesses; adapters translate, not modify.

We considered runtime composition (building execution plans at runtime). This was rejected because it creates variation and makes testing harder. Compile-time generation is deterministic and verifiable.

---

## The Implementation

The implementation introduced a clear separation:

```
src/
├── intents/        # CommandIntentSpec definitions
├── profiles/       # AgentSpec definitions  
├── prompt-assets/  # PromptAsset definitions
├── composition/   # ExecutionPlan generation
├── adapters/
│   ├── claude/    # Claude-specific translation
│   ├── codex/     # Codex-specific translation
│   └── copilot/   # Copilot-specific translation
└── generated/     # Generated catalogs (single source of truth)
```

The key insight is that the core artifacts don't know about adapters. An intent spec is just data—it's the adapter's job to translate that data into harness-specific behavior.

Conformance testing was added to verify that behavior matches across harnesses. The test executes the same commands and agent routes in each adapter and compares normalized outputs. This catches drift before it reaches users.

---

## What Was Not Changed

This was a rearchitecture, not a feature addition:

- **Existing commands and agents**: The 38+ commands and all agents remain, just defined through canonical schemas instead of code
- **User-facing interfaces**: Commands and agents work the same way from the user's perspective
- **Plugin system**: User/community extensions are not affected

---

## Transferable Insights

**Multi-environment support requires adapter boundaries.** The core logic must not know about environment-specific details. If it does, environment-specific code will diverge. Adapters are the mechanism that keeps the core clean while translating to each environment.

**Canonical schemas enable consistency.** When all environments consume the same declarative definitions, they can be verified for parity. If each environment has its own definition, parity is impossible to verify.

**Compile-time generation is more testable than runtime composition.** When execution plans are generated at build time, they're deterministic and verifiable. When they're composed at runtime, they can vary in ways that are hard to detect.

**Conformance testing is essential for multi-environment systems.** Without it, drift happens silently and only surfaces when users report problems. A conformance suite that runs in CI catches drift immediately.

---

## Closing

The core insight is that supporting multiple harness environments requires treating those environments as adapters, not as core logic. The tool's semantics should be harness-agnostic—defined in canonical schemas that all environments consume. The adapters translate those semantics to what each harness supports.

This separates concerns cleanly: the core defines what should happen (intents, agents, prompts), the adapters define how to make it happen in each environment. This makes the system maintainable—changes to command behavior are made once in the canonical schema, not in multiple harness-specific paths—and testable—conformance testing verifies that all adapters produce equivalent behavior.

The transition from harness-specific code to adapter-based architecture isn't trivial, but it enables a credible multi-harness story. Users can trust that `/ghostwire:workflows:plan` means the same thing whether they use Claude, Codex, or Copilot. That's the goal.