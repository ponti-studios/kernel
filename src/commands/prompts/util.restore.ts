import type { CommandDefinition } from "../../claude-code-command-loader";
export const NAME = "ghostwire:util:restore";
export const DESCRIPTION = "Restore project from backup";
export const TEMPLATE = `
# Util:Restore Command
Restore project from backup or specific point in time.
## Restore Options
- **Latest Backup** - Restore most recent backup
- **Specific Backup** - Choose from backup history
- **Selective Restore** - Restore only certain files
- **Point in Time** - Restore to specific date/time
## Process
1. **Backup Verification** - Validate backup integrity
2. **Restore Planning** - Show what will be restored
3. **Confirmation** - Get user approval
4. **Restore Execution** - Extract and restore files
5. **Verification** - Validate restored files
## Safety
- Never overwrite without confirmation
- Backup current state before restoring old state
- Verify restore integrity
- Provide rollback option
- Log all restore operations
<restore-context>
$ARGUMENTS
</restore-context>
`;
export const ARGUMENT_HINT = "[backup-name] [--selective] [--dry-run]";
export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
