# util

Source: util.ts

<command-instruction>
# Util:Clean Command

Remove build artifacts, caches, temporary files, and other non-essential files.

## What Gets Cleaned

- **Build outputs** - dist/, build/, .next/, target/ directories
- **Package caches** - node_modules/, .bun/, venv/, .cargo/ directories
- **IDE artifacts** - .vscode/, .idea/, *.swp files
- **OS artifacts** - .DS_Store, Thumbs.db
- **Logs** - *.log, logs/ directory
- **Temporary files** - tmp/, temp/ directories
- **Generated files** - Coverage reports, build metadata

## Levels

- **Light** - Only OS and IDE artifacts
- **Standard** - Build outputs and caches (safe to remove)
- **Deep** - All non-essential including lockfiles
- **Aggressive** - Everything except source code and config

## Safety Features

- Preview what will be deleted before confirmation
- Preserve important files and directories
- Never delete source code or git history
- Option to dry-run before actual deletion
- Backup option for deleted files
</command-instruction>

<clean-context>
$ARGUMENTS
</clean-context>

---

<command-instruction>
# Util:Backup Command

Create backups of project state and important files.

## Backup Types

- **Project Snapshot** - Full project state at point in time
- **Configuration** - Backup .env, config files
- **Database** - Database dumps (if applicable)
- **Selective** - Backup specific directories or file types

## Features

- Automatic compression (.tar.gz, .zip)
- Timestamped backup names
- Metadata and manifest creation
- Encryption option
- Multiple backup locations
- Automatic cleanup of old backups

## Output

- Compressed backup file
- Manifest with contents list
- Hash for integrity verification
- Restore instructions
</command-instruction>

<backup-context>
$ARGUMENTS
</backup-context>

---

<command-instruction>
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
</command-instruction>

<restore-context>
$ARGUMENTS
</restore-context>

---

<command-instruction>
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
</command-instruction>

<doctor-context>
$ARGUMENTS
</doctor-context>
