# Configurable by Default: Building User-Controlled Systems

**Date**: February 2026  
**Author**: Engineering team  
**Audience**: Anyone building tools that need to balance sensible defaults with user customization

---

## Why This Document Exists

When a tool works but can't be configured, users are stuck with the developer's choices. When a tool is configurable but requires code changes, users must be developers to customize it. This document explores how Ghostwire moved from hardcoded model requirements to configuration-driven architecture—enabling users to control behavior through JSON without touching code.

---

## The Problem Space

### What Kind of Problem Is This?

This is a **user control and flexibility problem**—specifically, a case where system behavior was defined in code rather than configuration. Users who wanted different behavior had to fork the codebase, which is a high barrier.

This is common in systems that start with sensible defaults: developers make good choices, but different users have different needs. Without configuration, those needs go unmet.

### How Did It Manifest?

The symptoms were practical:

- **Hardcoded models**: Model requirements were in `src/orchestration/agents/model-requirements.ts` as `AGENT_MODEL_REQUIREMENTS`. Changing them required code changes, not configuration.

- **Duplicate definitions**: Models appeared in multiple places: `model-requirements.ts`, `delegate-task/constants.ts`, `docs/agents.yml`. This created drift risk.

- **No user control**: Users couldn't customize model assignments without forking the codebase. There was no JSON config option for model selection.

- **Documentation vs. reality**: `docs/agents.yml` contained model information but wasn't used at runtime—it was just documentation.

### Why Did It Emerge?

This emerged because the system was designed before the configuration architecture was complete. Model requirements were defined in code because that was the fastest path to working code. Configuration was added later, but model handling wasn't updated.

This is the natural state of growing systems: quick paths are taken early, and refactoring for configurability happens later when the need becomes clear.

---

## The Solution

### Guiding Principles

Three principles guided the architecture:

**Users control through configuration, not code.** If a user can configure behavior through JSON, they don't need to fork the codebase. This lowers the barrier to customization.

**Leverage existing schema structures.** Rather than creating new top-level sections, extend what's already there. Use `agents.X.model` and `categories.X.model` rather than creating a separate `models` section.

**Hierarchy enables flexible override.** Project config should override global config, which should override built-in defaults. Users can customize at whatever scope makes sense.

### Architectural Choices

The solution extended existing schema properties:

**Agent override configuration**:
```json
{
  "agents": {
    "operator": { "model": "opencode/kimi-k2.5" },
    "analyzer-media": { "model": "google/gemini-3-flash" }
  }
}
```

**Category configuration with variants**:
```json
{
  "categories": {
    "ultrabrain": { "model": "opencode/kimi-k2.5", "variant": "max" },
    "deep": { "model": "opencode/kimi-k2.5", "variant": "medium" }
  }
}
```

**Configuration hierarchy** (priority order):
1. Project config - agent-specific overrides
2. Project config - category defaults
3. Global config - agent-specific
4. Global config - category defaults
5. Built-in fallback (opencode/kimi-k2.5)

The implementation created:
- Schema extensions for `model` and `variant` properties
- Model resolver that checks config in priority order
- Installation process that writes sensible defaults
- Sync command for developers to reset/update defaults

### What Was Considered and Rejected

We considered a separate `models` top-level section in config. This was rejected because it duplicates the `agents` and `categories` structure, adds cognitive load, and creates maintenance burden.

We considered requiring all model configuration (no defaults). This was rejected because users should get working behavior without configuration. Sensible defaults are essential.

We considered provider-specific config (different schema per provider). This was rejected because it creates complexity and doesn't match how users think about models.

---

## The Implementation

The implementation had 5 phases:

**Phase 1: Schema Extensions**
- Added `model` property to `AgentOverrideConfigSchema`
- Added `model` and `variant` properties to `CategoryConfigSchema`
- Defined constants for configurable agent and category IDs

**Phase 2: Installation & Configuration**
- Created functions to write default models to global settings
- Integrated into installation process
- Created `sync-models` CLI command

**Phase 3: Runtime Resolution**
- Extended model-resolver.ts to check config in priority order
- Updated delegate-task tools to use new resolver
- Added diagnostics command

**Phase 4: Consolidation Cleanup**
- Deprecated old `AGENT_MODEL_REQUIREMENTS` (kept for compatibility)
- Removed hardcoded model assignments from constants
- Documented migration path

**Phase 5: Testing & Validation**
- 95%+ test coverage
- Zero breaking changes
- All tests passing

---

## What Was Not Changed

- **Existing behavior**: Users who don't configure models get the same defaults they always had
- **Backward compatibility**: Old code patterns work (with deprecation warnings)
- **Agent capabilities**: All agents work identically, only model selection is new

---

## Transferable Insights

**Configuration enables customization without forking.** When users can change behavior through JSON, they don't need to modify code. This is especially valuable for non-developer users.

**Extend existing structures rather than creating new ones.** Adding `model` to existing agent/category properties is simpler than creating a new `models` section. Users only need to learn one schema.

**Hierarchy provides flexibility at different scopes.** Some users want project-level overrides, others want global defaults. Both work because of the priority order.

**Sensible defaults are essential.** A configuration system that requires setup before use is friction. Users should get working behavior out of the box.

---

## Closing

The core insight is that tools should be configurable by default. Hardcoded choices—even good ones—become limitations when users have different needs. By moving model configuration from code to JSON, Ghostwire enables users to customize behavior without forking.

The path to this wasn't straightforward. It required schema design, hierarchy planning, migration handling, and backward compatibility. But the result is a more flexible system where users have control, not just developers.

This applies beyond models. Any hardcoded behavior in a system is a candidate for configuration. The question isn't "should this be configurable?" but rather "what do users need to control that they currently can't?"