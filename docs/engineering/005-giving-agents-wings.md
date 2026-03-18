# Giving Agents Wings: Building Self-Managing Systems

**Date**: February 2026  
**Author**: Engineering team  
**Audience**: Anyone building autonomous agent systems and wondering how much self-management to enable

---

## Why This Document Exists

A tool that gives users agents but doesn't let those agents manage themselves creates a fundamental bottleneck: every task that requires managing sessions, todos, skills, or background tasks requires human intervention. This document explores how Ghostwire expanded from 10% CRUD completeness (1 of 10 operations) to 90%—enabling agents to manage their own workspace.

---

## The Problem Space

### What Kind of Problem Is This?

This is an **agent autonomy and self-management problem**—specifically, a case where the capabilities available to agents were imbalanced. Agents could read and list, but they couldn't create, update, or delete. This asymmetry meant agents could receive instructions but couldn't take independent action.

This is common in agent systems: it's easier to expose read operations than write operations, because write operations carry risk. But an agent that can't manage its own workspace can't be truly autonomous.

### How Did It Manifest?

The problem was concrete:

| Entity | Available Operations | Missing Operations |
|--------|---------------------|---------------------|
| Session | list, read, search, info | create, update, delete |
| Todo | None | create, read, update, delete |
| Skill | read (via load) | create, update, delete |
| Background Task | create, cancel | list, update, retry |

The impact was practical:

- **User friction**: Users had to manually create sessions for parallel work, manually add todos, manually configure skills
- **Lost context**: Agents couldn't spawn child sessions for parallel analysis
- **Limited autonomy**: Agents couldn't self-organize their workspace
- **Workflow interruption**: Users had to context-switch to manage infrastructure

### Real-World Scenarios

A code review agent identifies 5 security issues and needs to track follow-up work. Currently: user must manually create todos. After: agent calls `todo_create` for each.

An agent working on a feature needs to spawn 3 parallel analysis tasks. Currently: user must manually create 3 sessions. After: agent calls `session_create` 3 times.

An agent needs a custom skill for a domain (e.g., Rails security audit). Currently: user must manually create SKILL.md. After: agent calls `skill_create` with a template.

### Why Did It Emerge?

This emerged because read operations are safer than write operations. Reading data doesn't change system state; writing does. It's easier to justify exposing `session_list` than `session_delete`, because deletion carries risk.

The original implementation prioritized safety over autonomy. This was reasonable, but it created an incomplete system where agents could receive work but couldn't organize it.

---

## The Solution

### Guiding Principles

Three principles guided the expansion:

**Agent-native design**: All CRUD operations must be callable by agents, not just users. If an operation is useful for organizing work, agents should be able to use it.

**Authorization prevents accidents**: Operations that modify state need ownership and permission checks. The creator of a session has full access; attempts by other agents are validated.

**Cascade policies handle complexity**: Deleting a session with child sessions, todos, and active tasks is complex. Configurable cascade behavior (reject, delete, orphan, archive) handles this safely.

### Architectural Choices

The implementation added operations across four entities:

**Session CRUD**:
- `session_create`: Create new session, optionally as child of existing
- `session_update`: Update title, description, metadata
- `session_delete`: Delete with cascade options (reject if children, cascade delete, archive todos)

**Todo CRUD**:
- `todo_create`: Create in specified session
- `todo_list`: List with filters (status, priority, session)
- `todo_update`: Update content, status, priority
- `todo_delete`: Soft delete by default, hard delete with force

**Skill CRUD**:
- `skill_create`: Create from template (agent, tool, hook, analysis)
- `skill_update`: Update metadata or content
- `skill_delete`: Delete custom skills only (builtin protected)
- `skill_list`: List available skills with filtering

**Background Task**:
- `background_task_list`: List by session or status
- `background_task_update`: Retry, pause, resume operations
- `background_task_info`: Detailed status and output

### What Was Considered and Rejected

We considered centralized CRUD service (single service for all entities). This was rejected because it violates tool-based architecture—tools should be self-contained and composable.

We considered GraphQL-style API (unified interface for all CRUD). This was rejected because it's overkill for current needs; tools provide better type safety and discoverability.

We considered no authorization (trust all agents). This was rejected because security risk—any compromised agent could delete all sessions.

---

## The Implementation

The implementation was structured in phases:

**Phase 1: Foundation & Session CRUD**
- Defined authorization model with ownership tracking
- Implemented session_create, session_update, session_delete with cascade logic
- Added event emission for session lifecycle events

**Phase 2: Todo CRUD**
- Created todo-manager tool directory
- Implemented all four todo operations
- Integrated with existing todo-continuation-enforcer hook

**Phase 3: Skill CRUD**
- Created skill templates (agent, tool, hook, analysis)
- Implemented all four skill operations
- Added cache invalidation for skill loading

**Phase 4: Background Tasks**
- Implemented list, info, update operations
- Integrated with session delete for proper cleanup

**Phase 5: Integration & Polish**
- Added comprehensive error handling
- Updated tool index exports
- Verified performance targets (<100ms operations)

---

## What Was Not Changed

- **Read operations**: Existing list/read/search/info operations unchanged
- **Agent behavior**: All existing agents work identically
- **User-facing interfaces**: Users can still manage these entities manually

---

## Transferable Insights

**CRUD completeness matters for autonomy.** An agent that can read but not write is a reader, not an agent. Full autonomy requires the full set of operations.

**Authorization enables safe autonomy.** Without ownership and permission checks, write operations are too risky to expose. Authorization makes it possible to give agents the capabilities they need without giving them unlimited power.

**Cascade policies handle real complexity.** Deleting a session isn't just deleting a record—it's handling children, todos, and tasks. These policies need to be explicit and configurable.

**Templates enable agent skill creation.** When agents can create skills from templates, they can extend their own capabilities. This creates a self-improving system.

---

## Closing

The core insight is that agent autonomy is a spectrum, not a binary. Ghostwire started at 10%—agents could read but not write. Moving to 90% enables agents to manage their workspace: creating sessions for parallel work, tracking todos for follow-up, building custom skills for specialized domains.

This changes the human-agent dynamic. Instead of the human managing infrastructure while the agent does work, the agent manages its own workspace and the human focuses on direction. The agent becomes a true assistant, not just a tool that requires constant supervision.

The expansion wasn't trivial—it required authorization models, cascade policies, and careful integration. But the result is a system where agents can actually be autonomous.