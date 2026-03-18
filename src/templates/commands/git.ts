import type { CommandTemplate } from '../../core/templates/types.js';

export function getGitSmartCommitCommandTemplate(): CommandTemplate {
  return {
    name: 'Git Smart Commit',
    description: 'Create well-structured commits with clear messages',
    category: 'Git',
    tags: ['git', 'commits', 'version-control'],
    content: `# Git Smart Commit

Create well-structured commits with clear, conventional messages.

## When to Use

- Before pushing changes
- When preparing a PR
- After completing a logical unit of work

## Process

1. **Review Changes**
   
   Check what files have changed and what they contain

2. **Stage Strategically**
   
   Group related changes into logical commits

3. **Write Messages**
   
   Use conventional commit format:
   - type: description
   - Body explaining what and why

4. **Verify**
   
   Review the commit before finalizing

## Commit Message Format

\`\`\`
type: brief description

Detailed explanation of what was done and why.
Include context that helps future developers.
\`\`\`

## Types

- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance
`,
  };
}

export function getGitBranchCommandTemplate(): CommandTemplate {
  return {
    name: 'Git Branch',
    description: 'Create properly named feature branches',
    category: 'Git',
    tags: ['git', 'branching', 'workflow'],
    content: `# Git Branch

Create properly named feature branches.

## When to Use

- Starting new work
- Creating a PR
- Working on a feature or fix

## Branch Naming

Use descriptive names with type prefix:
- feature/user-authentication
- fix/login-redirect-bug
- docs/api-documentation
- refactor/payment-processing

## Process

1. **Update Main**
   
   Pull latest main branch

2. **Create Branch**
   
   Checkout new branch with descriptive name

3. **Verify**
   
   Ensure you're on the right branch
`,
  };
}

export function getGitCleanupCommandTemplate(): CommandTemplate {
  return {
    name: 'Git Cleanup',
    description: 'Remove stale branches and clean up repository',
    category: 'Git',
    tags: ['git', 'cleanup', 'maintenance'],
    content: `# Git Cleanup

Remove stale branches and clean up repository.

## When to Use

- After merging a PR
- Periodically to keep repo clean
- Before releases

## Process

1. **Identify Stale Branches**
   
   Find branches merged or deleted remotely

2. **Review Before Deleting**
   
   Ensure branch is no longer needed

3. **Delete Safely**
   
   Remove both local and remote branches

4. **Clean Up**
   
   Prune remote tracking branches
`,
  };
}

export function getGitMergeCommandTemplate(): CommandTemplate {
  return {
    name: 'Git Merge',
    description: 'Safely merge branches with conflict resolution',
    category: 'Git',
    tags: ['git', 'merge', 'conflict'],
    content: `# Git Merge

Safely merge branches with conflict resolution.

## When to Use

- Merging feature branches
- Integrating changes from main
- Before releases

## Process

1. **Update Target**
   
   Pull latest target branch

2. **Merge**
   
   Attempt merge, handle conflicts if any

3. **Resolve Conflicts**
   
   - Review conflicting files
   - Choose resolution strategy
   - Mark as resolved

4. **Complete Merge**
   
   Commit merge and verify tests pass

## Conflict Resolution

- Understand both changes
- Choose appropriate resolution
- Test after resolving
`,
  };
}
