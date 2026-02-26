# Two-Agent Runtime Hard Cut Migration

Release type: major
Compatibility: strict break
Runtime agents: `do`, `research`

## What Changed

- Runtime agent IDs are now restricted to:
  - `do`
  - `research`
- `disabled_agents` accepts only `do` and `research`.
- `agents` overrides accept only `do`, `research` (and `build` compatibility key).
- `delegate_task.subagent_type` accepts only `do` or `research`.
- Category-driven delegation routes to `do`.
- `call_grid_agent` is no longer registered as a public runtime tool.

## Required Config Changes

Before:
```json
{
  "disabled_agents": ["planner", "researcher-codebase"],
  "agents": {
    "executor": { "model": "anthropic/claude-sonnet-4-5" },
    "advisor-plan": { "model": "openai/gpt-5.2" }
  }
}
```

After:
```json
{
  "disabled_agents": ["research"],
  "agents": {
    "do": { "model": "anthropic/claude-sonnet-4-5" },
    "research": { "model": "openai/gpt-5-mini" }
  }
}
```

## Required Tool Invocation Changes

Before:
```ts
delegate_task(subagent_type="planner", ...)
delegate_task(subagent_type="researcher-codebase", ...)
```

After:
```ts
delegate_task(subagent_type="do", ...)
delegate_task(subagent_type="research", ...)
```

## Validation Behavior

- Retired IDs now fail schema validation and `delegate_task` validation deterministically.
- Error messages include valid runtime IDs (`do`, `research`).
