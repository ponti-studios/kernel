export const GIT_SMART_COMMIT_TEMPLATE = `# Git:Smart-Commit Command

Generate well-structured commits that follow project conventions and tell a clear story.

## Process

1. **Stage Review** - Understand what changes are staged
2. **Change Analysis** - Categorize changes (feature, fix, refactor, test, docs)
3. **Conventional Commit** - Generate commit message following conventional commits
4. **Message Validation** - Ensure message clarity and completeness
5. **Commit Creation** - Create the commit with proper formatting

## Commit Format

Uses Conventional Commits standard:
\`\`\`
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

- **type:** feat, fix, refactor, test, docs, chore, perf, ci
- **scope:** Affected module or component
- **subject:** Clear, imperative description (max 50 chars)
- **body:** Detailed explanation of what and why (max 72 chars per line)
- **footer:** References and breaking changes

## Key Features

- Detects commit type from code changes
- Validates message against project conventions
- References related issues
- Notes breaking changes when applicable
- Provides commit history coherence
`;

export const GIT_BRANCH_TEMPLATE = `# Git:Branch Command

Create and manage feature branches following project naming conventions.

## Process

1. **Branch Planning** - Understand the feature or fix
2. **Name Generation** - Create conventional branch name
3. **Base Selection** - Choose appropriate base branch
4. **Branch Creation** - Create and switch to new branch
5. **Setup** - Configure tracking and any branch-specific settings

## Branch Naming

Follows convention: \`<type>/<scope>-<description>\`

- **type:** feature, fix, refactor, docs, test
- **scope:** Module or component affected
- **description:** Kebab-case, concise description

Examples:
- \`feature/auth-jwt-validation\`
- \`fix/cart-total-calculation\`
- \`refactor/api-response-handler\`

## Features

- Delete local and remote branches
- Rename branches safely
- Track remote branches
- List branches with filtering
- Cleanup stale branches
`;

export const GIT_MERGE_TEMPLATE = `# Git:Merge Command

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
`;

export const GIT_CLEANUP_TEMPLATE = `# Git:Cleanup Command

Remove stale branches and optimize repository state.

## Process

1. **Branch Analysis** - Identify candidates for cleanup
2. **Safety Verification** - Ensure branches are merged upstream
3. **Remote Cleanup** - Delete remote branches
4. **Local Cleanup** - Delete local branches
5. **Repository Maintenance** - Optimize repository

## Features

- Remove merged branches locally and remotely
- Prune remote-tracking branches
- Clean up stale branches older than N days
- Safe deletion with confirmation
- Generate cleanup report

## Safety

- Never delete branches without confirmation
- Verify branches are merged before deletion
- Preserve main/master and release branches
- Maintain branch history for reference
`;
