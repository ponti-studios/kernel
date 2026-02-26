import { isValidCommandName } from "../../../orchestration/agents/constants";
import { COMMAND_PROFILE_REGISTRY, type RuntimeRoute } from "./profiles";

export const DELETED_RUNTIME_AGENT_IDS = [
  "advisor-architecture",
  "advisor-plan",
  "advisor-strategy",
  "analyzer-design",
  "analyzer-media",
  "analyzer-patterns",
  "designer-builder",
  "designer-flow",
  "designer-iterator",
  "designer-sync",
  "editor-style",
  "executor",
  "expert-migrations",
  "guardian-data",
  "operator",
  "oracle-performance",
  "orchestrator",
  "planner",
  "researcher-codebase",
  "researcher-data",
  "researcher-docs",
  "researcher-git",
  "researcher-learnings",
  "researcher-practices",
  "researcher-repo",
  "resolver-pr",
  "reviewer-python",
  "reviewer-races",
  "reviewer-rails",
  "reviewer-rails-dh",
  "reviewer-security",
  "reviewer-simplicity",
  "reviewer-typescript",
  "validator-audit",
  "validator-bugs",
  "validator-deployment",
  "writer-gem",
  "writer-readme",
] as const;

export type DeletedRuntimeAgentId = (typeof DELETED_RUNTIME_AGENT_IDS)[number];

export interface DeletedAgentCoverageEntry {
  deleted_agent_id: DeletedRuntimeAgentId;
  replacement_command_or_profile: string;
  replacement_profile_id: string;
  runtime_route: RuntimeRoute;
  capability_domain: string;
  status: "active" | "deprecated";
}

export const DELETED_AGENT_COMMAND_COVERAGE: DeletedAgentCoverageEntry[] = [
  { deleted_agent_id: "advisor-architecture", replacement_command_or_profile: "ghostwire:workflows:review", replacement_profile_id: "advisor_architecture", runtime_route: "do", capability_domain: "architecture", status: "active" },
  { deleted_agent_id: "advisor-plan", replacement_command_or_profile: "ghostwire:workflows:plan", replacement_profile_id: "advisor_plan", runtime_route: "do", capability_domain: "planning", status: "active" },
  { deleted_agent_id: "advisor-strategy", replacement_command_or_profile: "ghostwire:workflows:plan", replacement_profile_id: "advisor_strategy", runtime_route: "do", capability_domain: "planning", status: "active" },
  { deleted_agent_id: "analyzer-design", replacement_command_or_profile: "ghostwire:workflows:review", replacement_profile_id: "analyzer_design", runtime_route: "research", capability_domain: "design", status: "active" },
  { deleted_agent_id: "analyzer-media", replacement_command_or_profile: "ghostwire:workflows:review", replacement_profile_id: "analyzer_media", runtime_route: "research", capability_domain: "media", status: "active" },
  { deleted_agent_id: "analyzer-patterns", replacement_command_or_profile: "ghostwire:code:refactor", replacement_profile_id: "analyzer_patterns", runtime_route: "do", capability_domain: "patterns", status: "active" },
  { deleted_agent_id: "designer-builder", replacement_command_or_profile: "ghostwire:docs:test-browser", replacement_profile_id: "designer_builder", runtime_route: "do", capability_domain: "design", status: "active" },
  { deleted_agent_id: "designer-flow", replacement_command_or_profile: "ghostwire:project:map", replacement_profile_id: "designer_flow", runtime_route: "do", capability_domain: "ux-flow", status: "active" },
  { deleted_agent_id: "designer-iterator", replacement_command_or_profile: "ghostwire:docs:test-browser", replacement_profile_id: "designer_iterator", runtime_route: "do", capability_domain: "design", status: "active" },
  { deleted_agent_id: "designer-sync", replacement_command_or_profile: "ghostwire:docs:test-browser", replacement_profile_id: "designer_sync", runtime_route: "do", capability_domain: "design", status: "active" },
  { deleted_agent_id: "editor-style", replacement_command_or_profile: "ghostwire:docs:release-docs", replacement_profile_id: "editor_style", runtime_route: "do", capability_domain: "writing", status: "active" },
  { deleted_agent_id: "executor", replacement_command_or_profile: "ghostwire:workflows:execute", replacement_profile_id: "executor", runtime_route: "do", capability_domain: "execution", status: "active" },
  { deleted_agent_id: "expert-migrations", replacement_command_or_profile: "ghostwire:workflows:review", replacement_profile_id: "expert_migrations", runtime_route: "do", capability_domain: "migrations", status: "active" },
  { deleted_agent_id: "guardian-data", replacement_command_or_profile: "ghostwire:workflows:review", replacement_profile_id: "guardian_data", runtime_route: "do", capability_domain: "data", status: "active" },
  { deleted_agent_id: "operator", replacement_command_or_profile: "ghostwire:workflows:execute", replacement_profile_id: "operator", runtime_route: "do", capability_domain: "orchestration", status: "active" },
  { deleted_agent_id: "oracle-performance", replacement_command_or_profile: "ghostwire:code:optimize", replacement_profile_id: "oracle_performance", runtime_route: "do", capability_domain: "performance", status: "active" },
  { deleted_agent_id: "orchestrator", replacement_command_or_profile: "ghostwire:workflows:execute", replacement_profile_id: "orchestrator", runtime_route: "do", capability_domain: "orchestration", status: "active" },
  { deleted_agent_id: "planner", replacement_command_or_profile: "ghostwire:workflows:plan", replacement_profile_id: "planner", runtime_route: "do", capability_domain: "planning", status: "active" },
  { deleted_agent_id: "researcher-codebase", replacement_command_or_profile: "ghostwire:project:map", replacement_profile_id: "researcher_codebase", runtime_route: "research", capability_domain: "research", status: "active" },
  { deleted_agent_id: "researcher-data", replacement_command_or_profile: "ghostwire:workflows:plan", replacement_profile_id: "researcher_data", runtime_route: "research", capability_domain: "research", status: "active" },
  { deleted_agent_id: "researcher-docs", replacement_command_or_profile: "ghostwire:workflows:plan", replacement_profile_id: "researcher_docs", runtime_route: "research", capability_domain: "research", status: "active" },
  { deleted_agent_id: "researcher-git", replacement_command_or_profile: "ghostwire:workflows:review", replacement_profile_id: "researcher_git", runtime_route: "research", capability_domain: "research", status: "active" },
  { deleted_agent_id: "researcher-learnings", replacement_command_or_profile: "ghostwire:workflows:learnings", replacement_profile_id: "researcher_learnings", runtime_route: "research", capability_domain: "research", status: "active" },
  { deleted_agent_id: "researcher-practices", replacement_command_or_profile: "ghostwire:workflows:plan", replacement_profile_id: "researcher_practices", runtime_route: "research", capability_domain: "research", status: "active" },
  { deleted_agent_id: "researcher-repo", replacement_command_or_profile: "ghostwire:project:map", replacement_profile_id: "researcher_repo", runtime_route: "research", capability_domain: "research", status: "active" },
  { deleted_agent_id: "resolver-pr", replacement_command_or_profile: "ghostwire:workflows:review", replacement_profile_id: "resolver_pr", runtime_route: "do", capability_domain: "review", status: "active" },
  { deleted_agent_id: "reviewer-python", replacement_command_or_profile: "ghostwire:code:review", replacement_profile_id: "reviewer_python", runtime_route: "do", capability_domain: "review", status: "active" },
  { deleted_agent_id: "reviewer-races", replacement_command_or_profile: "ghostwire:code:review", replacement_profile_id: "reviewer_races", runtime_route: "do", capability_domain: "review", status: "active" },
  { deleted_agent_id: "reviewer-rails", replacement_command_or_profile: "ghostwire:code:review", replacement_profile_id: "reviewer_rails", runtime_route: "do", capability_domain: "review", status: "active" },
  { deleted_agent_id: "reviewer-rails-dh", replacement_command_or_profile: "ghostwire:code:review", replacement_profile_id: "reviewer_rails_dh", runtime_route: "do", capability_domain: "review", status: "active" },
  { deleted_agent_id: "reviewer-security", replacement_command_or_profile: "ghostwire:code:review", replacement_profile_id: "reviewer_security", runtime_route: "do", capability_domain: "security", status: "active" },
  { deleted_agent_id: "reviewer-simplicity", replacement_command_or_profile: "ghostwire:code:review", replacement_profile_id: "reviewer_simplicity", runtime_route: "do", capability_domain: "review", status: "active" },
  { deleted_agent_id: "reviewer-typescript", replacement_command_or_profile: "ghostwire:code:review", replacement_profile_id: "reviewer_typescript", runtime_route: "do", capability_domain: "review", status: "active" },
  { deleted_agent_id: "validator-audit", replacement_command_or_profile: "ghostwire:plan-review", replacement_profile_id: "validator_audit", runtime_route: "do", capability_domain: "validation", status: "active" },
  { deleted_agent_id: "validator-bugs", replacement_command_or_profile: "ghostwire:reproduce-bug", replacement_profile_id: "validator_bugs", runtime_route: "do", capability_domain: "validation", status: "active" },
  { deleted_agent_id: "validator-deployment", replacement_command_or_profile: "ghostwire:workflows:review", replacement_profile_id: "validator_deployment", runtime_route: "do", capability_domain: "validation", status: "active" },
  { deleted_agent_id: "writer-gem", replacement_command_or_profile: "ghostwire:project:init", replacement_profile_id: "writer_gem", runtime_route: "do", capability_domain: "writing", status: "active" },
  { deleted_agent_id: "writer-readme", replacement_command_or_profile: "ghostwire:docs:release-docs", replacement_profile_id: "writer_readme", runtime_route: "do", capability_domain: "writing", status: "active" },
];

export function isValidCoverageEntry(entry: DeletedAgentCoverageEntry): boolean {
  return (
    isValidCommandName(entry.replacement_command_or_profile) &&
    entry.runtime_route in { do: true, research: true } &&
    entry.replacement_profile_id in COMMAND_PROFILE_REGISTRY
  );
}
