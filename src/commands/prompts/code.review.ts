import type { CommandDefinition } from "../../claude-code-command-loader";
import { renderProfileUsage } from "../profiles";
export const NAME = "ghostwire:code:review";
export const DESCRIPTION = "Conduct comprehensive code reviews with specialist agents";
export const TEMPLATE = `
# Code:Review Command
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
</code-context>
`;
export const ARGUMENT_HINT = "[file-path or PR-number] [--type=architecture|security|performance]";
export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
