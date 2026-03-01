export const GIT_CLEANUP_TEMPLATE = `
# Git:Cleanup Command
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
<cleanup-options>
$ARGUMENTS
</cleanup-options>
`;
