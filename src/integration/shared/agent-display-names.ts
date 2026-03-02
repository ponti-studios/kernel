/**
 * Agent config keys to display names mapping.
 * Config keys are lowercase (e.g., "operator", "orchestrator").
 * Display names match agent IDs for consistency.
 */
export const AGENT_DISPLAY_NAMES: Record<string, string> = {
  // Phase 1 - Orchestration
  operator: "operator",
  orchestrator: "orchestrator",
  planner: "planner",
  executor: "executor",
  // Phase 2 - Code Review
  "reviewer-rails": "reviewer-rails",
  "reviewer-python": "reviewer-python",
  "reviewer-typescript": "reviewer-typescript",
  "reviewer-rails-dh": "reviewer-rails-dh",
  "reviewer-simplicity": "reviewer-simplicity",
  // Phase 3 - Research
  "researcher-docs": "researcher-docs",
  "researcher-learnings": "researcher-learnings",
  "researcher-practices": "researcher-practices",
  "researcher-git": "researcher-git",
  "analyzer-media": "analyzer-media",
  // Phase 4 - Design
  "designer-flow": "designer-flow",
  "designer-sync": "designer-sync",
  "designer-iterator": "designer-iterator",
  "analyzer-design": "analyzer-design",
  "designer-builder": "designer-builder",
  // Phase 5 - Advisory/Validation/Documentation
  "advisor-architecture": "advisor-architecture",
  "advisor-strategy": "advisor-strategy",
  "validator-audit": "validator-audit",
  "validator-deployment": "validator-deployment",
  "writer-readme": "writer-readme",
  "writer-gem": "writer-gem",
  "editor-style": "editor-style",
  // Phase 6 - Legacy Agents (final phase)
  "researcher-codebase": "researcher-codebase",
  "researcher-world": "researcher-world",
  // Phase 16 - New Agents from Export
  "reviewer-security": "reviewer-security",
  "validator-bugs": "validator-bugs",
  "guardian-data": "guardian-data",
  "expert-migrations": "expert-migrations",
  "resolver-pr": "resolver-pr",
  "oracle-performance": "oracle-performance",
  "reviewer-races": "reviewer-races",
  "analyzer-patterns": "analyzer-patterns",
  "researcher-repo": "researcher-repo",
};

/**
 * Get display name for an agent config key.
 * Returns original key if not found in the mapping.
 */
export function getAgentDisplayName(configKey: string): string {
  const lowerKey = configKey.toLowerCase();
  return AGENT_DISPLAY_NAMES[lowerKey] ?? configKey;
}
