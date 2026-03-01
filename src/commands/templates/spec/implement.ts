/**
 * Template for ghostwire:workflows:work command
 *
 * Executes the implementation plan by processing all tasks from tasks.md.
 * Replaces: speckit.implement.md logic
 */
export const SPEC_IMPLEMENT_TEMPLATE = `
## Implementation: $FEATURE_NAME
**Branch**: \`$BRANCH_NAME\` | **Plan**: [docs/specs/$BRANCH_NAME/plan.md](../plan.md) | **Tasks**: [docs/specs/$BRANCH_NAME/tasks.md](../tasks.md)
---
## Pre-Implementation Checklist
### Checklist Status
$CHECKLIST_STATUS_TABLE
$CHECKLIST_WARNING
### Prerequisites Loaded
✅ **tasks.md**: $TASKS_LOADED tasks identified  
✅ **plan.md**: Tech stack: $TECH_STACK  
$OPTIONAL_PREREQS
### Project Setup Verification
$IGNORE_FILES_STATUS
---
## Implementation Execution
### Phase 1: Setup
$PHASE_1_TASKS
### Phase 2: Foundational
$PHASE_2_TASKS
### Phase 3+: User Stories
$USER_STORY_IMPLEMENTATIONS
### Final Phase: Polish
$POLISH_TASKS
---
## Progress Tracking
$PROGRESS_TABLE
---
## Completion Validation
✅ All required tasks completed: $COMPLETED_COUNT/$TOTAL_COUNT  
✅ Features match original specification  
✅ Tests pass: $TESTS_PASSING/$TESTS_TOTAL  
✅ Implementation follows technical plan  
**Status**: $IMPLEMENTATION_STATUS
---
**Next**: Run \`/ghostwire:workflows:create\` to validate consistency across all artifacts
`;
/**
 * Checklist status table generator
 */
export function generateChecklistStatusTable(
  checklists: { name: string; total: number; completed: number }[],
): string {
  const rows = checklists.map((c) => {
    const status = c.completed === c.total ? "✓ PASS" : "✗ FAIL";
    const incomplete = c.total - c.completed;
    return `| ${c.name} | ${c.total} | ${c.completed} | ${incomplete} | ${status} |`;
  });
  return `| Checklist | Total | Completed | Incomplete | Status |
|-----------|-------|-----------|------------|--------|
${rows.join("\n")}`;
}
/**
 * Progress table generator
 */
export function generateProgressTable(
  tasks: {
    id: string;
    description: string;
    status: "pending" | "in-progress" | "completed" | "failed";
  }[],
): string {
  const rows = tasks.map((t) => {
    const statusIcon = {
      pending: "○",
      "in-progress": "~",
      completed: "✓",
      failed: "✗",
    }[t.status];
    return `| ${t.id} | ${t.description.substring(0, 50)}... | ${statusIcon} ${t.status} |`;
  });
  return `| Task ID | Description | Status |
|---------|-------------|--------|
${rows.join("\n")}`;
}
/**
 * Phase execution instructions
 */
export const PHASE_EXECUTION_RULES = `
## Phase Execution Rules
### Setup Phase
- Initialize project structure
- Install dependencies
- Configure tooling
- **Validation**: Project builds successfully
### Foundational Phase
- Create core infrastructure
- Setup database/schemas
- Implement shared utilities
- **Validation**: Foundation supports user stories
- **CRITICAL**: Must complete before any user story work
### User Story Phase
- **TDD Approach**: Tests first, ensure they FAIL
- Models → Services → Endpoints/UI
- Integration within story
- **Validation**: Story independently testable
- **Checkpoint**: Stop and validate before next story
### Polish Phase
- Documentation
- Code cleanup
- Performance optimization
- Security review
- **Validation**: All tests pass, code quality gates met
`;
/**
 * Task execution priority
 */
export function prioritizeTasks(tasks: string[]): { sequential: string[]; parallel: string[] } {
  const sequential: string[] = [];
  const parallel: string[] = [];
  for (const task of tasks) {
    if (task.includes("[P]") || task.includes("[p]")) {
      parallel.push(task);
    } else {
      sequential.push(task);
    }
  }
  return { sequential, parallel };
}
/**
 * Ignore file patterns by technology
 */
export const IGNORE_PATTERNS: Record<string, string[]> = {
  node: ["node_modules/", "dist/", "build/", "*.log", ".env*", ".DS_Store"],
  python: ["__pycache__/", "*.pyc", ".venv/", "venv/", "dist/", "*.egg-info/", ".DS_Store"],
  java: ["target/", "*.class", "*.jar", ".gradle/", "build/", ".DS_Store"],
  dotnet: ["bin/", "obj/", "*.user", "*.suo", "packages/", ".DS_Store"],
  go: ["*.exe", "*.test", "vendor/", "*.out", ".DS_Store"],
  ruby: [".bundle/", "log/", "tmp/", "*.gem", "vendor/bundle/", ".DS_Store"],
  php: ["vendor/", "*.log", "*.cache", "*.env", ".DS_Store"],
  rust: ["target/", "debug/", "release/", "*.rs.bk", ".DS_Store"],
  universal: [".DS_Store", "Thumbs.db", "*.tmp", "*.swp", ".vscode/", ".idea/"],
};
/**
 * Detect project technology from files
 */
export function detectTechnology(files: string[]): string[] {
  const techs: string[] = [];
  if (files.some((f) => f.includes("package.json"))) techs.push("node");
  if (files.some((f) => f.includes("requirements.txt") || f.includes("setup.py")))
    techs.push("python");
  if (files.some((f) => f.includes("pom.xml") || f.includes("build.gradle"))) techs.push("java");
  if (files.some((f) => f.includes(".csproj") || f.includes(".sln"))) techs.push("dotnet");
  if (files.some((f) => f.includes("go.mod"))) techs.push("go");
  if (files.some((f) => f.includes("Gemfile"))) techs.push("ruby");
  if (files.some((f) => f.includes("composer.json"))) techs.push("php");
  if (files.some((f) => f.includes("Cargo.toml"))) techs.push("rust");
  return techs.length > 0 ? techs : ["universal"];
}
