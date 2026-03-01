export const UTIL_DOCTOR_TEMPLATE = `
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
