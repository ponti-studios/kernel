export const GIT_BRANCH_TEMPLATE = `
# Git:Branch Command
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
<branch-context>
$ARGUMENTS
</branch-context>
`;
