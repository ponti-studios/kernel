# The Great Simplification: From 42 Agents to Two

**Date**: February 2026  
**Audience**: Engineers evaluating agentic framework architecture

---

## Why This Document Exists

When you have 42 agents, you have 42 names to maintain, 42 sets of tools to configure, 42 routing rules to keep consistent, and 42 potential points of failure. More importantly, you have 42 concepts that every user of your system must learn before they can be productive.

This document explains why we chose to consolidate our agent runtime from 42 specialized agents down to two universal ones (`do` and `research`), what we learned about agent taxonomy in the process, and how the specialized behaviors that 42 agents once provided are now delivered through a more composable mechanism: command profiles.

---

## The Problem: Agent Proliferation

### How We Got Here

The 42-agent model emerged organically. Each new capability seemed to warrant its own agent:

- A new code review need created `reviewer-python`, `reviewer-ruby`, `reviewer-typescript`
- A research task spawned `researcher-codebase`, `researcher-docs`, `researcher-world`, `researcher-repo`, `researcher-git`, `researcher-learnings`, `researcher-practices`, `researcher-data`
- Architecture decisions created `advisor-architecture`, `advisor-strategy`
- Design reviews spawned `analyzer-design`, `analyzer-patterns`, `analyzer-media`

The pattern is recognizable: specialization by domain, by language, by task type. On paper, this makes sense. A specialist should know more about their domain than a generalist. In practice, it created three categories of problems.

### The Configuration Explosion

With 42 agents, configuration became unmanageable. Users needed to know not just *that* they could configure agents, but *which* agent to configure for each task. The mental model required understanding:

1. Which agent handles code reviews?
2. Which handles architecture decisions?
3. Which handles research tasks?
4. How do I override the model for each?

The `agents` config block grew unwieldy:

```json
{
  "agents": {
    "executor": { "model": "anthropic/claude-sonnet-4" },
    "advisor-plan": { "model": "openai/gpt-5" },
    "reviewer-typescript": { "model": "anthropic/claude-code" },
    "reviewer-python": { "model": "anthropic/claude-sonnet-4" },
    "researcher-codebase": { "model": "openai/gpt-5-mini" },
    "researcher-repo": { "model": "openai/gpt-4o" }
    // ... 35 more entries
  }
}
```

### The Routing Problem

Agent-to-agent delegation (`delegate_task`) required knowing which agent ID to target. Did you want `researcher-codebase` or `researcher-repo` for this task? What about `researcher-docs`? The answer depended on subtle distinctions that users shouldn't need to memorize.

```typescript
// Before: Which researcher?
delegate_task(subagent_type="researcher-codebase", ...)
delegate_task(subagent_type="researcher-repo", ...)
delegate_task(subagent_type="researcher-docs", ...)
delegate_task(subagent_type="researcher-world", ...)
```

### The Documentation Tax

Every new agent required documentation. What does it do? What tools does it use? What model should I use? How do I configure it? The skill and command documentation grew proportionally, creating a maintenance burden and a user experience problem: the more documentation existed, the harder it became to find relevant information.

---

## The Decision: Two Universal Agents

### The Core Insight

The real distinction between agents wasn't about specialization—it was about *direction*. Are we building something new, or are we investigating something existing? Are we creating, or consuming?

Two categories emerged:

1. **`do`**: The execution agent. Used for planning, building, refactoring, reviewing, implementing. If the work involves producing something, `do` handles it.

2. **`research`**: The investigation agent. Used for codebase exploration, documentation retrieval, pattern analysis, learning synthesis. If the work involves understanding something, `research` handles it.

This is not a new insight. It's essentially the classic maker/scheduler split, or the Unix distinction between compilers and interpreters. But applying it to agent runtime simplified everything.

### What Was Rejected

**Multi-agent orchestration**: Some proposed keeping specialized agents but adding a higher-level orchestrator that would route tasks to the right agent. This would have preserved the 42 agents while adding a router layer.

We rejected this because it added complexity without solving the fundamental problem: users still needed to understand the 42 agents to configure them properly, and the orchestrator became yet another concept to learn.

**Agent capability tagging**: Another proposal was to tag agents with capabilities (`can_review`, `can_research`, `can_plan`) and route dynamically based on capability matching.

We rejected this because it created implicit routing rules that were hard to audit and predict. When a task could be handled by multiple agents with overlapping capabilities, the selection logic became opaque.

**Three agents (add "review")**: We briefly considered three agents: `do`, `research`, and `review`. This felt logical because reviews are different from execution.

We rejected this because reviews are fundamentally execution tasks—just with different verification criteria. A code review is still "do" work; it just happens to verify rather than create.

### The Migration Strategy

We chose a "hard cut" approach rather than a gradual migration. The release was marked as a major version with strict breaking changes:

1. All 42 legacy agent IDs now fail schema validation
2. `delegate_task` with a legacy agent ID produces a clear error listing valid options
3. All configuration using legacy agent IDs fails fast with migration guidance

This was intentional. Maintaining backward compatibility would have kept the complexity alive indefinitely. Users needed to migrate, and they needed to migrate completely.

---

## The Mechanism: Command Profiles

### Where the Specialization Went

The 42 agents weren't wrong about *what* they did—they were wrong about *how* that behavior was delivered. The specialized behaviors (Python review patterns, Rails conventions, architecture review criteria) are still valuable. They just don't need to be agents.

Command profiles encapsulate specialist behavior:

| Deleted Agent | Replacement Profile | Behavior Preserved |
|---|---|---|
| reviewer-rails | `reviewer_rails` | Rails-specific review criteria |
| researcher-codebase | `researcher_codebase` | Codebase exploration patterns |
| advisor-architecture | `advisor_architecture` | Architecture review principles |

### The Migration Pattern

Before (agent-based):
```typescript
delegate_task(subagent_type="reviewer-rails", ...)
```

After (profile-based):
```typescript
delegate_task(subagent_type="do", prompt="[profile: reviewer_rails] Review Rails conventions")
```

The `do` agent receives the specialist behavior through prompt injection from the profile. The agent itself doesn't need to know about Rails conventions—it just follows the injected guidance.

### Configuration Simplification

The `agents` config block became trivially simple:

```json
{
  "agents": {
    "do": { "model": "anthropic/claude-sonnet-4" },
    "research": { "model": "openai/gpt-5-mini" }
  }
}
```

Two entries. Two models to choose. The mental model is now: "Do I need to build something or understand something?"

---

## What Was Not Changed

**Tool availability**: The tools available to agents (`read`, `edit`, `search`, `delegate_task`, etc.) remain unchanged. Agents still have access to the same capabilities; they just use them differently based on context.

**Command catalog**: The 32 commands (`ghostwire:code:review`, `ghostwire:workflows:plan`, etc.) remain intact. These are still the user-facing entry points.

**Skill system**: Skills that users have written remain functional. Skills are loaded through the canonical discovery pipeline and applied to agents based on task context.

**Profile internals**: The profile prompt content (what was previously the agent's system prompt) is now located at `src/commands/profiles/prompts/<profile_id>.ts`. This is an implementation detail of the consolidation.

---

## Transferable Insights

### 1. Taxonomy Beats Specialization

The maker/scheduler distinction (or equivalently, the do/research distinction) is a *taxonomy*—a way of categorizing all tasks into fundamental types. Specialization is *granularity*—a way of refining task handling within a category.

Taxonomies are stable; granularities are volatile. The distinction between "doing" and "researching" has remained true since the first human sharpened a stone. The distinction between "Python reviewer" and "Ruby reviewer" changes as languages fall out of favor.

When designing systems that must evolve, invest in stable taxonomies.

### 2. Configuration Complexity Is a User Experience Problem

Every configuration option is a decision that a user must make. Configuration blocks that require understanding 42 items to populate correctly impose a cognitive tax that compounds over time.

Simple configuration isn't just "easier"—it's more predictable. When there are two options, users can reason about the implications. When there are 42, they guess.

### 3. Hard Cuts Enable Clarity

Gradual migrations preserve complexity indefinitely. Every backward-compatibility layer is a cognitive debt that future maintainers must carry. When the goal is simplification, be decisive.

This doesn't mean hard cuts are always right—sometimes the transition cost exceeds the benefit. But when the existing state is genuinely harmful (and 42 agents was genuinely harmful), the transition cost is an investment, not a loss.

### 4. Specialization Can Live in Content, Not Code

The behaviors that made the 42 agents valuable—the Rails conventions, the Python patterns, the architecture principles—are still in the system. They're just now expressed as profile prompts rather than agent implementations.

This is a general principle: code is the most expensive form of knowledge. Content (prompts, documentation, templates) is cheaper to maintain and easier to update. Prefer expressing specialized knowledge as content when possible.

---

## The Rule Going Forward

**Runtime agents are restricted to `do` and `research`.** Any request to add a new runtime agent ID will be rejected. Specialized behaviors belong in profiles, which are applied contextually to the two universal agents.

This rule is enforced at the schema level. `delegate_task` with a non-`do`/`research` agent ID fails validation. The `agents` config only accepts `do` and `research`.

If you need specialized behavior, write a profile.
