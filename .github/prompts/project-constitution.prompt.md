# project-constitution

Source: project/constitution.ts

<command-instruction>
---
description: "Project constitution with core principles and governance rules"
---

# $PROJECT_NAME Constitution

**Version**: $VERSION | **Ratified**: $DATE | **Last Amended**: $DATE

---

## Core Principles

### I. $PRINCIPLE_1_NAME

$PRINCIPLE_1_DESCRIPTION

### II. $PRINCIPLE_2_NAME

$PRINCIPLE_2_DESCRIPTION

### III. $PRINCIPLE_3_NAME

$PRINCIPLE_3_DESCRIPTION

### IV. $PRINCIPLE_4_NAME

$PRINCIPLE_4_DESCRIPTION

### V. $PRINCIPLE_5_NAME

$PRINCIPLE_5_DESCRIPTION

---

## Additional Constraints

$ADDITIONAL_CONSTRAINTS

---

## Development Workflow

$DEVELOPMENT_WORKFLOW

---

## Governance

$GOVERNANCE_RULES

---

## Amendment Process

To amend this constitution:

1. Document the proposed change
2. Explain rationale and impact
3. Get approval from project maintainers
4. Update version and amendment date
5. Communicate changes to all contributors

---

**Note**: This constitution supersedes all other practices. All PRs/reviews must verify compliance.
</command-instruction>

---

# Project Constitution

**Version**: 1.0.0 | **Ratified**: ${new Date().toISOString().split("T")[0]}

---

## Core Principles

### I. Library-First Architecture

Every feature starts as a standalone library.
- Libraries must be self-contained and independently testable
- Clear purpose required - no organizational-only libraries
- Prefer composition over inheritance

### II. CLI Interface

Every library exposes functionality via CLI.
- Text in/out protocol: stdin/args → stdout, errors → stderr
- Support JSON + human-readable formats
- Document all commands with examples

### III. Test-First Development (NON-NEGOTIABLE)

TDD is mandatory.
- Tests written → User approved → Tests fail → Then implement
- Red-Green-Refactor cycle strictly enforced
- No code without corresponding tests

### IV. Integration Testing

Focus on integration tests for:
- New library contract tests
- Contract changes
- Inter-service communication
- Shared schemas

### V. Observability

Text I/O ensures debuggability.
- Structured logging required
- Metrics for critical paths
- Error tracking and alerting

---

## Additional Constraints

### Technology Stack

- Language: TypeScript
- Runtime: Bun
- Testing: Built-in test runner
- Documentation: Markdown

### Quality Gates

- Type checking must pass
- All tests must pass
- Code review required
- Documentation updated

---

## Development Workflow

1. Create feature spec with /ghostwire:spec:create
2. Plan implementation with /ghostwire:spec:plan
3. Generate tasks with /ghostwire:spec:tasks
4. Implement with /ghostwire:spec:implement
5. Validate with /ghostwire:spec:analyze

---

## Governance

- All PRs must verify compliance with this constitution
- Complexity must be justified
- Use AGENTS.md for runtime development guidance
- Amendments require maintainer approval

---

**This constitution is living documentation. Update as project evolves.**
