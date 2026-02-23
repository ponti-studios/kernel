# Agents

**List of agents: [`docs/agents.yml`](../agents.yml).**

## Quick Reference

Ghostwire provides specialized AI agents organized in 6 phases:

- **Phase 1 (Orchestration)**: operator, orchestrator, planner, executor
- **Phase 2 (Code Review)**: reviewer-rails, reviewer-python, reviewer-typescript, reviewer-rails-dh, reviewer-simplicity
- **Phase 3 (Research)**: researcher-docs, researcher-learnings, researcher-practices, researcher-git, analyzer-media
- **Phase 4 (Design)**: designer-flow, designer-sync, designer-iterator, analyzer-design, designer-builder
- **Phase 5 (Advisory/Validation)**: advisor-architecture, advisor-strategy, advisor-plan, validator-audit, validator-deployment, writer-readme, writer-gem, editor-style
- **Phase 6 (Legacy)**: researcher-codebase, researcher-data

## Using Agents

### Direct Invocation
Invoke agents explicitly for specialized tasks:

```
Ask @advisor-plan to review this design and propose an architecture
Ask @researcher-data how this is implemented - why does the behavior keep changing?
Ask @researcher-codebase for the policy on this feature
Ask @analyzer-media to analyze this screenshot
```

### Background Execution
Run agents in the background while you continue working:

```
delegate_task(agent="researcher-codebase", background=true, prompt="Find auth implementations")
```

### Agent Thinking Budget
The following agents have 32k thinking budget tokens enabled by default:
- operator
- advisor-plan
- planner
- orchestrator

## Configuration

Override agent settings in your `ghostwire.json`:

```json
{
  "agents": {
    "advisor-plan": {
      "model": "opencode/kimi-k2.5",
      "temperature": 0.1
    },
    "researcher-codebase": {
      "model": "opencode/kimi-k2.5"
    },
    "analyzer-media": {
      "disable": true
    }
  }
}
```

## Agent Model Resolution

Ghostwire automatically selects the best available model for each agent based on your configured providers. The resolution follows this priority:

1. User-configured model in `ghostwire.json`
2. Fallback chain (tries each provider in order)
3. Default model for available providers

Run `opencode models` to see available models in your environment.

For detailed agent configurations and model fallback chains, see [`docs/agents.yml`](../agents.yml).
