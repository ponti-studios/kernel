# Ghostwire Overview

Learn about Ghostwire, a plugin that transforms OpenCode into the best agent harness.

---

## TL;DR

> **Cipher Operator agent strongly recommends Opus 4.5 model. Using other models may result in significantly degraded experience.**

**Feeling lazy?** Just include `ultrawork` (or `ulw`) in your prompt. That's it. The agent figures out the rest.

**Need precision?** Press **Tab** to enter planner mode, create a work plan through an interview process, then run `/jack-in-work` to execute it with orchestrator orchestration.

---

## What Ghostwire Does for You

- **Build features from descriptions**: Just tell the agent what you want. It makes a plan, writes the code, and ensures it works. Automatically. You don't have to care about the details.
- **Debug and fix issues**: Describe a bug or paste an error. The agent analyzes your codebase, identifies the problem, and implements a fix.
- **Navigate any codebase**: Ask anything about your codebase. The agent maintains awareness of your entire project structure.
- **Automate tedious tasks**: Fix lint issues, resolve merge conflicts, write release notes - all in a single command.

---

## Two Ways to Work

### Option 1: Ultrawork Mode (For Quick Work)

If you're feeling lazy, just include **`ultrawork`** (or **`ulw`**) in your prompt:

```
ulw add authentication to my Next.js app
```

The agent will automatically:
1. Search your codebase to understand existing patterns
2. Research best practices via specialized agents
3. Implement the feature following your conventions
4. Verify with diagnostics and tests
5. Keep working until complete

This is the "just do it" mode. Full automatic mode.
The agent is already smart enough, so it explores the codebase and make plans itself.
**You don't have to think that deep. Agent will think that deep.**

### Option 2: planner Mode (For Precise Work)

For complex or critical tasks, press **Tab** to switch to planner mode.

**How it works:**

1. **planner interviews you** - Acts as your personal consultant, asking clarifying questions while researching your codebase to understand exactly what you need.

2. **Plan generation** - Based on the interview, planner generates a detailed work plan with tasks, acceptance criteria, and guardrails. Optionally reviewed by validator-audit (plan reviewer) for high-accuracy validation.

3. **Run `/jack-in-work`** - The orchestrator takes over:
   - Distributes tasks to specialized sub-agents
   - Verifies each task completion independently
   - Accumulates learnings across tasks
   - Tracks progress across sessions (resume anytime)

**When to use planner:**
- Multi-day or multi-session projects
- Critical production changes
- Complex refactoring spanning many files
- When you want a documented decision trail

---

## Critical Usage Guidelines

### Always Use planner + orchestrator Together

**Do NOT use `orchestrator` without `/jack-in-work`.**

The orchestrator is designed to execute work plans created by planner. Using it directly without a plan leads to unpredictable behavior.

**Correct workflow:**
```
1. Press Tab → Enter planner mode
2. Describe work → planner interviews you
3. Confirm plan → Review .ghostwire/plans/*.md
4. Run /jack-in-work → orchestrator executes
```

**planner and orchestrator are a pair. Always use them together.**

---

## Model Configuration

Ghostwire automatically configures models based on your available providers. You don't need to manually specify every model.

### How Models Are Determined

**1. At Installation Time (Interactive Installer)**

When you run `bunx ghostwire install`, the installer asks which providers you have:
- Claude Pro/Max subscription?
- OpenAI/ChatGPT Plus?
- Google Gemini?
- GitHub Copilot?
- OpenCode Zen?
- Z.ai Coding Plan?

  Based on your answers, it generates `~/.config/opencode/ghostwire.json` with optimal model assignments for each agent and category.

**2. At Runtime (Fallback Chain)**

Each agent has a **provider priority chain**. The system tries providers in order until it finds an available model:

```
Example: analyzer-media
opencode
   ↓
kimi-k2.5
```

If you have OpenCode configured, it uses `opencode/kimi-k2.5`.

### Example Configuration

Here's a real-world config for a user with **Claude, OpenAI, Gemini, and Z.ai** all available:

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/hackefeller/ghostwire/master/assets/ghostwire.schema.json",
  "agents": {
    // Override specific agents only - rest use fallback chain
    "orchestrator": { "model": "opencode/kimi-k2.5" },
    "researcher-data": { "model": "opencode/kimi-k2.5" },
    "researcher-codebase": { "model": "opencode/kimi-k2.5" },
    "analyzer-media": { "model": "opencode/kimi-k2.5" }
  },
  "categories": {
    // Override categories for optimization
    "quick": { "model": "opencode/kimi-k2.5" },
    "unspecified-low": { "model": "opencode/kimi-k2.5" }
  },
  "experimental": {
    "aggressive_truncation": true
  }
}
```

**Key points:**
- You only need to override what you want to change
- Unspecified agents/categories use the automatic fallback chain
- Mix providers freely (Claude for main work, Z.ai for cheap tasks, etc.)

### Finding Available Models

Run `opencode models` to see all available models in your environment. Model names follow the format `provider/model-name`.

### Learn More

For detailed configuration options including per-agent settings, category customization, and more, see the [Configuration Guide](../reference/configurations.md).

---

## Next Steps

### Core Documentation
- [Installation Guide](./installation.md) - Detailed installation instructions
- [Architecture](../concepts/orchestration.md) - Deep dive into planner → orchestrator → operator workflow
- [Philosophy](../concepts/philosophy.md) - Principles behind Ghostwire

### Reference Documentation
- [Configuration Guide](../reference/configurations.md) - Customize agents, models, and behaviors
- [Features Reference](../reference/features.md) - Skills, commands, MCPs, and compatibility
- [Category & Skill Guide](../how-to/category-skills.md) - Delegation system and combinations

### Component Reference
- [Agents](../reference/agents.md) - AI agents and capabilities
- [Tools](../reference/tools.md) - Available tools and usage
- [Lifecycle Hooks](../reference/lifecycle-hooks.md) - Hook system and events
- [Modes](../reference/modes.md) - Operating modes and activation
