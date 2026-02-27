import type { CommandDefinition } from "../../claude-code-command-loader";
export const NAME = "ghostwire:code:format";
export const DESCRIPTION = "Apply consistent formatting and style standards";
export const TEMPLATE = `
# Code:Format Command
Apply consistent formatting and style standards across codebase.
## Process
1. **Config Review** - Verify formatting rules (prettier, eslint, rustfmt, etc.)
2. **Apply Formatter** - Run format tools across specified scope
3. **Review Changes** - Check formatted output for correctness
4. **Commit** - Create formatting-only commit with clear message
5. **Update CI** - Ensure formatting checks pass
## Features
- Batch format multiple files or entire directories
- Apply language-specific formatters
- Integrate with pre-commit hooks
- Generate formatting-only commits for clean history
## Rules
- Formatting changes should be separate from functional changes
- Always get team consensus on formatting rules before bulk formatting
- Don't mix formatting with functional changes
<format-scope>
$ARGUMENTS
</format-scope>
`;
export const ARGUMENT_HINT = "[path-to-format] [--dry-run]";
export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
