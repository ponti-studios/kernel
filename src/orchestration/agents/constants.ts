export const AGENT_DO = "do";
export const AGENT_RESEARCH = "research";

export const AGENT_PLANNER = AGENT_DO;
export const AGENT_ADVISOR_PLAN = AGENT_DO;
export const AGENT_ADVISOR_STRATEGY = AGENT_DO;
export const AGENT_ADVISOR_ARCHITECTURE = AGENT_DO;

export const AGENT_RESEARCHER_CODEBASE = AGENT_RESEARCH;
export const AGENT_RESEARCHER_DATA = AGENT_RESEARCH;
export const AGENT_RESEARCHER_DOCS = AGENT_RESEARCH;
export const AGENT_RESEARCHER_GIT = AGENT_RESEARCH;
export const AGENT_RESEARCHER_LEARNINGS = AGENT_RESEARCH;
export const AGENT_RESEARCHER_PRACTICES = AGENT_RESEARCH;
export const AGENT_RESEARCHER_REPO = AGENT_RESEARCH;

export const AGENT_REVIEWER_RAILS = AGENT_DO;
export const AGENT_REVIEWER_PYTHON = AGENT_DO;
export const AGENT_REVIEWER_TYPESCRIPT = AGENT_DO;
export const AGENT_REVIEWER_RAILS_DH = AGENT_DO;
export const AGENT_REVIEWER_SECURITY = AGENT_DO;
export const AGENT_REVIEWER_SIMPLICITY = AGENT_DO;
export const AGENT_REVIEWER_RACES = AGENT_DO;

export const AGENT_DESIGNER_BUILDER = AGENT_DO;
export const AGENT_DESIGNER_FLOW = AGENT_DO;
export const AGENT_DESIGNER_ITERATOR = AGENT_DO;
export const AGENT_DESIGNER_SYNC = AGENT_DO;

export const AGENT_VALIDATOR_AUDIT = AGENT_DO;
export const AGENT_VALIDATOR_BUGS = AGENT_DO;
export const AGENT_VALIDATOR_DEPLOYMENT = AGENT_DO;

export const AGENT_WRITER_README = AGENT_DO;
export const AGENT_WRITER_GEM = AGENT_DO;
export const AGENT_EDITOR_STYLE = AGENT_DO;

export const AGENT_OPERATOR = AGENT_DO;
export const AGENT_EXECUTOR = AGENT_DO;
export const AGENT_ORCHESTRATOR = AGENT_DO;

export const AGENT_ANALYZER_DESIGN = AGENT_RESEARCH;
export const AGENT_ANALYZER_MEDIA = AGENT_RESEARCH;
export const AGENT_ANALYZER_PATTERNS = AGENT_DO;
export const AGENT_ORACLE_PERFORMANCE = AGENT_DO;

export const AGENT_GUARDIAN_DATA = AGENT_DO;
export const AGENT_EXPERT_MIGRATIONS = AGENT_DO;
export const AGENT_RESOLVER_PR = AGENT_DO;

// Categories (for delegate_task)
export const CATEGORY_VISUAL_ENGINEERING = "visual-engineering";
export const CATEGORY_ULTRABRAIN = "ultrabrain";
export const CATEGORY_DEEP = "deep";
export const CATEGORY_ARTISTRY = "artistry";
export const CATEGORY_QUICK = "quick";
export const CATEGORY_UNSPECIFIED_LOW = "unspecified-low";
export const CATEGORY_UNSPECIFIED_HIGH = "unspecified-high";
export const CATEGORY_WRITING = "writing";

// Valid categories for validation
export const VALID_CATEGORIES = [
  CATEGORY_VISUAL_ENGINEERING,
  CATEGORY_ULTRABRAIN,
  CATEGORY_DEEP,
  CATEGORY_ARTISTRY,
  CATEGORY_QUICK,
  CATEGORY_UNSPECIFIED_LOW,
  CATEGORY_UNSPECIFIED_HIGH,
  CATEGORY_WRITING,
] as const;

export type ValidCategory = (typeof VALID_CATEGORIES)[number];

/**
 * Validate that a category is valid
 */
export function isValidCategory(category: string): category is ValidCategory {
  return VALID_CATEGORIES.includes(category as ValidCategory);
}

// Valid agent IDs for validation
export const VALID_AGENT_IDS = [AGENT_DO, AGENT_RESEARCH] as const;

export type ValidAgentId = (typeof VALID_AGENT_IDS)[number];

/**
 * Validate that an agent ID is valid
 */
export function isValidAgentId(agentId: string): agentId is ValidAgentId {
  return VALID_AGENT_IDS.includes(agentId as ValidAgentId);
}

// ============================================================================
// Command Names (from docs/commands.yml)
// ============================================================================

// Workflows commands
export const COMMAND_WORKFLOWS_PLAN = "ghostwire:workflows:plan";
export const COMMAND_WORKFLOWS_CREATE = "ghostwire:workflows:create";
export const COMMAND_WORKFLOWS_STATUS = "ghostwire:workflows:status";
export const COMMAND_WORKFLOWS_COMPLETE = "ghostwire:workflows:complete";
export const COMMAND_WORKFLOWS_BRAINSTORM = "ghostwire:workflows:brainstorm";
export const COMMAND_WORKFLOWS_COMPOUND = "ghostwire:workflows:compound";
export const COMMAND_WORKFLOWS_REVIEW = "ghostwire:workflows:review";
export const COMMAND_WORKFLOWS_WORK = "ghostwire:workflows:work";

// Code commands
export const COMMAND_CODE_REFACTOR = "ghostwire:code:refactor";
export const COMMAND_CODE_REVIEW = "ghostwire:code:review";
export const COMMAND_CODE_OPTIMIZE = "ghostwire:code:optimize";
export const COMMAND_CODE_FORMAT = "ghostwire:code:format";

// Git commands
export const COMMAND_GIT_SMART_COMMIT = "ghostwire:git:smart-commit";
export const COMMAND_GIT_BRANCH = "ghostwire:git:branch";
export const COMMAND_GIT_MERGE = "ghostwire:git:merge";
export const COMMAND_GIT_CLEANUP = "ghostwire:git:cleanup";

// Project commands
export const COMMAND_PROJECT_INIT = "ghostwire:project:init";
export const COMMAND_PROJECT_BUILD = "ghostwire:project:build";
export const COMMAND_PROJECT_DEPLOY = "ghostwire:project:deploy";
export const COMMAND_PROJECT_TEST = "ghostwire:project:test";

// Util commands
export const COMMAND_UTIL_CLEAN = "ghostwire:util:clean";
export const COMMAND_UTIL_BACKUP = "ghostwire:util:backup";
export const COMMAND_UTIL_RESTORE = "ghostwire:util:restore";
export const COMMAND_UTIL_DOCTOR = "ghostwire:util:doctor";

// Docs commands
export const COMMAND_DOCS_DEPLOY_DOCS = "ghostwire:docs:deploy-docs";
export const COMMAND_DOCS_RELEASE_DOCS = "ghostwire:docs:release-docs";
export const COMMAND_DOCS_FEATURE_VIDEO = "ghostwire:docs:feature-video";
export const COMMAND_DOCS_TEST_BROWSER = "ghostwire:docs:test-browser";

// Other commands
export const COMMAND_REFACTOR = "ghostwire:refactor";
export const COMMAND_LINT_RUBY = "ghostwire:lint:ruby";
export const COMMAND_PLAN_REVIEW = "ghostwire:plan-review";
export const COMMAND_CHANGELOG = "ghostwire:changelog";
export const COMMAND_CREATE_AGENT_SKILL = "ghostwire:create-agent-skill";
export const COMMAND_DEEPEN_PLAN = "ghostwire:deepen-plan";
export const COMMAND_DEPLOY_DOCS = "ghostwire:deploy-docs";
export const COMMAND_FEATURE_VIDEO = "ghostwire:feature-video";
export const COMMAND_GENERATE_COMMAND = "ghostwire:generate-command";
export const COMMAND_HEAL_SKILL = "ghostwire:heal-skill";
export const COMMAND_LFG = "ghostwire:lfg";
export const COMMAND_QUIZ_ME = "ghostwire:quiz-me";
export const COMMAND_RELEASE_DOCS = "ghostwire:release-docs";
export const COMMAND_REPORT_BUG = "ghostwire:report-bug";
export const COMMAND_REPRODUCE_BUG = "ghostwire:reproduce-bug";
export const COMMAND_RESOLVE_PARALLEL = "ghostwire:resolve-parallel";
export const COMMAND_RESOLVE_PR_PARALLEL = "ghostwire:resolve-pr-parallel";
export const COMMAND_RESOLVE_TODO_PARALLEL = "ghostwire:resolve-todo-parallel";
export const COMMAND_SYNC_TUTORIALS = "ghostwire:sync-tutorials";
export const COMMAND_TEACH_ME = "ghostwire:teach-me";
export const COMMAND_TEST_BROWSER = "ghostwire:test-browser";
export const COMMAND_TRIAGE = "ghostwire:triage";
export const COMMAND_XCODE_TEST = "ghostwire:xcode-test";

// Project extended commands
export const COMMAND_PROJECT_MAP = "ghostwire:project:map";
export const COMMAND_PROJECT_CONSTITUTION = "ghostwire:project:constitution";

// Workflows extended commands
export const COMMAND_WORKFLOWS_EXECUTE = "ghostwire:workflows:execute";
export const COMMAND_WORKFLOWS_STOP = "ghostwire:workflows:stop";
export const COMMAND_WORKFLOWS_LEARNINGS = "ghostwire:workflows:learnings";

// Work commands
export const COMMAND_WORK_LOOP = "ghostwire:work:loop";
export const COMMAND_WORK_CANCEL = "ghostwire:work:cancel";

// Valid command names for validation
export const VALID_COMMAND_NAMES = [
  COMMAND_WORKFLOWS_PLAN,
  COMMAND_WORKFLOWS_CREATE,
  COMMAND_WORKFLOWS_STATUS,
  COMMAND_WORKFLOWS_COMPLETE,
  COMMAND_WORKFLOWS_BRAINSTORM,
  COMMAND_WORKFLOWS_COMPOUND,
  COMMAND_WORKFLOWS_REVIEW,
  COMMAND_WORKFLOWS_WORK,
  COMMAND_CODE_REFACTOR,
  COMMAND_CODE_REVIEW,
  COMMAND_CODE_OPTIMIZE,
  COMMAND_CODE_FORMAT,
  COMMAND_GIT_SMART_COMMIT,
  COMMAND_GIT_BRANCH,
  COMMAND_GIT_MERGE,
  COMMAND_GIT_CLEANUP,
  COMMAND_PROJECT_INIT,
  COMMAND_PROJECT_BUILD,
  COMMAND_PROJECT_DEPLOY,
  COMMAND_PROJECT_TEST,
  COMMAND_UTIL_CLEAN,
  COMMAND_UTIL_BACKUP,
  COMMAND_UTIL_RESTORE,
  COMMAND_UTIL_DOCTOR,
  COMMAND_DOCS_DEPLOY_DOCS,
  COMMAND_DOCS_RELEASE_DOCS,
  COMMAND_DOCS_FEATURE_VIDEO,
  COMMAND_DOCS_TEST_BROWSER,
  COMMAND_REFACTOR,
  COMMAND_LINT_RUBY,
  COMMAND_PLAN_REVIEW,
  COMMAND_CHANGELOG,
  COMMAND_CREATE_AGENT_SKILL,
  COMMAND_DEEPEN_PLAN,
  COMMAND_DEPLOY_DOCS,
  COMMAND_FEATURE_VIDEO,
  COMMAND_GENERATE_COMMAND,
  COMMAND_HEAL_SKILL,
  COMMAND_LFG,
  COMMAND_QUIZ_ME,
  COMMAND_RELEASE_DOCS,
  COMMAND_REPORT_BUG,
  COMMAND_REPRODUCE_BUG,
  COMMAND_RESOLVE_PARALLEL,
  COMMAND_RESOLVE_PR_PARALLEL,
  COMMAND_RESOLVE_TODO_PARALLEL,
  COMMAND_SYNC_TUTORIALS,
  COMMAND_TEACH_ME,
  COMMAND_TEST_BROWSER,
  COMMAND_TRIAGE,
  COMMAND_XCODE_TEST,
  // Project extended
  COMMAND_PROJECT_MAP,
  COMMAND_PROJECT_CONSTITUTION,
  // Workflows extended
  COMMAND_WORKFLOWS_EXECUTE,
  COMMAND_WORKFLOWS_STOP,
  COMMAND_WORKFLOWS_LEARNINGS,
  // Work commands
  COMMAND_WORK_LOOP,
  COMMAND_WORK_CANCEL,
] as const;

export type ValidCommandName = (typeof VALID_COMMAND_NAMES)[number];

/**
 * Validate that a command name is valid
 */
export function isValidCommandName(commandName: string): commandName is ValidCommandName {
  return VALID_COMMAND_NAMES.includes(commandName as ValidCommandName);
}

// ============================================================================
// Skill Names (from docs/skills.yml)
// ============================================================================

// Core skills
export const SKILL_AGENT_BROWSER = "agent-browser";
export const SKILL_FRONTEND_UI_UX = "frontend-ui-ux";
export const SKILL_GIT_MASTER = "git-master";
export const SKILL_DEV_BROWSER = "dev-browser";

// Additional skills
export const SKILL_ANDREW_KANE_GEM_WRITER = "andrew-kane-gem-writer";
export const SKILL_BRAINSTORMING = "brainstorming";
export const SKILL_CODING_TUTOR = "coding-tutor";
export const SKILL_COMPOUND_DOCS = "compound-docs";
export const SKILL_CREATE_AGENT_SKILLS = "create-agent-skills";
export const SKILL_DHH_RAILS_STYLE = "dhh-rails-style";
export const SKILL_DSPY_RUBY = "dspy-ruby";
export const SKILL_EVERY_STYLE_EDITOR = "every-style-editor";
export const SKILL_FILE_TODOS = "file-todos";
export const SKILL_FRONTEND_DESIGN = "frontend-design";
export const SKILL_GEMINI_IMAGEN = "gemini-imagegen";
export const SKILL_GIT_WORKTREE = "git-worktree";
export const SKILL_ULTRAWORK_LOOP = "ultrawork-loop";
export const SKILL_RCLONE = "rclone";
export const SKILL_SKILL_CREATOR = "skill-creator";

// Valid skill names for validation
export const VALID_SKILL_NAMES = [
  SKILL_AGENT_BROWSER,
  SKILL_FRONTEND_UI_UX,
  SKILL_GIT_MASTER,
  SKILL_DEV_BROWSER,
  SKILL_ANDREW_KANE_GEM_WRITER,
  SKILL_BRAINSTORMING,
  SKILL_CODING_TUTOR,
  SKILL_COMPOUND_DOCS,
  SKILL_CREATE_AGENT_SKILLS,
  SKILL_DHH_RAILS_STYLE,
  SKILL_DSPY_RUBY,
  SKILL_EVERY_STYLE_EDITOR,
  SKILL_FILE_TODOS,
  SKILL_FRONTEND_DESIGN,
  SKILL_GEMINI_IMAGEN,
  SKILL_GIT_WORKTREE,
  SKILL_ULTRAWORK_LOOP,
  SKILL_RCLONE,
  SKILL_SKILL_CREATOR,
] as const;

export type ValidSkillName = (typeof VALID_SKILL_NAMES)[number];

/**
 * Validate that a skill name is valid
 */
export function isValidSkillName(skillName: string): skillName is ValidSkillName {
  return VALID_SKILL_NAMES.includes(skillName as ValidSkillName);
}
