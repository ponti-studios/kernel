/**
 * Template for ghostwire:workflows:create command
 *
 * Converts tasks to GitHub issues.
 * Replaces: speckit.taskstoissues.md
 */
export const SPEC_TO_ISSUES_TEMPLATE = `
## Convert Tasks to GitHub Issues: $FEATURE_NAME
**Branch**: \`$BRANCH_NAME\` | **Tasks**: [.ghostwire/specs/$BRANCH_NAME/tasks.md](../tasks.md)
---
## Task Summary
| Phase | Tasks | Converted |
|-------|-------|-----------|
| Setup | $SETUP_COUNT | $SETUP_CONVERTED |
| Foundational | $FOUNDATIONAL_COUNT | $FOUNDATIONAL_CONVERTED |
$USER_STORY_SUMMARY
| Polish | $POLISH_COUNT | $POLISH_CONVERTED |
**Total**: $TOTAL_TASKS tasks → $TOTAL_ISSUES issues
---
## Issue Creation Plan
$ISSUE_CREATION_PLAN
---
## GitHub CLI Commands
\`\`\`bash
# Create milestone for feature
gh api repos/$REPO/milestones -f title="$MILESTONE_NAME" -f state=open
# Create issues for each task
$GH_COMMANDS
\`\`\`
---
## Issue Labels
Recommended labels:
- \`feature\` - All issues
- \`$BRANCH_NAME\` - Feature-specific tracking
- \`priority:P1\`, \`priority:P2\`, \`priority:P3\` - By user story priority
- \`phase:setup\`, \`phase:foundational\`, \`phase:us1\`, etc.
---
## After Creation
1. Review created issues in GitHub
2. Assign team members
3. Set due dates if applicable
4. Link issues to milestone
5. Update tasks.md with issue numbers
---
**Command**: Execute the GitHub CLI commands above to create all issues
`;
/**
 * Task to issue conversion
 */
export interface TaskToIssue {
  taskId: string;
  description: string;
  story?: string;
  phase: string;
  priority: string;
  ghCommand: string;
}
/**
 * Generate GitHub CLI command for issue creation
 */
export function generateGhCommand(
  repo: string,
  title: string,
  body: string,
  labels: string[],
  milestone?: string,
): string {
  const labelsStr = labels.map((l) => `-f labels[]=${l}`).join(" ");
  const milestoneStr = milestone ? `-f milestone=${milestone}` : "";
  // Escape special characters in title and body
  const escapedTitle = title.replace(/"/g, '\\"');
  const escapedBody = body.replace(/"/g, '\\"').replace(/\n/g, "\\n");
  return `gh api repos/${repo}/issues -f title="${escapedTitle}" -f body="${escapedBody}" ${labelsStr} ${milestoneStr}`;
}
/**
 * Extract tasks from tasks.md
 */
export function extractTasks(tasksContent: string): {
  phase: string;
  tasks: { id: string; description: string; story?: string }[];
}[] {
  const phases: { phase: string; tasks: { id: string; description: string; story?: string }[] }[] =
    [];
  // Match phase headers and their tasks
  const phasePattern = /## Phase (\d+): ([^\n]+)[\s\S]*?(?=## Phase \d+|$)/g;
  let match;
  while ((match = phasePattern.exec(tasksContent)) !== null) {
    const phaseNum = match[1];
    const phaseName = match[2].trim();
    const phaseContent = match[0];
    // Extract tasks from this phase
    const taskPattern = /- \[ \] (T\d+)(?: \[P\])?(?: \[(US\d+)\])? (.+)/g;
    const tasks: { id: string; description: string; story?: string }[] = [];
    let taskMatch;
    while ((taskMatch = taskPattern.exec(phaseContent)) !== null) {
      tasks.push({
        id: taskMatch[1],
        description: taskMatch[3].trim(),
        story: taskMatch[2],
      });
    }
    phases.push({
      phase: `${phaseNum}: ${phaseName}`,
      tasks,
    });
  }
  return phases;
}
/**
 * Generate issue creation plan
 */
export function generateIssueCreationPlan(tasks: TaskToIssue[]): string {
  return tasks
    .map((t) => {
      const storyLabel = t.story ? ` [${t.story}]` : "";
      return `### ${t.taskId}${storyLabel}: ${t.description.substring(0, 60)}...
**Phase**: ${t.phase}  
**Priority**: ${t.priority}
\`\`\`bash
${t.ghCommand}
\`\`\``;
    })
    .join("\n\n");
}
/**
 * Generate user story summary row
 */
export function generateUserStorySummary(
  storyNum: number,
  title: string,
  taskCount: number,
): string {
  return `| User Story ${storyNum}: ${title} | ${taskCount} | 0 |`;
}
