import type { CommandDefinition } from "../../claude-code-command-loader";
export const NAME = "ghostwire:util:doctor";
export const DESCRIPTION = "Diagnose project health and configuration";
export const TEMPLATE = `
# Util:Doctor Command
Diagnose project health and identify configuration issues.
## Checks
- **Dependencies** - Verify all dependencies installed and compatible
- **Configuration** - Validate configuration files
- **Environment** - Check required environment variables
- **Tools** - Verify required tools installed (Node, Python, etc.)
- **Git** - Check git status and history integrity
- **Permissions** - Validate file permissions
- **Disk Space** - Check available disk space
- **Network** - Test required network connectivity
## Features
- Comprehensive health report
- Actionable suggestions for issues found
- One-command fixes for common problems
- Configuration validation
- Dependency version checking
- Performance diagnostics
## Output
- Health status (✓ healthy, ⚠ warnings, ✗ errors)
- Detailed report of issues found
- Suggested fixes
- Commands to run for automatic fixes
<doctor-context>
$ARGUMENTS
</doctor-context>
`;
export const ARGUMENT_HINT = "[--fix] [--verbose]";
export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
