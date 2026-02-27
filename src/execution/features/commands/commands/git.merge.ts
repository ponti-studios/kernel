import type { CommandDefinition } from "../../claude-code-command-loader";
export const NAME = "ghostwire:git:merge";
export const DESCRIPTION = "Merge branches safely with conflict resolution";
export const TEMPLATE = `
# Git:Merge Command
Merge branches safely with conflict resolution and validation.
## Process
1. **Pre-Merge Validation** - Check branch state and conflicts
2. **Conflict Detection** - Identify merge conflicts early
3. **Merge Strategy** - Choose appropriate merge approach
4. **Conflict Resolution** - Resolve conflicts systematically
5. **Post-Merge Verification** - Validate tests and functionality
## Merge Strategies
- **Fast-Forward** - Clean linear history when possible
- **Squash** - Combine commits into single logical unit
- **Rebase** - Rebase branch for clean history
- **Three-Way** - Standard merge with conflict resolution
## Features
- Automatic conflict detection
- Interactive conflict resolution
- Run tests before merge
- Preserve commit history
- Rollback on validation failure
<merge-context>
$ARGUMENTS
</merge-context>
`;
export const ARGUMENT_HINT = "[branch-name] [--strategy=fast-forward|squash|rebase]";
export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
