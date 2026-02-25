# spec-to-issues

Source: spec/to-issues.ts

<command-instruction>
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
</command-instruction>
