# Commands Reference (Canonical)

**Primary metadata source:** [`docs/commands.yml`](../commands.yml)

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
| Spec | `ghostwire:spec:*` | specification workflows |

## High-Use Commands

| Command | Output Class |
| --- | --- |
| `/ghostwire:workflows:plan` | plan document |
| `/ghostwire:workflows:create` | task graph |
| `/ghostwire:workflows:execute` | execution state transitions |
| `/ghostwire:workflows:status` | progress snapshot |
| `/ghostwire:workflows:complete` | completion artifact |
| `/ghostwire:work:loop` | loop session start |
| `/ghostwire:work:cancel` | loop termination |
| `/ghostwire:project:map` | project topology artifact |

## Deprecation Policy

Legacy aliases (`init-deep`, `jack-in-work`, `ultrawork-loop`, `cancel-ultrawork`, `stop-continuation`) are non-canonical and excluded from active usage guidance.

## Validation Path

- [`src/orchestration/agents/constants.ts`](../../src/orchestration/agents/constants.ts)
- [`src/platform/config/schema.ts`](../../src/platform/config/schema.ts)
- `bun run validate:agent-references`
