# Commands Reference

## Identifier Format

- Command ID: `ghostwire:<domain>:<action>`
- Slash form: `/ghostwire:<domain>:<action>`

## Families

| Family | Prefix | Function |
| --- | --- | --- |
| Workflows | `ghostwire:workflows:*` | planning and execution lifecycle |
| Work Loop | `ghostwire:work:*` | loop control |
| Code | `ghostwire:code:*` | review/refactor/optimize/format |
| Git | `ghostwire:git:*` | commit/branch/merge/cleanup |
| Project | `ghostwire:project:*` | init/map/build/deploy/test |
| Docs | `ghostwire:docs:*` | documentation workflows |
| Util | `ghostwire:util:*` | maintenance utilities |

## High-Use Commands

| Command | Output Class |
| --- | --- |
| `/ghostwire:workflows:plan` | plan document |
| `/ghostwire:workflows:create` | multi-mode artifact generation (`tasks|analyze|checklist|issues`) |
| `/ghostwire:workflows:execute` | execution state transitions |
| `/ghostwire:workflows:status` | progress snapshot |
| `/ghostwire:workflows:complete` | completion artifact |
| `/ghostwire:work:loop` | loop session start |
| `/ghostwire:work:cancel` | loop termination |
| `/ghostwire:project:map` | project topology artifact |

## Removed Commands

`ghostwire:spec:*` aliases have been removed. Use `ghostwire:workflows:*` directly.

## CLI Export

Use `ghostwire export` to generate host-native artifacts for Copilot and Codex.

Examples:

- `ghostwire export --target copilot`
- `ghostwire export --target codex`
- `ghostwire export --target all --groups instructions,prompts --strict --manifest`

See [Export Reference](../export.md) for artifact topology and validation rules.

## Deprecation Policy

Legacy aliases (`init-deep`, `jack-in-work`, `ultrawork-loop`, `cancel-ultrawork`, `stop-continuation`) are non-canonical and excluded from active usage guidance.

## Validation Path

- [`src/orchestration/agents/constants.ts`](../../src/orchestration/agents/constants.ts)
- [`src/platform/config/schema.ts`](../../src/platform/config/schema.ts)
- `bun run validate:agent-references`
