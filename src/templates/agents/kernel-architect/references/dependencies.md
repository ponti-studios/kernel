# Dependency Analysis Reference

Use this pack when evaluating the health of the dependency graph.

## Focus Areas

- **Circular dependencies** — Modules that directly or transitively depend on each other
- **Coupling** — How many modules depend on a given module (fan-in) vs how many it depends on (fan-out)
- **Layering violations** — Infrastructure depending on application logic, or vice versa
- **Third-party risk** — Unmaintained, over-broad, or duplicated external dependencies
- **Version drift** — Mismatched versions of the same library across the project

## Output

- Dependency graph summary (high fan-in/fan-out callouts)
- Circular dependency chains (if any)
- Layering violation list with suggested fixes
- Third-party dependency concerns
