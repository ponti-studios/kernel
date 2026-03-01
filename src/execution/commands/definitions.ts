/**
 * Command Definitions & Generator
 *
 * Complete set of 32 CommandIntentSpec instances with deterministic indexing.
 * Validates, dedups, and produces catalogs for all command operations.
 */

import {
  validateCommandIntentSpecList,
  detectDuplicateCommandIds,
  serializeCommandIntentSpec,
  type CommandIntentSpec,
} from "../intents";

// ============================================================================
// COMMAND DEFINITIONS (32 total)
// ============================================================================

export const COMMAND_DEFINITIONS: CommandIntentSpec[] = [
  // Code Commands (7)
  {
    id: "ghostwire:code:format",
    description: "Apply consistent formatting and style standards",
    argsSchema: {
      type: "object",
      properties: {
        paths: { type: "array", items: { type: "string" } },
        style: { type: "string", enum: ["prettier", "eslint", "internal"] },
      },
      required: ["paths"],
    },
    acceptanceChecks: [
      "Files are formatted according to project standards",
      "No functional code changes introduced",
    ],
    defaultRoute: "direct",
    lifecycleHints: { phase: "continuous", dependency: "ghostwire:project:build" },
  },
  {
    id: "ghostwire:code:optimize",
    description: "Improve performance, reduce bundle size, or enhance efficiency",
    argsSchema: {
      type: "object",
      properties: {
        target: { type: "string", enum: ["bundle", "runtime", "memory"] },
        threshold: { type: "number" },
      },
      required: ["target"],
    },
    acceptanceChecks: [
      "Performance improvement quantified with metrics",
      "No degradation in other metrics",
      "Changes reviewed and tested",
    ],
    defaultRoute: "oracle_performance",
    lifecycleHints: { phase: "optimization", impact: "high" },
  },
  {
    id: "ghostwire:code:refactor",
    description: "Systematically refactor code while maintaining functionality",
    argsSchema: {
      type: "object",
      properties: {
        scope: { type: "string" },
        pattern: { type: "string" },
        preserveAPI: { type: "boolean", default: true },
      },
      required: ["scope"],
    },
    acceptanceChecks: [
      "All tests pass after refactoring",
      "External API unchanged (if preserveAPI=true)",
      "Code quality metrics improved",
    ],
    defaultRoute: "reviewer_typescript",
    lifecycleHints: { phase: "maintenance" },
  },
  {
    id: "ghostwire:code:review",
    description: "Conduct comprehensive code reviews with specialist agents",
    argsSchema: {
      type: "object",
      properties: {
        reviewType: { type: "string", enum: ["full", "security", "performance", "style"] },
        focus: { type: "array", items: { type: "string" } },
      },
      required: ["reviewType"],
    },
    acceptanceChecks: [
      "All review comments documented",
      "Critical issues identified and prioritized",
      "Recommendations actionable",
    ],
    defaultRoute: "reviewer_typescript",
    lifecycleHints: { phase: "continuous" },
  },
  {
    id: "ghostwire:code:lint",
    description: "Code linting and style checks",
    argsSchema: {
      type: "object",
      properties: {
        language: { type: "string", enum: ["typescript", "javascript", "ruby", "all"] },
        fix: { type: "boolean", default: false },
      },
    },
    acceptanceChecks: ["All linting rules run without errors", "Issues categorized by severity"],
    defaultRoute: "direct",
    lifecycleHints: { phase: "continuous" },
  },
  {
    id: "ghostwire:code:optimize-bundle",
    description: "Optimize bundle size",
    argsSchema: {
      type: "object",
      properties: {
        target: { type: "number" },
        includeVendor: { type: "boolean", default: false },
      },
    },
    acceptanceChecks: ["Bundle size reduced or target met", "No critical dependencies removed"],
    defaultRoute: "oracle_performance",
    lifecycleHints: { phase: "optimization" },
  },
  {
    id: "ghostwire:code:test",
    description: "Run test suite",
    argsSchema: {
      type: "object",
      properties: {
        suites: { type: "array", items: { type: "string" } },
        coverage: { type: "boolean", default: false },
      },
    },
    acceptanceChecks: ["All specified test suites execute", "Results clearly reported"],
    defaultRoute: "direct",
    lifecycleHints: { phase: "continuous" },
  },

  // Documentation Commands (4)
  {
    id: "ghostwire:docs:deploy-docs",
    description: "Build and deploy documentation to hosting",
    argsSchema: {
      type: "object",
      properties: {
        environment: { type: "string", enum: ["staging", "production"] },
        version: { type: "string" },
      },
      required: ["environment"],
    },
    acceptanceChecks: [
      "Documentation builds without errors",
      "Deployment succeeds to specified environment",
      "All links and assets accessible",
    ],
    defaultRoute: "direct",
    lifecycleHints: { phase: "release", impact: "high" },
  },
  {
    id: "ghostwire:docs:feature-video",
    description: "Create demonstration video for feature",
    argsSchema: {
      type: "object",
      properties: {
        feature: { type: "string" },
        format: { type: "string", enum: ["mp4", "webm", "gif"] },
        duration: { type: "number" },
      },
      required: ["feature"],
    },
    acceptanceChecks: [
      "Video demonstrates feature clearly",
      "Audio quality acceptable",
      "File format matches specification",
    ],
    defaultRoute: "direct",
    lifecycleHints: { phase: "documentation" },
  },
  {
    id: "ghostwire:docs:release-docs",
    description: "Create versioned documentation release",
    argsSchema: {
      type: "object",
      properties: {
        version: { type: "string" },
        sections: { type: "array", items: { type: "string" } },
        includeChangelog: { type: "boolean", default: true },
      },
      required: ["version"],
    },
    acceptanceChecks: [
      "Documentation version is valid semver",
      "All referenced sections present",
      "Changelog generated automatically or verified manually",
    ],
    defaultRoute: "editor_style",
    lifecycleHints: { phase: "release", impact: "high" },
  },
  {
    id: "ghostwire:docs:test-browser",
    description: "Test documentation in browser environment",
    argsSchema: {
      type: "object",
      properties: {
        browsers: { type: "array", items: { type: "string" } },
        focusPath: { type: "string" },
      },
    },
    acceptanceChecks: [
      "Documentation renders correctly in all target browsers",
      "All interactive elements function",
      "Performance metrics acceptable",
    ],
    defaultRoute: "designer_iterator",
    lifecycleHints: { phase: "testing" },
  },

  // Git Commands (4)
  {
    id: "ghostwire:git:branch",
    description: "Create and manage feature branches with naming conventions",
    argsSchema: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["create", "list", "delete"] },
        name: { type: "string" },
        baseRef: { type: "string", default: "main" },
      },
      required: ["action"],
    },
    acceptanceChecks: [
      "Branch naming conventions followed",
      "Base reference exists and is valid",
      "No conflicts with existing branches",
    ],
    defaultRoute: "direct",
    lifecycleHints: { phase: "development" },
  },
  {
    id: "ghostwire:git:cleanup",
    description: "Remove stale branches and optimize repository",
    argsSchema: {
      type: "object",
      properties: {
        dryRun: { type: "boolean", default: true },
        staleDays: { type: "number", default: 30 },
      },
    },
    acceptanceChecks: [
      "Cleanup is safe and non-destructive",
      "Stale branches correctly identified",
      "Important branches preserved",
    ],
    defaultRoute: "direct",
    lifecycleHints: { phase: "maintenance" },
  },
  {
    id: "ghostwire:git:merge",
    description: "Merge branches safely with conflict resolution",
    argsSchema: {
      type: "object",
      properties: {
        source: { type: "string" },
        target: { type: "string", default: "main" },
        strategy: { type: "string", enum: ["auto", "manual", "squash"] },
      },
      required: ["source"],
    },
    acceptanceChecks: [
      "Branch references are valid",
      "No unresolved conflicts",
      "Tests pass after merge",
      "Commit message is clear",
    ],
    defaultRoute: "direct",
    lifecycleHints: { phase: "integration", impact: "high" },
  },
  {
    id: "ghostwire:git:smart-commit",
    description: "Generate well-structured commits following conventions",
    argsSchema: {
      type: "object",
      properties: {
        staged: { type: "boolean", default: true },
        type: { type: "string", enum: ["feat", "fix", "refactor", "docs", "test", "chore"] },
        scope: { type: "string" },
      },
    },
    acceptanceChecks: [
      "Commit follows conventional commits format",
      "Message is descriptive and clear",
      "Related code changes are included",
    ],
    defaultRoute: "direct",
    lifecycleHints: { phase: "development" },
  },

  // Linting Commands (1)
  {
    id: "ghostwire:lint:ruby",
    description: "Run linting and code quality checks on Ruby and ERB files",
    argsSchema: {
      type: "object",
      properties: {
        paths: { type: "array", items: { type: "string" } },
        fix: { type: "boolean", default: false },
      },
    },
    acceptanceChecks: [
      "All Ruby files validated",
      "Linting rules applied correctly",
      "Issues categorized and reported",
    ],
    defaultRoute: "direct",
    lifecycleHints: { phase: "continuous" },
  },

  // Project Commands (9)
  {
    id: "ghostwire:project:build",
    description: "Compile, transpile, and bundle project code",
    argsSchema: {
      type: "object",
      properties: {
        target: { type: "string", enum: ["development", "staging", "production"] },
        clean: { type: "boolean", default: false },
        watch: { type: "boolean", default: false },
      },
    },
    acceptanceChecks: [
      "Build completes without errors",
      "Output artifacts created",
      "Build time within acceptable threshold",
    ],
    defaultRoute: "direct",
    lifecycleHints: { phase: "build", impact: "high" },
  },
  {
    id: "ghostwire:project:constitution",
    description: "Create or update project constitution with core principles",
    argsSchema: {
      type: "object",
      properties: {
        sections: { type: "array", items: { type: "string" } },
        includeExamples: { type: "boolean", default: true },
      },
    },
    acceptanceChecks: [
      "Constitution document is clear and comprehensive",
      "All principles are actionable",
      "Examples are relevant and correct",
    ],
    defaultRoute: "planner",
    lifecycleHints: { phase: "planning" },
  },
  {
    id: "ghostwire:project:deploy",
    description: "Deploy project to specified environment",
    argsSchema: {
      type: "object",
      properties: {
        environment: { type: "string", enum: ["staging", "production"] },
        version: { type: "string" },
        dryRun: { type: "boolean", default: false },
      },
      required: ["environment"],
    },
    acceptanceChecks: [
      "Deployment target is valid",
      "All prerequisites met",
      "Health checks pass after deployment",
      "Rollback procedure documented",
    ],
    defaultRoute: "operator",
    lifecycleHints: { phase: "release", impact: "critical" },
  },
  {
    id: "ghostwire:project:init",
    description: "Initialize new project with structure and tooling",
    argsSchema: {
      type: "object",
      properties: {
        template: { type: "string" },
        scope: { type: "string" },
        directories: { type: "array", items: { type: "string" } },
      },
      required: ["template"],
    },
    acceptanceChecks: [
      "Project structure created",
      "All tooling installed and configured",
      "Initial tests pass",
    ],
    defaultRoute: "direct",
    lifecycleHints: { phase: "initialization", impact: "high" },
  },
  {
    id: "ghostwire:project:map",
    description: "Map and visualize project structure",
    argsSchema: {
      type: "object",
      properties: {
        depth: { type: "number", default: 3 },
        format: { type: "string", enum: ["tree", "graph", "json"] },
        excludePatterns: { type: "array", items: { type: "string" } },
      },
    },
    acceptanceChecks: [
      "Project structure is clearly visualized",
      "All key directories included",
      "Output is readable and informative",
    ],
    defaultRoute: "researcher_repo",
    lifecycleHints: { phase: "investigation" },
  },
  {
    id: "ghostwire:project:topology",
    description: "Display project structure and dependency graph",
    argsSchema: {
      type: "object",
      properties: {
        includeDevDependencies: { type: "boolean", default: false },
        outputFormat: { type: "string", enum: ["text", "json", "dot"] },
      },
    },
    acceptanceChecks: [
      "Dependency graph is accurate",
      "All dependencies listed",
      "Circular dependencies identified",
    ],
    defaultRoute: "researcher_repo",
    lifecycleHints: { phase: "investigation" },
  },

  // Utility Commands (3)
  {
    id: "ghostwire:util:backup",
    description: "Create project backup",
    argsSchema: {
      type: "object",
      properties: {
        location: { type: "string" },
        includeNodeModules: { type: "boolean", default: false },
        compression: { type: "boolean", default: true },
      },
    },
    acceptanceChecks: [
      "Backup created successfully",
      "All essential files included",
      "Backup size is reasonable",
    ],
    defaultRoute: "direct",
    lifecycleHints: { phase: "maintenance" },
  },
  {
    id: "ghostwire:util:doctor",
    description: "Diagnose project health",
    argsSchema: {
      type: "object",
      properties: {
        verbose: { type: "boolean", default: false },
        checks: { type: "array", items: { type: "string" } },
      },
    },
    acceptanceChecks: [
      "All health checks executed",
      "Issues clearly categorized",
      "Remediation steps provided",
    ],
    defaultRoute: "direct",
    lifecycleHints: { phase: "maintenance" },
  },
  {
    id: "ghostwire:util:restore",
    description: "Restore from backup",
    argsSchema: {
      type: "object",
      properties: {
        backupLocation: { type: "string" },
        targetPath: { type: "string", default: "./" },
        verify: { type: "boolean", default: true },
      },
      required: ["backupLocation"],
    },
    acceptanceChecks: [
      "Backup file is valid",
      "Restoration completes without errors",
      "All files restored correctly",
      "Project remains functional",
    ],
    defaultRoute: "direct",
    lifecycleHints: { phase: "recovery", impact: "high" },
  },

  // Work Loop Commands (1)
  {
    id: "ghostwire:work:loop",
    description: "Work loop for continuous task execution",
    argsSchema: {
      type: "object",
      properties: {
        interval: { type: "number", default: 300 },
        maxIterations: { type: "number" },
        stopCondition: { type: "string" },
      },
    },
    acceptanceChecks: [
      "Loop executes as specified",
      "Stop condition is evaluated correctly",
      "No resource leaks",
    ],
    defaultRoute: "orchestrator",
    lifecycleHints: { phase: "execution", isLongRunning: true },
  },

  // Workflow Commands (6) - High Priority
  {
    id: "ghostwire:workflows:brainstorm",
    description: "Brainstorm ideas and generate options",
    argsSchema: {
      type: "object",
      properties: {
        topic: { type: "string" },
        constraints: { type: "array", items: { type: "string" } },
        optionCount: { type: "number", default: 5 },
      },
      required: ["topic"],
    },
    acceptanceChecks: [
      "Ideas are relevant to topic",
      "Options respect constraints",
      "Ideas are documented clearly",
      "Options are actionable",
    ],
    defaultRoute: "planner",
    lifecycleHints: { phase: "planning", priority: "high" },
  },
  {
    id: "ghostwire:workflows:complete",
    description: "Mark workflow as complete",
    argsSchema: {
      type: "object",
      properties: {
        workflowId: { type: "string" },
        summary: { type: "string" },
        artifacts: { type: "array", items: { type: "string" } },
      },
      required: ["workflowId"],
    },
    acceptanceChecks: [
      "Workflow status is updated to complete",
      "Summary is clear and accurate",
      "All artifacts are documented",
    ],
    defaultRoute: "direct",
    lifecycleHints: { phase: "completion" },
  },
  {
    id: "ghostwire:workflows:plan",
    description: "Plan comprehensive solution",
    argsSchema: {
      type: "object",
      properties: {
        objective: { type: "string" },
        constraints: { type: "array", items: { type: "string" } },
        timeframe: { type: "string" },
      },
      required: ["objective"],
    },
    acceptanceChecks: [
      "Plan is comprehensive and detailed",
      "All constraints are addressed",
      "Steps are sequenced logically",
      "Success criteria are clear",
    ],
    defaultRoute: "planner",
    lifecycleHints: { phase: "planning", priority: "high" },
  },
  {
    id: "ghostwire:workflows:review",
    description: "Review and iterate on work",
    argsSchema: {
      type: "object",
      properties: {
        workId: { type: "string" },
        reviewAspects: { type: "array", items: { type: "string" } },
        improvementTarget: { type: "number" },
      },
      required: ["workId"],
    },
    acceptanceChecks: [
      "All review aspects are addressed",
      "Feedback is actionable",
      "Improvement areas are prioritized",
    ],
    defaultRoute: "reviewer_typescript",
    lifecycleHints: { phase: "review", priority: "high" },
  },
  {
    id: "ghostwire:workflows:status",
    description: "Show current workflow status",
    argsSchema: {
      type: "object",
      properties: { workflowId: { type: "string" }, verbose: { type: "boolean", default: false } },
    },
    acceptanceChecks: [
      "Status is accurate and current",
      "All relevant details included",
      "Output is clearly formatted",
    ],
    defaultRoute: "direct",
    lifecycleHints: { phase: "investigation" },
  },
  {
    id: "ghostwire:workflows:work",
    description: "Execute workflow and drive work",
    argsSchema: {
      type: "object",
      properties: {
        workflowId: { type: "string" },
        focusArea: { type: "string" },
        autonomy: {
          type: "string",
          enum: ["manual", "assisted", "autonomous"],
          default: "assisted",
        },
      },
      required: ["workflowId"],
    },
    acceptanceChecks: [
      "Workflow executes without errors",
      "Progress is visible and trackable",
      "All tasks are completed",
      "Autonomy level is respected",
    ],
    defaultRoute: "executor",
    lifecycleHints: { phase: "execution", priority: "high", isLongRunning: true },
  },
];

// ============================================================================
// COMMAND CATALOG GENERATOR
// ============================================================================

export interface CommandCatalogByID {
  [commandId: string]: CommandIntentSpec;
}

export interface CommandCatalogByCategory {
  [category: string]: CommandIntentSpec[];
}

export interface CommandCatalog {
  byId: CommandCatalogByID;
  byCategory: CommandCatalogByCategory;
  p1Commands: Set<string>;
  metadata: {
    totalCount: number;
    categories: Record<string, number>;
    validationTimestamp: string;
    digest: string;
  };
}

export async function generateCommandCatalog(): Promise<CommandCatalog> {
  // Validate all commands
  const validation = validateCommandIntentSpecList(COMMAND_DEFINITIONS);

  if (validation.errors.length > 0) {
    const errorSummary = validation.errors
      .map((err) => `[index ${err.index}] ${err.message}`)
      .join("\n");
    throw new Error(`Command validation failed:\n${errorSummary}`);
  }

  const commands = validation.valid;

  // Detect duplicates
  const duplicates = detectDuplicateCommandIds(commands);
  if (duplicates.length > 0) {
    throw new Error(`Duplicate command IDs detected: ${duplicates.map((d) => d.id).join(", ")}`);
  }

  // Build indexes
  const byId: CommandCatalogByID = {};
  const byCategory: CommandCatalogByCategory = {};
  const sorted = [...commands].sort((a, b) => a.id.localeCompare(b.id));

  for (const cmd of sorted) {
    byId[cmd.id] = cmd;
    const category = cmd.id.split(":").slice(0, 2).join(":");
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category].push(cmd);
  }

  // P1 commands
  const p1CommandIds = [
    "ghostwire:workflows:plan",
    "ghostwire:workflows:work",
    "ghostwire:workflows:review",
    "ghostwire:code:review",
    "ghostwire:code:refactor",
    "ghostwire:project:map",
  ];
  const p1Commands = new Set(p1CommandIds);

  // Compute digest
  const catalogJson = JSON.stringify(
    { commands: sorted.map((cmd) => serializeCommandIntentSpec(cmd)) },
    null,
    2,
  );
  const catalogDigest = await digestCatalogJson(catalogJson);

  // Build metadata
  const categoryCounts: Record<string, number> = {};
  for (const [category, cmds] of Object.entries(byCategory)) {
    categoryCounts[category] = cmds.length;
  }

  return {
    byId,
    byCategory: Object.entries(byCategory).reduce((acc, [cat, cmds]) => {
      acc[cat] = cmds;
      return acc;
    }, {} as CommandCatalogByCategory),
    p1Commands,
    metadata: {
      totalCount: commands.length,
      categories: categoryCounts,
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

export function lookupCommandById(
  catalog: CommandCatalog,
  commandId: string,
): CommandIntentSpec | undefined {
  return catalog.byId[commandId];
}

export function getCommandsByCategory(
  catalog: CommandCatalog,
  category: string,
): CommandIntentSpec[] {
  return catalog.byCategory[category] ?? [];
}

export function isP1Command(catalog: CommandCatalog, commandId: string): boolean {
  return catalog.p1Commands.has(commandId);
}

export function getP1Commands(catalog: CommandCatalog): CommandIntentSpec[] {
  const p1 = [];
  for (const id of catalog.p1Commands) {
    const cmd = lookupCommandById(catalog, id);
    if (cmd) p1.push(cmd);
  }
  return p1.sort((a, b) => a.id.localeCompare(b.id));
}
