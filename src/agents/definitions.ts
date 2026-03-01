/**
 * Agent Definitions & Generator
 *
 * Complete set of 39 AgentProfileSpec instances.
 * Validates, dedups, and produces catalogs with multi-dimensional indexing.
 */

import {
  validateAgentProfileSpecList,
  detectDuplicateProfileIds,
  serializeAgentProfileSpec,
  type AgentProfileSpec,
} from "./schema";

// ============================================================================
// AGENT DEFINITIONS (39 total, organized by category)
// ============================================================================

export const AGENT_DEFINITIONS: AgentProfileSpec[] = [
  // Planning & Strategy (3)
  {
    id: "advisor-plan",
    intent: "High-IQ reasoning specialist for debugging hard problems and architecture design",
    role: "Planning",
    route: "do",
    tools: ["read", "search"],
    acceptanceChecks: [
      "Problem analysis is thorough",
      "Solutions are well-reasoned",
      "Edge cases identified",
    ],
    defaultCommand: "ghostwire:workflows:plan",
    promptAppend: "Focus on deep analysis and first-principles reasoning.",
  },
  {
    id: "advisor-strategy",
    intent: "Pre-planning consultant analyzing intent and surfacing hidden requirements",
    role: "Planning",
    route: "do",
    tools: ["search", "read"],
    acceptanceChecks: [
      "Intent is well understood",
      "Hidden requirements identified",
      "Recommendations are strategic",
    ],
    defaultCommand: "ghostwire:workflows:plan",
    promptAppend: "Identify strategic opportunities and potential pitfalls.",
  },
  {
    id: "planner",
    intent:
      "Strategic planning consultant that interviews users and produces comprehensive work plans",
    role: "Planning",
    route: "do",
    tools: ["read", "search", "task"],
    acceptanceChecks: [
      "Plan is comprehensive",
      "Steps are sequenced logically",
      "Success criteria are clear",
    ],
    defaultCommand: "ghostwire:workflows:plan",
    promptAppend: "Create detailed, actionable plans with clear milestones.",
  },

  // Architecture & Design (7)
  {
    id: "advisor-architecture",
    intent: "Review code to ensure features are agent-native with full capability parity",
    role: "Architecture",
    route: "do",
    tools: ["read", "search", "look_at"],
    acceptanceChecks: [
      "Architecture review is comprehensive",
      "Agent-native patterns identified",
      "Recommendations are specific",
    ],
    defaultCommand: "ghostwire:code:review",
    promptAppend: "Focus on architecture patterns and agent capability parity.",
  },
  {
    id: "analyzer-design",
    intent: "Verify UI implementation matches Figma design specifications with visual comparison",
    role: "Design",
    route: "do",
    tools: ["web", "look_at", "search"],
    acceptanceChecks: [
      "Design compliance verified",
      "Discrepancies documented",
      "Recommendations provided",
    ],
    defaultCommand: "ghostwire:docs:test-browser",
    promptAppend: "Compare implementation against design specifications pixel-perfectly.",
  },
  {
    id: "analyzer-patterns",
    intent: "Design pattern recognition and code organization specialist",
    role: "Architecture",
    route: "do",
    tools: ["search", "read"],
    acceptanceChecks: ["Patterns identified", "Organization assessed", "Improvements recommended"],
    defaultCommand: "ghostwire:code:refactor",
    promptAppend: "Identify architectural patterns and anti-patterns in code.",
  },
  {
    id: "designer-builder",
    intent: "Create distinctive, production-grade frontend interfaces with high design quality",
    role: "Design",
    route: "do",
    tools: ["edit", "read", "look_at"],
    acceptanceChecks: [
      "Design is production-ready",
      "Code quality is high",
      "User experience is polished",
    ],
    defaultCommand: "ghostwire:code:format",
    promptAppend: "Build beautiful, functional interfaces with attention to detail.",
  },
  {
    id: "designer-flow",
    intent: "Analyze user flow and map all possible journeys and interaction patterns",
    role: "Design",
    route: "do",
    tools: ["search", "read", "task"],
    acceptanceChecks: ["All user journeys mapped", "Edge cases identified", "Flow is cohesive"],
    defaultCommand: "ghostwire:workflows:plan",
    promptAppend: "Map comprehensive user flows and interaction patterns.",
  },
  {
    id: "designer-iterator",
    intent: "Systematic design refinement through iterative improvement cycles",
    role: "Design",
    route: "do",
    tools: ["edit", "look_at", "read"],
    acceptanceChecks: ["Design quality improved", "Iterations systematic", "Final result polished"],
    defaultCommand: "ghostwire:code:refactor",
    promptAppend: "Iteratively refine design until it reaches high quality.",
  },
  {
    id: "designer-sync",
    intent:
      "Synchronize web implementation with Figma design by detecting and fixing visual differences",
    role: "Design",
    route: "do",
    tools: ["web", "edit", "look_at"],
    acceptanceChecks: ["Implementation matches design", "All changes documented", "Tests pass"],
    defaultCommand: "ghostwire:code:format",
    promptAppend: "Ensure implementation matches Figma design precisely.",
  },

  // Orchestration Controllers (3)
  {
    id: "do",
    intent: "Primary execution coordinator that delegates implementation, research, and planning tasks to specialized subagents",
    role: "Orchestration",
    route: "do",
    tools: ["delegate_task", "task", "search", "read"],
    acceptanceChecks: ["Tasks delegated appropriately", "Subagent results synthesized", "User goal achieved"],
    defaultCommand: "ghostwire:workflows:execute",
    promptAppend: "Manage and verify subagent workflows to accomplish user objectives.",
  },
  {
    id: "research",
    intent: "Primary research coordinator that dispatches and aggregates subagents for investigative queries",
    role: "Orchestration",
    route: "research",
    tools: ["delegate_task", "search", "web", "read"],
    acceptanceChecks: ["Context gathered", "Sources cited", "Findings synthesized"],
    defaultCommand: "ghostwire:workflows:plan",
    promptAppend: "Orchestrate research subagents and compile their findings.",
  },
  {
    id: "plan",
    intent: "Strategic planning consultant that interviews users and creates comprehensive work plans",
    role: "Planning",
    route: "do",
    tools: ["read", "search", "delegate_task"],
    acceptanceChecks: ["Plan completeness validated", "Execution criteria explicit"],
    defaultCommand: "ghostwire:workflows:plan",
    promptAppend: "Generate detailed, actionable plans with clear milestones.",
  },

  // Research & Analysis (8)
  {
    id: "analyzer-media",
    intent: "Analyze media files (PDFs, images) that require interpretation beyond raw text",
    role: "Research",
    route: "research",
    tools: ["web", "search"],
    acceptanceChecks: [
      "Media analyzed thoroughly",
      "Key insights extracted",
      "Findings documented",
    ],
    defaultCommand: "ghostwire:project:map",
    promptAppend: "Extract and interpret information from media files.",
  },
  {
    id: "researcher-codebase",
    intent: "Contextual codebase search for answering code location and discovery questions",
    role: "Research",
    route: "research",
    tools: ["search", "read"],
    acceptanceChecks: ["Code located accurately", "Context provided", "Results actionable"],
    defaultCommand: "ghostwire:project:map",
    promptAppend: "Search codebase effectively and provide context.",
  },
  {
    id: "researcher-world",
    intent: "World-wide documentation and multi-repo analysis specialist",
    role: "Research",
    route: "research",
    tools: ["web", "search", "read"],
    acceptanceChecks: ["Documentation found", "Sources reliable", "Information complete"],
    defaultCommand: "ghostwire:project:topology",
    promptAppend: "Research documentation and data across multiple repositories and domains.",
  },
  {
    id: "researcher-docs",
    intent: "Gather comprehensive documentation and best practices for frameworks and libraries",
    role: "Research",
    route: "research",
    tools: ["web", "search"],
    acceptanceChecks: [
      "Documentation comprehensive",
      "Best practices identified",
      "Examples provided",
    ],
    defaultCommand: "ghostwire:project:topology",
    promptAppend: "Gather authoritative documentation and examples.",
  },
  {
    id: "researcher-git",
    intent: "Understand historical context and evolution of code changes",
    role: "Research",
    route: "research",
    tools: ["search", "read"],
    acceptanceChecks: ["History analyzed", "Context clear", "Evolution documented"],
    defaultCommand: "ghostwire:git:merge",
    promptAppend: "Provide historical context on code evolution.",
  },
  {
    id: "researcher-learnings",
    intent: "Search institutional learnings in docs for relevant past solutions",
    role: "Research",
    route: "research",
    tools: ["search", "read"],
    acceptanceChecks: ["Solutions found", "Patterns identified", "Lessons documented"],
    defaultCommand: "ghostwire:project:map",
    promptAppend: "Search institutional knowledge for relevant solutions.",
  },
  {
    id: "researcher-practices",
    intent: "Research external best practices, documentation, and examples",
    role: "Research",
    route: "research",
    tools: ["web", "search"],
    acceptanceChecks: ["Practices researched", "Examples found", "Standards documented"],
    defaultCommand: "ghostwire:project:topology",
    promptAppend: "Research and recommend best practices from industry standards.",
  },
  {
    id: "researcher-repo",
    intent: "Explore codebases to understand architecture, find files, and identify patterns",
    role: "Research",
    route: "research",
    tools: ["search", "read"],
    acceptanceChecks: ["Architecture understood", "Files located", "Patterns clear"],
    defaultCommand: "ghostwire:project:topology",
    promptAppend: "Explore repository structure and provide architectural insight.",
  },

  // Code Review & Quality (9)
  {
    id: "editor-style",
    intent: "Review and edit text content to conform to style guide with systematic review",
    role: "Reviewer",
    route: "do",
    tools: ["read", "edit"],
    acceptanceChecks: ["Style guide applied", "Consistent formatting", "Content clear"],
    defaultCommand: "ghostwire:code:format",
    promptAppend: "Apply consistent style and formatting to text content.",
  },
  {
    id: "resolver-pr",
    intent: "PR comment resolution specialist addressing code review feedback",
    role: "Reviewer",
    route: "do",
    tools: ["read", "edit", "search"],
    acceptanceChecks: ["Feedback addressed", "Changes implemented", "PR ready"],
    defaultCommand: "ghostwire:code:review",
    promptAppend: "Resolve code review comments systematically.",
  },
  {
    id: "reviewer-python",
    intent: "Python code review with strict conventions",
    role: "Reviewer",
    route: "do",
    tools: ["read", "search", "look_at"],
    acceptanceChecks: ["Code reviewed thoroughly", "Issues identified", "Recommendations clear"],
    defaultCommand: "ghostwire:code:review",
    promptAppend: "Review Python code with strict quality standards.",
  },
  {
    id: "reviewer-races",
    intent: "JavaScript and Stimulus race condition reviewer",
    role: "Reviewer",
    route: "do",
    tools: ["read", "search"],
    acceptanceChecks: ["Race conditions identified", "Fixes recommended", "Tests verified"],
    defaultCommand: "ghostwire:code:review",
    promptAppend: "Identify and resolve race conditions in JavaScript code.",
  },
  {
    id: "reviewer-rails",
    intent: "Rails code review with strict conventions",
    role: "Reviewer",
    route: "do",
    tools: ["read", "search", "look_at"],
    acceptanceChecks: ["Code reviewed thoroughly", "Standards applied", "Issues documented"],
    defaultCommand: "ghostwire:code:review",
    promptAppend: "Review Rails code with strict quality standards.",
  },
  {
    id: "reviewer-rails-dh",
    intent: "Brutally honest Rails code review from Rails creator philosophy",
    role: "Reviewer",
    route: "do",
    tools: ["read", "search"],
    acceptanceChecks: ["Review is honest", "Opinions justified", "Improvements clear"],
    defaultCommand: "ghostwire:code:review",
    promptAppend: "Provide opinionated Rails code review.",
  },
  {
    id: "reviewer-security",
    intent: "Security audits, vulnerability assessments, and security reviews",
    role: "Reviewer",
    route: "do",
    tools: ["read", "search", "look_at"],
    acceptanceChecks: ["Security assessed", "Vulnerabilities identified", "Fixes recommended"],
    defaultCommand: "ghostwire:code:review",
    promptAppend: "Conduct thorough security reviews identifying vulnerabilities.",
  },
  {
    id: "reviewer-simplicity",
    intent: "Final review pass to ensure code is as simple and minimal as possible",
    role: "Reviewer",
    route: "do",
    tools: ["read", "edit"],
    acceptanceChecks: ["Code simplified", "No unnecessary complexity", "YAGNI principles applied"],
    defaultCommand: "ghostwire:code:refactor",
    promptAppend: "Simplify code following YAGNI principles.",
  },
  {
    id: "reviewer-typescript",
    intent: "TypeScript code review with strict conventions",
    role: "Reviewer",
    route: "do",
    tools: ["read", "search", "look_at"],
    acceptanceChecks: ["Code reviewed thoroughly", "Types verified", "Best practices applied"],
    defaultCommand: "ghostwire:code:review",
    promptAppend: "Review TypeScript code with strict quality standards.",
  },

  // Implementation & Execution (5)
  {
    id: "executor",
    intent: "Focused task executor with strict todo discipline and verification",
    role: "Execution",
    route: "do",
    tools: ["edit", "task", "bash"],
    acceptanceChecks: ["Tasks completed", "Todos tracked", "Verification done"],
    defaultCommand: "ghostwire:workflows:work",
    promptAppend: "Execute tasks with discipline and verification.",
  },
  {
    id: "expert-migrations",
    intent: "Data migration and backfill expert validating ID mappings and data integrity",
    role: "Execution",
    route: "do",
    tools: ["read", "bash", "search"],
    acceptanceChecks: ["Migrations validated", "Data integrity verified", "Rollback safe"],
    defaultCommand: "ghostwire:project:deploy",
    promptAppend: "Execute migrations ensuring data integrity and safety.",
  },
  {
    id: "guardian-data",
    intent: "Database migration and data integrity expert",
    role: "Execution",
    route: "do",
    tools: ["read", "search", "bash"],
    acceptanceChecks: ["Migrations reviewed", "Constraints verified", "Integrity ensured"],
    defaultCommand: "ghostwire:project:deploy",
    promptAppend: "Guardian of database integrity and migration safety.",
  },
  {
    id: "operator",
    intent: "Primary operator agent that parses intent and coordinates work",
    role: "Execution",
    route: "do",
    tools: ["task", "delegate_task", "search"],
    acceptanceChecks: ["Intent understood", "Work coordinated", "Tasks delegated"],
    defaultCommand: "ghostwire:workflows:work",
    promptAppend: "Parse intent and coordinate work across teams.",
  },
  {
    id: "orchestrator",
    intent: "Orchestrates work via delegation to complete all tasks",
    role: "Execution",
    route: "do",
    tools: ["task", "delegate_task"],
    acceptanceChecks: ["All tasks completed", "Work orchestrated", "Verification done"],
    defaultCommand: "ghostwire:workflows:work",
    promptAppend: "Orchestrate and complete all assigned work.",
  },

  // Specialized (6)
  {
    id: "oracle-performance",
    intent: "Performance analysis and optimization specialist",
    role: "Specialized",
    route: "do",
    tools: ["read", "search", "bash"],
    acceptanceChecks: [
      "Performance analyzed",
      "Bottlenecks identified",
      "Optimizations recommended",
    ],
    defaultCommand: "ghostwire:code:optimize",
    promptAppend: "Analyze and optimize performance bottlenecks.",
  },
  {
    id: "validator-audit",
    intent: "Expert reviewer for evaluating work plans against clarity and completeness",
    role: "Specialized",
    route: "research",
    tools: ["read", "search"],
    acceptanceChecks: ["Plan clarity verified", "Completeness checked", "Feedback provided"],
    defaultCommand: "ghostwire:workflows:plan",
    promptAppend: "Validate work plans for clarity and completeness.",
  },
  {
    id: "validator-bugs",
    intent: "Bug reproduction and validation specialist",
    role: "Specialized",
    route: "do",
    tools: ["bash", "read", "task"],
    acceptanceChecks: ["Bug reproduced", "Steps documented", "Validation clear"],
    defaultCommand: "ghostwire:code:test",
    promptAppend: "Reproduce and validate bug reports systematically.",
  },
  {
    id: "validator-deployment",
    intent: "Create comprehensive pre/post-deploy checklists for production changes",
    role: "Specialized",
    route: "do",
    tools: ["read", "task", "search"],
    acceptanceChecks: ["Checklist complete", "Risks identified", "Go/No-Go clear"],
    defaultCommand: "ghostwire:project:deploy",
    promptAppend: "Create comprehensive deployment safety checklists.",
  },
  {
    id: "writer-gem",
    intent: "Write Ruby gems following Andrew Kane patterns",
    role: "Specialized",
    route: "do",
    tools: ["edit", "read"],
    acceptanceChecks: ["Gem well-written", "API clear", "Docs complete"],
    defaultCommand: "ghostwire:code:format",
    promptAppend: "Write high-quality Ruby gems with clear APIs.",
  },
  {
    id: "writer-readme",
    intent: "Create or update README files following best practices",
    role: "Specialized",
    route: "do",
    tools: ["edit", "read"],
    acceptanceChecks: ["README complete", "Instructions clear", "Examples provided"],
    defaultCommand: "ghostwire:docs:release-docs",
    promptAppend: "Write clear, comprehensive README documentation.",
  },
];

// ============================================================================
// AGENT CATALOG GENERATOR
// ============================================================================

export interface AgentCatalogByID {
  [agentId: string]: AgentProfileSpec;
}

export interface AgentCatalogByCategory {
  [category: string]: AgentProfileSpec[];
}

export interface AgentCatalogByRoute {
  [route: string]: AgentProfileSpec[];
}

export interface AgentCatalogByTool {
  [toolId: string]: AgentProfileSpec[];
}

export interface AgentCatalog {
  byId: AgentCatalogByID;
  byCategory: AgentCatalogByCategory;
  byRoute: AgentCatalogByRoute;
  byTool: AgentCatalogByTool;
  metadata: {
    totalCount: number;
    categories: Record<string, number>;
    routes: Record<string, number>;
    tools: Record<string, number>;
    validationTimestamp: string;
    digest: string;
  };
}

export async function generateAgentCatalog(): Promise<AgentCatalog> {
  // Validate all agents
  const validation = validateAgentProfileSpecList(AGENT_DEFINITIONS);

  // Collect all valid agents and format errors properly
  const agents: AgentProfileSpec[] = [];
  const validationErrors: Array<{ index: number; message: string }> = [];

  for (const item of validation) {
    if (item.isValid && item.spec) {
      agents.push(item.spec);
    } else {
      validationErrors.push({
        index: item.index,
        message: item.errors.join("; "),
      });
    }
  }

  if (validationErrors.length > 0) {
    const errorSummary = validationErrors
      .map((err) => `[index ${err.index}] ${err.message}`)
      .join("\n");
    throw new Error(`Agent validation failed:\n${errorSummary}`);
  }

  // Detect duplicates
  const duplicates = detectDuplicateAgentIds(agents);
  if (duplicates.length > 0) {
    throw new Error(`Duplicate agent IDs detected: ${duplicates.map((d) => d.id).join(", ")}`);
  }

  // Build indexes
  const byId: AgentCatalogByID = {};
  const byCategory: AgentCatalogByCategory = {};
  const byRoute: AgentCatalogByRoute = {};
  const byTool: AgentCatalogByTool = {};

  const sorted = [...agents].sort((a, b) => a.id.localeCompare(b.id));

  for (const agent of sorted) {
    byId[agent.id] = agent;

    // Category index
    if (!byCategory[agent.category]) {
      byCategory[agent.category] = [];
    }
    byCategory[agent.category].push(agent);

    // Route index
    if (!byRoute[agent.route]) {
      byRoute[agent.route] = [];
    }
    byRoute[agent.route].push(agent);

    // Tool index
    for (const tool of agent.defaultTools) {
      if (!byTool[tool]) {
        byTool[tool] = [];
      }
      byTool[tool].push(agent);
    }
  }

  // Compute digest
  const catalogJson = JSON.stringify(
    { agents: sorted.map((agent) => serializeAgentProfileSpec(agent)) },
    null,
    2,
  );
  const catalogDigest = await digestCatalogJson(catalogJson);

  // Build metadata
  const categoryCounts: Record<string, number> = {};
  const routeCounts: Record<string, number> = {};
  const toolCounts: Record<string, number> = {};

  for (const [cat, agts] of Object.entries(byCategory)) {
    categoryCounts[cat] = agts.length;
  }
  for (const [route, agts] of Object.entries(byRoute)) {
    routeCounts[route] = agts.length;
  }
  for (const [tool, agts] of Object.entries(byTool)) {
    toolCounts[tool] = agts.length;
  }

  return {
    byId,
    byCategory,
    byRoute,
    byTool,
    metadata: {
      totalCount: agents.length,
      categories: categoryCounts,
      routes: routeCounts,
      tools: toolCounts,
      validationTimestamp: new Date().toISOString(),
      digest: catalogDigest,
    },
  };
}

async function digestCatalogJson(json: string): Promise<string> {
  if (typeof globalThis !== "undefined" && "crypto" in globalThis) {
    const encoder = new TextEncoder();
    const data = encoder.encode(json);
    const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  return "digest-not-available";
}

export function lookupAgentById(
  catalog: AgentCatalog,
  agentId: string,
): AgentProfileSpec | undefined {
  return catalog.byId[agentId];
}

export function getAgentsByCategory(catalog: AgentCatalog, category: string): AgentProfileSpec[] {
  return catalog.byCategory[category] ?? [];
}

export function getAgentsByRoute(catalog: AgentCatalog, route: string): AgentProfileSpec[] {
  return catalog.byRoute[route] ?? [];
}

export function getAgentsByTool(catalog: AgentCatalog, tool: string): AgentProfileSpec[] {
  return catalog.byTool[tool] ?? [];
}

export function getAgentsByIntent(catalog: AgentCatalog, ...intents: string[]): AgentProfileSpec[] {
  const intentSet = new Set(intents);
  const result = new Set<AgentProfileSpec>();

  for (const tool of intents) {
    for (const agent of getAgentsByTool(catalog, tool)) {
      result.add(agent);
    }
  }

  return Array.from(result).sort((a, b) => a.id.localeCompare(b.id));
}
