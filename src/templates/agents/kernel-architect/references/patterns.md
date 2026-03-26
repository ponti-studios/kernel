# Architectural Patterns Reference

Use this pack when assessing code structure and design quality.

## Patterns to Recognize

- **Layered architecture** — Clear separation of concerns (UI, business logic, data access)
- **Dependency inversion** — High-level modules should not depend on low-level modules
- **Composition over inheritance** — Prefer composable units over deep class hierarchies
- **Command/Query separation** — Reads and writes are distinct code paths
- **Agent-native patterns** — Context objects, tool boundaries, and prompt/instruction separation

## Anti-Patterns to Flag

- Circular dependencies between modules
- Fat controllers or god objects
- Tight coupling between unrelated domains
- Business logic leaking into data access or UI layers
- Missing abstraction boundaries at integration points

## Output

- Named pattern or anti-pattern
- Location (file and line range)
- Concrete recommendation with rationale
