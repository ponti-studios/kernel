# Ghostwire v4: Architectural Approaches for Radical Simplicity

## Overview
This document outlines three distinct paths to evolving the Ghostwire architecture from a "Kitchen of 100+ items" to a "Non-Technical Friendly" system that maintains all current power while eliminating user confusion.

---

## Approach 1: The Role-Based Architecture (The "Dev Team" Model)

### User Experience
The user no longer sees a list of 38 agents and 50+ commands. Instead, they see a **Virtual Dev Team** consisting of 4 persistent roles:
1. **The Architect**: For high-level design, planning, and system-wide changes.
2. **The Developer**: For implementation, bug fixes, and refactoring.
3. **The Researcher**: For finding code, reading docs, and analyzing patterns.
4. **The Reviewer**: For security, performance, and quality audits.

**User Interaction:**
- User: "Hey Architect, how should we handle auth?"
- Architect: (Automatically triggers `/ghostwire:workflows:plan` and `researcher-codebase` under the hood).

### Technical Implementation
- **Role Routers**: Each role is a "Meta-Agent" that owns a specific set of internal commands.
- **Intent Mapping**: When a user speaks to a role, a lightweight `IntentClassifier` maps the prose to the most relevant internal command (e.g., "Review this" → `/code:review`).
- **Context Persistence**: Roles maintain a shared "Notepad" so the Architect knows what the Developer just did.

### Why it solves confusion
It replaces technical concepts (Agents/Commands) with human concepts (Roles/Jobs). Users already know how to talk to a "Reviewer."

---

## Approach 2: The Intent-Based Architecture (The "Omni-Box" Model)

### User Experience
A single entry point (e.g., `/do` or just natural language). The user never chooses anything. They simply describe their goal.

**User Interaction:**
- User: "Make the login page blue and add a 'Forgot Password' link."
- System: (Detects intent, realizes it needs `designer-builder` and `executor`, and just starts the workflow).

### Technical Implementation
- **Global Intent Hook**: A `UserPromptSubmit` hook that runs the prompt through a "Capability Matrix."
- **Dynamic Workflow Assembly**: Instead of static commands, the system assembles a "Phase Pyramid" on-the-fly:
    1. **Research Phase**: Spawns background agents to find relevant files.
    2. **Planning Phase**: Invokes `planner` to create a temporary todo list.
    3. **Execution Phase**: Invokes `executor` with the required skills.
    4. **Verification Phase**: Runs tests and diagnostics.

### Why it solves confusion
It eliminates the "Paradox of Choice" entirely. The user provides the **Goal**, and the system provides the **Path**.

---

## Approach 3: The Unified Agent Architecture (The "Super-Agent" Model)

### User Experience
The concepts of "Agents," "Commands," and "Skills" are deleted from the documentation and UI. There is only **Ghostwire**.

**User Interaction:**
- User: "Ghostwire, refactor the database layer."
- Ghostwire: "I'm on it." (Appears as a single, highly capable entity).

### Technical Implementation
- **Expertise Modules**: The 38 agents are converted into "Expertise Modules" (Markdown snippets).
- **Hot-Swapping System Prompt**: Based on the conversation context, the system dynamically injects the relevant expertise into the main agent's system prompt.
- **Recursive Swarming**: When Ghostwire needs to "Research," it calls a background version of itself with the "Researcher" module loaded.

### Why it solves confusion
It solves the "Passive Brain" trap. The agent is no longer a passive worker waiting for a command; it is a proactive entity that "swaps its own brain" to fit the task.

---

## Comparison Matrix

| Feature | Role-Based | Intent-Based | Unified Agent |
| :--- | :--- | :--- | :--- |
| **Mental Model** | Managing a Team | Using a Tool | Talking to a Peer |
| **Complexity** | Medium (4-5 choices) | Low (1 choice) | Zero (No choices) |
| **Control** | High (User picks role) | Medium (System picks) | Low (Agent decides) |
| **Technical Risk** | Low (Uses existing cmds) | High (Needs router) | High (Context bloat) |

---

## Recommendation
**Approach 1 (Role-Based)** is the recommended path. It provides the "Aha!" moment of a dev team while keeping the technical implementation grounded in the existing, proven command/agent infrastructure.
