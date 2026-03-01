import type { CommandDefinition } from "../../claude-code-command-loader";
export const NAME = "ghostwire:git:smart-commit";
export const DESCRIPTION = "Generate well-structured commits following conventions";
export const TEMPLATE = `
# Git:Smart-Commit Command
Generate well-structured commits that follow project conventions and tell a clear story.
## Process
1. **Stage Review** - Understand what changes are staged
2. **Change Analysis** - Categorize changes (feature, fix, refactor, test, docs)
3. **Conventional Commit** - Generate commit message following conventional commits
4. **Message Validation** - Ensure message clarity and completeness
5. **Commit Creation** - Create the commit with proper formatting
## Commit Format
Uses Conventional Commits standard:
\`\`\`
<type>(<scope>): <subject>
<body>
<footer>
\`\`\`
- **type:** feat, fix, refactor, test, docs, chore, perf, ci
- **scope:** Affected module or component
- **subject:** Clear, imperative description (max 50 chars)
- **body:** Detailed explanation of what and why (max 72 chars per line)
- **footer:** References and breaking changes
## Key Features
- Detects commit type from code changes
- Validates message against project conventions
- References related issues
- Notes breaking changes when applicable
- Provides commit history coherence
<commit-context>
$ARGUMENTS
</commit-context>
`;
export const ARGUMENT_HINT = '[--message="custom message"]';
export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
