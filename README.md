# Ghostwire

Ghostwire is an agent orchestration system for software production, not a prompt wrapper. 

The objective is deterministic throughput under bounded context: decompose work, route subtasks to specialized agents, validate outputs against code reality, and converge on completed artifacts. 

We optimize for measurable completion probability, low entropy execution, and strict interface contracts between planning, delegation, tooling, and verification.

Our design philosophy:
- *Kanso (simplicity)* - removes rhetorical clutter; only operationally relevant information remains. 
- *Ma (negative space)* is intentional structure: spacing separates concerns and highlights high-value signal. 
- *Shibui (understated)* rejects adjective-driven persuasion in favor of factual authority and logical traceability. 
- *Wabi-sabi (imperfection)* prioritizes brutalist truth over polished ambiguity, so functional clarity consistently outranks stylistic performance.

## Product Surface

- Type: OpenCode plugin + CLI
- Role: Multi-agent orchestration, workflow execution, deterministic code operations
- Runtime focus: Bun + TypeScript
- Core execution style: task graph + category delegation + validation loop

## Quick Start

```bash
bunx ghostwire install
```

Then use:

```text
ultrawork: <task>
```

or explicit commands:

```bash
/ghostwire:workflows:create
/ghostwire:workflows:execute
/ghostwire:workflows:status
/ghostwire:workflows:complete
/ghostwire:work:loop
/ghostwire:work:cancel
```

## Canonical Workflow

1. `workflows:create`: transform objective into structured task graph.
2. Delegation engine: map task categories to specialist agents.
3. `workflows:execute` or `work:loop`: execute by dependency wave.
4. `workflows:status`: track completion state and blockers.
5. `workflows:complete`: finalize artifacts and close workflow.

## Architecture (Compressed)

- Orchestration: `src/orchestration/` (agents + lifecycle hooks)
- Execution: `src/execution/` (features + tools + task queue)
- Integration: `src/integration/` (shared infra + MCP)
- Platform: `src/platform/` (config, schemas, compatibility)
- CLI: `src/cli/`

## Deterministic Guarantees

- Structured plans with dependency metadata (`blocks`, `blockedBy`, `wave`)
- Category-driven delegation (`visual-engineering`, `ultrabrain`, `quick`, `deep`, `artistry`, `writing`)
- Validation gates for agent/command references and config schema
- Tool-mediated code operations over ad-hoc text edits where possible

## Configuration

Primary configuration reference:

- [docs/reference/configurations.md](docs/configurations.md)

Command naming reference:

- [docs/reference/commands.md](docs/commands.md)

## Documentation (Canonical)

- [docs/README.md](docs/README.md)
- [docs/agents.yml](docs/agents.yml)
- [docs/hooks.yml](docs/hooks.yml)
- [docs/tools.yml](docs/tools.yml)
- [docs/features.yml](docs/features.yml)
- [docs/commands.yml](docs/commands.yml)
- [docs/skills.yml](docs/skills.yml)
- [docs/reference/services-models.yaml](docs/reference/services-models.yaml)

## Development

```bash
bun install
bun test
bun run typecheck
bun run build
```

## License

SUL-1.0
