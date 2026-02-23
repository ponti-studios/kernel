# Data Model: Plugin to Builtin Migration

## Components

### Command Template

```typescript
interface CommandTemplate {
  name: string;           // Command name (e.g., "plan_review")
  description: string;    // Human-readable description
  argumentHint?: string;  // Hint for arguments
  template: string;       // The prompt template body
}
```

### Skill Definition

```typescript
interface SkillDefinition {
  name: string;           // Skill name (kebab-case)
  description: string;    // Third-person description
  references?: string[];  // Optional reference files
  assets?: string[];      // Optional asset files
}
```

## Migration Mapping

### Commands: 21 files → 21 TypeScript templates

| Source File | Target Template | Frontmatter Fields |
|-------------|-----------------|-------------------|
| plan_review.md | `PLAN_REVIEW_TEMPLATE` | name, description, argument-hint |
| changelog.md | `CHANGELOG_TEMPLATE` | name, description |
| create-agent-skill.md | `CREATE_AGENT_SKILL_TEMPLATE` | name, description |
| deepen-plan.md | `DEEPEN_PLAN_TEMPLATE` | name, description, argument-hint |
| deploy-docs.md | `DEPLOY_DOCS_TEMPLATE` | name, description |
| feature-video.md | `FEATURE_VIDEO_TEMPLATE` | name, description, argument-hint |
| generate_command.md | `GENERATE_COMMAND_TEMPLATE` | name, description |
| heal-skill.md | `HEAL_SKILL_TEMPLATE` | name, description |
| lfg.md | `LFG_TEMPLATE` | name, description |
| quiz-me.md | `QUIZ_ME_TEMPLATE` | name, description |
| release-docs.md | `RELEASE_DOCS_TEMPLATE` | name, description |
| report-bug.md | `REPORT_BUG_TEMPLATE` | name, description |
| reproduce-bug.md | `REPRODUCE_BUG_TEMPLATE` | name, description |
| resolve_parallel.md | `RESOLVE_PARALLEL_TEMPLATE` | name, description |
| resolve_pr_parallel.md | `RESOLVE_PR_PARALLEL_TEMPLATE` | name, description |
| resolve_todo_parallel.md | `RESOLVE_TODO_PARALLEL_TEMPLATE` | name, description |
| sync-tutorials.md | `SYNC_TUTORIALS_TEMPLATE` | name, description |
| teach-me.md | `TEACH_ME_TEMPLATE` | name, description |
| test-browser.md | `TEST_BROWSER_TEMPLATE` | name, description |
| triage.md | `TRIAGE_TEMPLATE` | name, description |
| xcode-test.md | `XCODE_TEST_TEMPLATE` | name, description, argument-hint |

### Workflow Commands: 5 files → 5 TypeScript templates

| Source File | Target Template |
|-------------|-----------------|
| workflows/brainstorm.md | `WORKFLOWS_BRAINSTORM_TEMPLATE` |
| workflows/compound.md | `WORKFLOWS_COMPOUND_TEMPLATE` |
| workflows/plan.md | `WORKFLOWS_PLAN_TEMPLATE` |
| workflows/review.md | `WORKFLOWS_REVIEW_TEMPLATE` |
| workflows/work.md | `WORKFLOWS_WORK_TEMPLATE` |

### Skills: 14 directories → 14 skill folders

| Source | Target | Assets |
|--------|--------|--------|
| andrew-kane-gem-writer/ | builtin-skills/andrew-kane-gem-writer/ | None |
| brainstorming/ | builtin-skills/brainstorming/ | None |
| coding-tutor/ | builtin-skills/coding-tutor/ | None |
| compound-docs/ | builtin-skills/compound-docs/ | references/, assets/ |
| create-agent-skills/ | builtin-skills/create-agent-skills/ | None |
| dhh-rails-style/ | builtin-skills/dhh-rails-style/ | None |
| dspy-ruby/ | builtin-skills/dspy-ruby/ | None |
| every-style-editor/ | builtin-skills/every-style-editor/ | None |
| file-todos/ | builtin-skills/file-todos/ | assets/ |
| frontend-design/ | builtin-skills/frontend-design/ | None |
| gemini-imagegen/ | builtin-skills/gemini-imagegen/ | None |
| git-worktree/ | builtin-skills/git-worktree/ | None |
| ralph-loop/ | builtin-skills/ralph-loop/ | None |
| rclone/ | builtin-skills/rclone/ | None |
| skill-creator/ | builtin-skills/skill-creator/ | None |

## State Transitions

### Before Migration
```
plugin/commands/*.md → ghostwire:command_name (namespace)
plugin/skills/*/ → ghostwire:skill-name (plugin loader)
```

### After Migration
```
builtin-commands/templates/*.ts → /command_name (no namespace)
builtin-skills/*/ → skill-name (builtin loader)
```

## Validation Rules

1. Command names must be unique across all builtin commands
2. Skill names must be unique across all builtin skills
3. Template strings must be valid JavaScript template literals
4. Skill SKILL.md must have valid YAML frontmatter
