export const UTIL_CLEAN_TEMPLATE = `
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
<clean-context>
$ARGUMENTS
</clean-context>
`;
