/**
 * Template for ghostwire:project:constitution command
 *
 * Creates or updates project constitution with core principles.
 * Replaces: speckit.constitution.md + constitution-template.md
 */
export const PROJECT_CONSTITUTION_TEMPLATE = `
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
`;
/**
 * Default constitution for new projects
 */
export const DEFAULT_CONSTITUTION = `# Project Constitution
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
1. Plan implementation with /ghostwire:workflows:plan
2. Generate tasks with /ghostwire:workflows:create --mode tasks
3. Validate consistency with /ghostwire:workflows:create --mode analyze
4. Generate checklists with /ghostwire:workflows:create --mode checklist
5. Implement with /ghostwire:workflows:work
---
## Governance
- All PRs must verify compliance with this constitution
- Complexity must be justified
- Use AGENTS.md for runtime development guidance
- Amendments require maintainer approval
---
**This constitution is living documentation. Update as project evolves.**
`;
/**
 * Constitution principles interface
 */
export interface ConstitutionPrinciples {
  libraryFirst: boolean;
  cliInterface: boolean;
  testFirst: boolean;
  integrationTesting: boolean;
  observability: boolean;
}
/**
 * Validate project against constitution
 */
export function validateAgainstConstitution(
  constitution: string,
  projectFiles: string[],
): { compliant: boolean; violations: string[] } {
  const violations: string[] = [];
  // Check for test files if test-first principle exists
  if (constitution.includes("Test-First") || constitution.includes("TDD")) {
    const hasTests = projectFiles.some(
      (f) => f.includes(".test.") || f.includes(".spec.") || f.includes("/tests/"),
    );
    if (!hasTests) {
      violations.push("No test files found - violates Test-First principle");
    }
  }
  // Check for CLI exposure if CLI principle exists
  if (constitution.includes("CLI Interface")) {
    const hasCli = projectFiles.some(
      (f) => f.includes("cli.") || f.includes("command.") || f.includes("/cli/"),
    );
    if (!hasCli) {
      violations.push("No CLI interface found - violates CLI Interface principle");
    }
  }
  return {
    compliant: violations.length === 0,
    violations,
  };
}
/**
 * Get constitution file path
 */
export function getConstitutionPath(projectRoot: string): string {
  return `${projectRoot}/.ghostwire/constitution.md`;
}
