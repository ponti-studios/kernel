/**
 * Barrel export for spec templates
 */
export {
  SPEC_CREATE_TEMPLATE,
  generateShortName,
  getNextFeatureNumber,
  generateBranchName,
  getFeatureDir,
  getSpecFilePath,
} from "./create";
export {
  SPEC_PLAN_TEMPLATE,
  extractResearchTopics,
  validateConstitutionGates,
  PROJECT_STRUCTURE_TEMPLATES,
} from "./plan";
export {
  SPEC_TASKS_TEMPLATE,
  formatTask,
  generateUserStoryPhase,
  extractUserStories,
  type UserStory,
} from "./tasks";
export {
  SPEC_IMPLEMENT_TEMPLATE,
  generateChecklistStatusTable,
  generateProgressTable,
  PHASE_EXECUTION_RULES,
  prioritizeTasks,
  IGNORE_PATTERNS,
  detectTechnology,
} from "./implement";
export {
  SPEC_CLARIFY_TEMPLATE,
  generateClarificationQuestion,
  extractClarificationMarkers,
  prioritizeMarkers,
  applyClarifications,
  type ClarificationQuestion,
} from "./clarify";
export {
  SPEC_ANALYZE_TEMPLATE,
  generateIssuesList,
  checkSpecPlanAlignment,
  checkPlanTasksAlignment,
  type ArtifactStatus,
  type IssueSeverity,
  type AnalysisIssue,
} from "./analyze";
export {
  SPEC_CHECKLIST_TEMPLATE,
  DOMAIN_CHECKLISTS,
  generateChecklistItems,
  getAvailableDomains,
  validateChecklist,
} from "./checklist";
export {
  SPEC_TO_ISSUES_TEMPLATE,
  generateGhCommand,
  extractTasks,
  generateIssueCreationPlan,
  generateUserStorySummary,
  type TaskToIssue,
} from "./to-issues";
