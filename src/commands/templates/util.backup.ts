export const UTIL_BACKUP_TEMPLATE = `
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
<backup-context>
$ARGUMENTS
</backup-context>
`;
