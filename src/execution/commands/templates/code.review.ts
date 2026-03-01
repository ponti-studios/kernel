import { renderProfileUsage } from "../profiles";

export const CODE_REVIEW_TEMPLATE = `# Code:Review Command
Conduct comprehensive code reviews leveraging multiple specialist agents.
## Review Types
- **Architecture Review** - High-level design and patterns
- **Security Review** - Vulnerability and security best practices
- **Performance Review** - Optimization opportunities
- **Style Review** - Code quality and consistency
- **Complexity Review** - Simplification opportunities
- **Test Coverage Review** - Testing strategy adequacy
## Key Profiles & Tasks
${renderProfileUsage([
  "reviewer_rails",
  "reviewer_python",
  "reviewer_typescript",
  "reviewer_rails_dh",
  "reviewer_security",
  "oracle_performance",
  "reviewer_simplicity",
])}
## Output
- Structured review comments
- Priority-ordered issues
- Actionable suggestions
- References to relevant patterns or best practices
<code-context>
$ARGUMENTS
</code-context>`;
