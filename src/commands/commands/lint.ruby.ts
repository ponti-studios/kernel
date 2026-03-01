import type { CommandDefinition } from "../../claude-code-command-loader";
export const NAME = "ghostwire:lint:ruby";
export const DESCRIPTION = "Run linting and code quality checks on Ruby and ERB files";
export const TEMPLATE = `
# Lint:Ruby Command
Run linting and code quality checks on Ruby and ERB files. Run before pushing to origin.
## Linters
### Ruby - StandardRB
Check Ruby code style:
\`\`\`bash
bundle exec standardrb
\`\`\`
Auto-fix Ruby style issues:
\`\`\`bash
bundle exec standardrb --fix
\`\`\`
### ERB - ERBLint
Check ERB templates:
\`\`\`bash
bundle exec erblint --lint-all
\`\`\`
Auto-fix ERB issues:
\`\`\`bash
bundle exec erblint --lint-all --autocorrect
\`\`\`
### Security - Brakeman
Check for security vulnerabilities:
\`\`\`bash
bin/brakeman
\`\`\`
## Workflow
1. **Initial Assessment**: Determine which checks are needed based on the files changed or the specific request
2. **Execute Appropriate Tools**: Run the appropriate linters based on file types
3. **Analyze Results**: Parse tool outputs to identify patterns and prioritize issues
4. **Take Action**: Commit fixes with \`style: linting\`
## File Types
- **.rb files**: Use StandardRB
- **.erb files**: Use ERBLint
- **Security check**: Use Brakeman
## Usage
Run all checks:
\`\`\`bash
bundle exec standardrb && bundle exec erblint --lint-all && bin/brakeman
\`\`\`
Auto-fix and commit:
\`\`\`bash
bundle exec standardrb --fix
bundle exec erblint --lint-all --autocorrect
git add -A
git commit -m "style: linting fixes"
\`\`\`
<user-request>
$ARGUMENTS
</user-request>`;
export const ARGUMENT_HINT = "[file-path or --all]";
export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
