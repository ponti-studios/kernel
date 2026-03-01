import type { CommandName } from "./types";
import { AGENT_PROMPTS } from "../../orchestration/agents/prompts";

export type RuntimeRoute = "do" | "research";

export interface CommandProfile {
  profile_id: string;
  intent: string;
  required_tools: string[];
  runtime_route: RuntimeRoute;
  prompt_append: string;
  acceptance_checks: string[];
  default_command: CommandName;
}

export const COMMAND_PROFILE_REGISTRY: Record<string, CommandProfile> = {
  advisor_architecture: {
    profile_id: "advisor_architecture",
    intent: "Validate architecture for agent-native parity and system cohesion.",
    required_tools: ["read", "search", "delegate_task"],
    runtime_route: "do",
    prompt_append:
      "Perform architecture parity and capability mapping checks before implementation recommendations.",
    acceptance_checks: ["parity matrix complete", "architecture risks prioritized"],
    default_command: "ghostwire:workflows:review",
  },
  advisor_plan: {
    profile_id: "advisor_plan",
    intent: "Provide high-rigor planning and debugging reasoning.",
    required_tools: ["read", "search", "delegate_task"],
    runtime_route: "do",
    prompt_append: "Produce deterministic, verifiable reasoning with explicit assumptions.",
    acceptance_checks: ["assumptions enumerated", "validation steps included"],
    default_command: "ghostwire:workflows:plan",
  },
  advisor_strategy: {
    profile_id: "advisor_strategy",
    intent: "Pre-plan strategy synthesis and hidden requirement extraction.",
    required_tools: ["read", "search", "delegate_task"],
    runtime_route: "do",
    prompt_append: "Surface hidden constraints and convert them into executable plan directives.",
    acceptance_checks: ["constraints surfaced", "strategy directives explicit"],
    default_command: "ghostwire:workflows:plan",
  },
  analyzer_design: {
    profile_id: "analyzer_design",
    intent: "Assess implementation against visual design specifications.",
    required_tools: ["read", "delegate_task", "look_at"],
    runtime_route: "research",
    prompt_append: "Compare visual outputs against spec and list delta categories with severity.",
    acceptance_checks: ["visual deltas listed", "actionable fix list produced"],
    default_command: "ghostwire:workflows:review",
  },
  analyzer_media: {
    profile_id: "analyzer_media",
    intent: "Extract and interpret non-code media artifacts.",
    required_tools: ["read", "delegate_task", "look_at"],
    runtime_route: "research",
    prompt_append: "Extract factual signals from media and cite exact locations.",
    acceptance_checks: ["artifacts parsed", "citations included"],
    default_command: "ghostwire:workflows:review",
  },
  analyzer_patterns: {
    profile_id: "analyzer_patterns",
    intent: "Detect system patterns, anti-patterns, and consistency gaps.",
    required_tools: ["read", "search", "delegate_task"],
    runtime_route: "do",
    prompt_append: "Identify pattern families and justify recommended normalization strategy.",
    acceptance_checks: ["patterns cataloged", "anti-pattern remediations listed"],
    default_command: "ghostwire:code:refactor",
  },
  designer_builder: {
    profile_id: "designer_builder",
    intent: "Produce high-quality production-ready UX implementation outputs.",
    required_tools: ["read", "delegate_task", "edit"],
    runtime_route: "do",
    prompt_append: "Deliver design-intent preserving implementation with responsive behavior.",
    acceptance_checks: ["responsive checks pass", "design intent preserved"],
    default_command: "ghostwire:docs:test-browser",
  },
  designer_flow: {
    profile_id: "designer_flow",
    intent: "Model user journeys and interaction edge cases.",
    required_tools: ["read", "search", "delegate_task"],
    runtime_route: "do",
    prompt_append: "Produce user-flow graph and enumerate edge-path handling.",
    acceptance_checks: ["critical flows mapped", "edge cases enumerated"],
    default_command: "ghostwire:project:map",
  },
  designer_iterator: {
    profile_id: "designer_iterator",
    intent: "Iterative UX quality refinement across feedback cycles.",
    required_tools: ["read", "delegate_task", "look_at", "edit"],
    runtime_route: "do",
    prompt_append: "Run bounded iteration cycles with measurable visual quality deltas.",
    acceptance_checks: ["iteration deltas documented", "quality threshold achieved"],
    default_command: "ghostwire:docs:test-browser",
  },
  designer_sync: {
    profile_id: "designer_sync",
    intent: "Synchronize implementation and design references.",
    required_tools: ["read", "delegate_task", "look_at", "edit"],
    runtime_route: "do",
    prompt_append: "Resolve visual and semantic divergence until spec-aligned.",
    acceptance_checks: ["drift removed", "alignment checklist complete"],
    default_command: "ghostwire:docs:test-browser",
  },
  editor_style: {
    profile_id: "editor_style",
    intent: "Apply style-guide conformity to written outputs.",
    required_tools: ["read", "edit", "delegate_task"],
    runtime_route: "do",
    prompt_append: "Apply line-level style constraints consistently and preserve meaning.",
    acceptance_checks: ["style compliance complete", "semantic intent preserved"],
    default_command: "ghostwire:docs:release-docs",
  },
  executor: {
    profile_id: "executor",
    intent: "Execute implementation tasks with strict verification loops.",
    required_tools: ["read", "edit", "bash", "delegate_task"],
    runtime_route: "do",
    prompt_append: "Run end-to-end execution with deterministic checks before completion.",
    acceptance_checks: ["all tasks resolved", "verification artifacts captured"],
    default_command: "ghostwire:workflows:execute",
  },
  expert_migrations: {
    profile_id: "expert_migrations",
    intent: "Validate data migration integrity and rollback safety.",
    required_tools: ["read", "search", "delegate_task"],
    runtime_route: "do",
    prompt_append: "Verify mapping correctness, data safety, and rollback plan viability.",
    acceptance_checks: ["migration invariants validated", "rollback checks complete"],
    default_command: "ghostwire:workflows:review",
  },
  guardian_data: {
    profile_id: "guardian_data",
    intent: "Review database constraints, transactions, and data consistency.",
    required_tools: ["read", "search", "delegate_task"],
    runtime_route: "do",
    prompt_append: "Check referential integrity, transaction boundaries, and privacy safety.",
    acceptance_checks: ["constraints validated", "integrity risks addressed"],
    default_command: "ghostwire:workflows:review",
  },
  operator: {
    profile_id: "operator",
    intent: "Coordinate execution flows and task routing.",
    required_tools: ["read", "delegate_task", "task"],
    runtime_route: "do",
    prompt_append: "Maintain deterministic task routing with explicit progress tracking.",
    acceptance_checks: ["routing complete", "handoff state consistent"],
    default_command: "ghostwire:workflows:execute",
  },
  oracle_performance: {
    profile_id: "oracle_performance",
    intent: "Detect and remediate performance bottlenecks.",
    required_tools: ["read", "search", "delegate_task", "bash"],
    runtime_route: "do",
    prompt_append: "Profile hot paths and prioritize high-impact optimizations.",
    acceptance_checks: ["bottlenecks identified", "metrics improvement validated"],
    default_command: "ghostwire:code:optimize",
  },
  orchestrator: {
    profile_id: "orchestrator",
    intent: "Plan and enforce completion of task graphs.",
    required_tools: ["read", "delegate_task", "task"],
    runtime_route: "do",
    prompt_append: "Enforce dependency order, verification gates, and completion criteria.",
    acceptance_checks: ["task graph completed", "quality gates passed"],
    default_command: "ghostwire:workflows:execute",
  },
  planner: {
    profile_id: "planner",
    intent: "Produce comprehensive executable plans from user goals.",
    required_tools: ["read", "search", "delegate_task"],
    runtime_route: "do",
    prompt_append: "Transform requirements into deterministic task graphs with explicit checks.",
    acceptance_checks: ["plan completeness validated", "execution criteria explicit"],
    default_command: "ghostwire:workflows:plan",
  },
  researcher_codebase: {
    profile_id: "researcher_codebase",
    intent: "Search local codebase and extract implementation patterns.",
    required_tools: ["read", "search", "delegate_task"],
    runtime_route: "research",
    prompt_append: "Return exact file references and confidence-scored findings.",
    acceptance_checks: ["pattern search complete", "file citations included"],
    default_command: "ghostwire:project:map",
  },
  researcher_data: {
    profile_id: "researcher_data",
    intent: "Fetch external docs, examples, and data-driven references.",
    required_tools: ["web", "read", "delegate_task"],
    runtime_route: "research",
    prompt_append: "Prefer primary sources and version-specific constraints.",
    acceptance_checks: ["primary sources cited", "version constraints captured"],
    default_command: "ghostwire:workflows:plan",
  },
  researcher_docs: {
    profile_id: "researcher_docs",
    intent: "Collect official documentation and best-practice references.",
    required_tools: ["web", "read", "delegate_task"],
    runtime_route: "research",
    prompt_append: "Extract implementation-relevant constraints with citations.",
    acceptance_checks: ["official references included", "constraints summarized"],
    default_command: "ghostwire:workflows:plan",
  },
  researcher_git: {
    profile_id: "researcher_git",
    intent: "Analyze repository history for origin and evolution context.",
    required_tools: ["read", "search", "bash", "delegate_task"],
    runtime_route: "research",
    prompt_append: "Trace commit lineage and summarize decision history.",
    acceptance_checks: ["history traced", "context summary delivered"],
    default_command: "ghostwire:workflows:review",
  },
  researcher_learnings: {
    profile_id: "researcher_learnings",
    intent: "Retrieve prior institutional learnings and known solutions.",
    required_tools: ["read", "search", "delegate_task"],
    runtime_route: "research",
    prompt_append: "Prioritize proven internal solutions and known failure modes.",
    acceptance_checks: ["relevant learnings found", "applicability mapped"],
    default_command: "ghostwire:workflows:learnings",
  },
  researcher_practices: {
    profile_id: "researcher_practices",
    intent: "Gather industry practices and implementation references.",
    required_tools: ["web", "read", "delegate_task"],
    runtime_route: "research",
    prompt_append: "Distill pragmatic practices with direct applicability.",
    acceptance_checks: ["practice set synthesized", "source quality validated"],
    default_command: "ghostwire:workflows:plan",
  },
  researcher_repo: {
    profile_id: "researcher_repo",
    intent: "Map repository structure and conventions.",
    required_tools: ["read", "search", "delegate_task"],
    runtime_route: "research",
    prompt_append: "Produce repository topology and convention inventory.",
    acceptance_checks: ["structure map complete", "conventions identified"],
    default_command: "ghostwire:project:map",
  },
  resolver_pr: {
    profile_id: "resolver_pr",
    intent: "Resolve PR comments and align implementation with review feedback.",
    required_tools: ["read", "edit", "delegate_task"],
    runtime_route: "do",
    prompt_append: "Map every review comment to concrete code updates and verification.",
    acceptance_checks: ["comments resolved", "regressions checked"],
    default_command: "ghostwire:workflows:review",
  },
  reviewer_python: {
    profile_id: "reviewer_python",
    intent: "Review Python changes for correctness and maintainability.",
    required_tools: ["read", "search", "delegate_task"],
    runtime_route: "do",
    prompt_append: "Apply strict Python quality and safety checks.",
    acceptance_checks: ["python review complete", "actionable findings produced"],
    default_command: "ghostwire:code:review",
  },
  reviewer_races: {
    profile_id: "reviewer_races",
    intent: "Detect race conditions and timing hazards.",
    required_tools: ["read", "search", "delegate_task"],
    runtime_route: "do",
    prompt_append: "Analyze async ordering and shared-state race risk.",
    acceptance_checks: ["race scenarios analyzed", "mitigations proposed"],
    default_command: "ghostwire:code:review",
  },
  reviewer_rails: {
    profile_id: "reviewer_rails",
    intent: "Review Rails code for conventions and correctness.",
    required_tools: ["read", "search", "delegate_task"],
    runtime_route: "do",
    prompt_append: "Evaluate Rails idioms, boundaries, and maintainability.",
    acceptance_checks: ["rails review complete", "convention violations listed"],
    default_command: "ghostwire:code:review",
  },
  reviewer_rails_dh: {
    profile_id: "reviewer_rails_dh",
    intent: "Review architecture from opinionated Rails simplicity perspective.",
    required_tools: ["read", "search", "delegate_task"],
    runtime_route: "do",
    prompt_append: "Highlight anti-patterns and unnecessary abstraction.",
    acceptance_checks: ["architectural critiques captured", "simplification path proposed"],
    default_command: "ghostwire:code:review",
  },
  reviewer_security: {
    profile_id: "reviewer_security",
    intent: "Audit code for security vulnerabilities and controls.",
    required_tools: ["read", "search", "delegate_task"],
    runtime_route: "do",
    prompt_append: "Apply threat-model and secure coding checks with severity.",
    acceptance_checks: ["threats identified", "mitigations prioritized"],
    default_command: "ghostwire:code:review",
  },
  reviewer_simplicity: {
    profile_id: "reviewer_simplicity",
    intent: "Minimize complexity and enforce YAGNI.",
    required_tools: ["read", "search", "delegate_task"],
    runtime_route: "do",
    prompt_append: "Identify unnecessary complexity and provide simpler alternatives.",
    acceptance_checks: ["complexity reductions identified", "tradeoffs documented"],
    default_command: "ghostwire:code:review",
  },
  reviewer_typescript: {
    profile_id: "reviewer_typescript",
    intent: "Review TypeScript and JavaScript quality and typing rigor.",
    required_tools: ["read", "search", "delegate_task"],
    runtime_route: "do",
    prompt_append: "Validate typing boundaries and runtime safety risks.",
    acceptance_checks: ["typing issues identified", "runtime risks addressed"],
    default_command: "ghostwire:code:review",
  },
  validator_audit: {
    profile_id: "validator_audit",
    intent: "Audit work plans for rigor, completeness, and verifiability.",
    required_tools: ["read", "search", "delegate_task"],
    runtime_route: "do",
    prompt_append: "Apply strict validation criteria and failure conditions.",
    acceptance_checks: ["audit checklist complete", "blocking gaps called out"],
    default_command: "ghostwire:plan-review",
  },
  validator_bugs: {
    profile_id: "validator_bugs",
    intent: "Reproduce and validate bug reports with deterministic steps.",
    required_tools: ["read", "bash", "delegate_task"],
    runtime_route: "do",
    prompt_append: "Provide reproducibility status and minimal reliable repro script.",
    acceptance_checks: ["repro status explicit", "steps deterministic"],
    default_command: "ghostwire:reproduce-bug",
  },
  validator_deployment: {
    profile_id: "validator_deployment",
    intent: "Create pre/post deploy safety checklist and rollback criteria.",
    required_tools: ["read", "search", "delegate_task"],
    runtime_route: "do",
    prompt_append: "Generate executable deployment gates and rollback checks.",
    acceptance_checks: ["go/no-go checklist complete", "rollback criteria explicit"],
    default_command: "ghostwire:workflows:review",
  },
  writer_gem: {
    profile_id: "writer_gem",
    intent: "Author Ruby gem code and packaging artifacts.",
    required_tools: ["read", "edit", "delegate_task"],
    runtime_route: "do",
    prompt_append: "Produce concise gem APIs with deterministic examples.",
    acceptance_checks: ["gem interface coherent", "docs and tests aligned"],
    default_command: "ghostwire:project:init",
  },
  writer_readme: {
    profile_id: "writer_readme",
    intent: "Write concise technical README documentation.",
    required_tools: ["read", "edit", "delegate_task"],
    runtime_route: "do",
    prompt_append: "Use imperative voice, tight sections, and example-first format.",
    acceptance_checks: ["readme structure complete", "examples executable"],
    default_command: "ghostwire:docs:release-docs",
  },
};

for (const [profileId, profile] of Object.entries(COMMAND_PROFILE_REGISTRY)) {
  const profilePrompt = AGENT_PROMPTS[profileId];
  if (profilePrompt) {
    profile.prompt_append = profilePrompt;
  }
}

export const COMMAND_PROFILE_IDS = Object.keys(COMMAND_PROFILE_REGISTRY);

export function hasCommandProfile(profileId: string): boolean {
  return profileId in COMMAND_PROFILE_REGISTRY;
}

export function renderProfileUsage(profileIds: (keyof typeof COMMAND_PROFILE_REGISTRY)[]): string {
  return profileIds
    .map((profileId) => {
      const profile = COMMAND_PROFILE_REGISTRY[profileId];
      if (!profile) {
        return `- Use profile \`${profileId}\` via delegate_task(subagent_type="do")`;
      }
      return `- Use profile \`${profile.profile_id}\` via delegate_task(subagent_type="${profile.runtime_route}")`;
    })
    .join("\n");
}
