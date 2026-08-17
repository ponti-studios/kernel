# Design-System Crosswalk

Use this table as the starting point for role-based mappings. Confirm exact
values and states against the current external system before implementation.

| Shared role | Material 3 | Apple HIG | Fluent 2 | Carbon | shadcn/ui / Radix |
| --- | --- | --- | --- | --- | --- |
| Primary action | primary | tint/accent | brand primary | interactive | primary |
| Destructive | error | destructive | danger | support error | destructive |
| Page surface | surface | system background | neutral background | layer | background |
| Raised surface | surface container | secondary system background | neutral layer | layer 01 | card |
| Primary text | on surface | label | foreground | text primary | foreground |
| Secondary text | on surface variant | secondary label | secondary foreground | text secondary | muted foreground |
| Focus | focus indicator | focus ring | focus stroke | focus | ring |
| Success | primary/support success | green semantic | success | support success | success |
| Warning | tertiary/support warning | orange semantic | warning | support warning | warning |

Do not treat this table as a value conversion. Complete the six-axis mapping in
`interop-protocol.md`, then verify contrast and all required component states.
