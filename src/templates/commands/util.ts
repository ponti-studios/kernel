import type { CommandTemplate } from '../../core/templates/types.js';

export function getUtilBackupCommandTemplate(): CommandTemplate {
  return {
    name: 'Util Backup',
    description: 'Create backup of project files',
    category: 'Utility',
    tags: ['backup', 'safety', 'restore'],
    content: `# Util Backup

Create backup of project files.

## When to Use

- Before major changes
- Before migrations
- As part of deployment process

## Process

1. **Identify Files**
   - Source code
   - Configuration
   - Data files
   - Environment variables

2. **Choose Destination**
   - Local backup directory
   - Cloud storage
   - External drive

3. **Create Backup**
   - Compress if needed
   - Include timestamp
   - Verify integrity

4. **Document**
   - What was backed up
   - Location
   - Restore instructions
`,
  };
}

export function getUtilCleanCommandTemplate(): CommandTemplate {
  return {
    name: 'Util Clean',
    description: 'Clean up temporary and generated files',
    category: 'Utility',
    tags: ['cleanup', 'maintenance', 'temp'],
    content: `# Util Clean

Clean up temporary and generated files.

## What to Clean

- Build artifacts (dist/, build/)
- Cache files (.cache/, node_modules/.cache)
- Temporary files (*.tmp, *.log)
- IDE files (.idea/, *.swp)
- Dependency caches

## Process

1. **Identify Targets**
   - Find temporary files
   - Find generated files
   - Find caches

2. **Preview**
   - List files to delete
   - Check file sizes
   - Verify safe to delete

3. **Clean**
   - Remove identified files
   - Preserve important data

4. **Verify**
   - Build still works
   - Tests still pass
`,
  };
}

export function getUtilDoctorCommandTemplate(): CommandTemplate {
  return {
    name: 'Util Doctor',
    description: 'Diagnose project health issues',
    category: 'Utility',
    tags: ['diagnostic', 'health', 'troubleshooting'],
    content: `# Util Doctor

Diagnose project health issues.

## Diagnostics to Run

### Environment
- Node/Python version
- Package manager
- Environment variables

### Dependencies
- Outdated packages
- Security vulnerabilities
- Unused dependencies

### Code Quality
- Lint errors
- Type errors
- Test coverage

### Build
- Build success
- Bundle size
- Performance

## Process

1. Run diagnostics
2. Analyze results
3. Identify issues
4. Recommend fixes
5. Apply fixes if requested
`,
  };
}

export function getUtilRestoreCommandTemplate(): CommandTemplate {
  return {
    name: 'Util Restore',
    description: 'Restore project from backup',
    category: 'Utility',
    tags: ['restore', 'recovery', 'backup'],
    content: `# Util Restore

Restore project from backup.

## When to Use

- After failed deployment
- After data loss
- Rolling back changes

## Process

1. **Locate Backup**
   - Find backup location
   - Verify backup integrity

2. **Prepare Environment**
   - Stop running processes
   - Create current state backup

3. **Restore**
   - Extract files
   - Restore permissions
   - Verify integrity

4. **Verify**
   - Run tests
   - Check functionality
   - Verify data integrity
`,
  };
}
