import { describe, it, expect } from "bun:test";
import {
  executionPlanSchema,
  type ExecutionPlan,
  validateExecutionPlan,
  validateExecutionPlanList,
  detectDuplicateExecutionPlanIds,
  serializeExecutionPlan,
  digestExecutionPlan,
  isExecutionPlanValid,
  canAccessTool,
  countGrantedTools,
} from "./schema";

describe("ExecutionPlan Schema", () => {
  const now = new Date().toISOString();
  const future = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

  const validResolvedTools = {
    read: "granted" as const,
    search: "granted" as const,
    edit: "denied" as const,
    bash: "denied" as const,
    web: "conditional" as const,
    delegate_task: "granted" as const,
    look_at: "denied" as const,
    task: "denied" as const,
  };

  // ============================================================================
  // Valid Instances
  // ============================================================================

  it("should accept minimal valid execution plan", () => {
    const plan = {
      id: "ghostwire:workflows:plan::planner::advisor-architecture",
      commandId: "ghostwire:workflows:plan",
      profileId: "planner",
      assetId: "advisor-architecture",
      route: "do" as const,
      resolvedTools: validResolvedTools,
      promptContent:
        "Provide high-rigor planning and debugging reasoning with deterministic validation",
      createdAt: now,
    };
    const result = validateExecutionPlan(plan);
    expect(result.success).toBe(true);
  });

  it("should accept plan with all fields including optional", () => {
    const plan: ExecutionPlan = {
      id: "ghostwire:code:review::reviewer_typescript::advisor-architecture",
      commandId: "ghostwire:code:review",
      profileId: "reviewer_typescript",
      assetId: "advisor-architecture",
      route: "do",
      resolvedTools: validResolvedTools,
      promptContent:
        "Review TypeScript code for correctness and maintainability following strict conventions",
      args: { filePath: "src/index.ts", checkTypes: true },
      createdAt: now,
      expiresAt: future,
      metadata: {
        adapterHints: { adapter: "claude-code", timeout: 30000 },
        executionContext: { sessionId: "session-123" },
        retryPolicy: { maxRetries: 3, backoffMs: 1000 },
      },
    };
    const result = validateExecutionPlan(plan);
    expect(result.success).toBe(true);
  });

  it("should accept research route plan", () => {
    const plan = {
      id: "ghostwire:workflows:plan::researcher_docs::external-best-practices",
      commandId: "ghostwire:workflows:plan",
      profileId: "researcher_docs",
      assetId: "external-best-practices",
      route: "research" as const,
      resolvedTools: validResolvedTools,
      promptContent: "Gather official documentation and best-practice references",
      createdAt: now,
    };
    const result = validateExecutionPlan(plan);
    expect(result.success).toBe(true);
  });

  it("should accept plan with different tool permission combinations", () => {
    const tools = {
      read: "granted" as const,
      search: "conditional" as const,
      edit: "denied" as const,
      bash: "denied" as const,
      web: "granted" as const,
      delegate_task: "granted" as const,
      look_at: "conditional" as const,
      task: "denied" as const,
    };
    const plan = {
      id: "ghostwire:workflows:work::executor::executor-guidance",
      commandId: "ghostwire:workflows:work",
      profileId: "executor",
      assetId: "executor-guidance",
      route: "do" as const,
      resolvedTools: tools,
      promptContent: "Execute with strict verification discipline",
      createdAt: now,
    };
    const result = validateExecutionPlan(plan);
    expect(result.success).toBe(true);
  });

  // ============================================================================
  // Invalid Instances
  // ============================================================================

  it("should reject plan missing id", () => {
    const plan = {
      commandId: "ghostwire:workflows:plan",
      profileId: "planner",
      assetId: "advisor-architecture",
      route: "do" as const,
      resolvedTools: validResolvedTools,
      promptContent: "Planning guidance",
      createdAt: now,
    };
    const result = validateExecutionPlan(plan as any);
    expect(result.success).toBe(false);
  });

  it("should reject id with invalid format (missing double colons)", () => {
    const plan = {
      id: "ghostwire:workflows:plan-planner-advisor-architecture",
      commandId: "ghostwire:workflows:plan",
      profileId: "planner",
      assetId: "advisor-architecture",
      route: "do" as const,
      resolvedTools: validResolvedTools,
      promptContent: "Planning guidance",
      createdAt: now,
    };
    const result = validateExecutionPlan(plan);
    expect(result.success).toBe(false);
  });

  it("should reject empty commandId", () => {
    const plan = {
      id: "ghostwire:workflows:plan::planner::advisor-architecture",
      commandId: "",
      profileId: "planner",
      assetId: "advisor-architecture",
      route: "do" as const,
      resolvedTools: validResolvedTools,
      promptContent: "Planning guidance",
      createdAt: now,
    };
    const result = validateExecutionPlan(plan);
    expect(result.success).toBe(false);
  });

  it("should reject invalid route", () => {
    const plan = {
      id: "ghostwire:workflows:plan::planner::advisor-architecture",
      commandId: "ghostwire:workflows:plan",
      profileId: "planner",
      assetId: "advisor-architecture",
      route: "invalid" as any,
      resolvedTools: validResolvedTools,
      promptContent: "Planning guidance",
      createdAt: now,
    };
    const result = validateExecutionPlan(plan);
    expect(result.success).toBe(false);
  });

  it("should reject invalid tool permission", () => {
    const invalidTools = {
      ...validResolvedTools,
      read: "invalid" as any,
    };
    const plan = {
      id: "ghostwire:workflows:plan::planner::advisor-architecture",
      commandId: "ghostwire:workflows:plan",
      profileId: "planner",
      assetId: "advisor-architecture",
      route: "do" as const,
      resolvedTools: invalidTools,
      promptContent: "Planning guidance",
      createdAt: now,
    };
    const result = validateExecutionPlan(plan);
    expect(result.success).toBe(false);
  });

  it("should reject promptContent too short", () => {
    const plan = {
      id: "ghostwire:workflows:plan::planner::advisor-architecture",
      commandId: "ghostwire:workflows:plan",
      profileId: "planner",
      assetId: "advisor-architecture",
      route: "do" as const,
      resolvedTools: validResolvedTools,
      promptContent: "Short",
      createdAt: now,
    };
    const result = validateExecutionPlan(plan);
    expect(result.success).toBe(false);
  });

  it("should reject invalid datetime in createdAt", () => {
    const plan = {
      id: "ghostwire:workflows:plan::planner::advisor-architecture",
      commandId: "ghostwire:workflows:plan",
      profileId: "planner",
      assetId: "advisor-architecture",
      route: "do" as const,
      resolvedTools: validResolvedTools,
      promptContent: "Planning guidance text",
      createdAt: "2025-01-01",
    };
    const result = validateExecutionPlan(plan);
    expect(result.success).toBe(false);
  });

  it("should reject invalid datetime in expiresAt", () => {
    const plan = {
      id: "ghostwire:workflows:plan::planner::advisor-architecture",
      commandId: "ghostwire:workflows:plan",
      profileId: "planner",
      assetId: "advisor-architecture",
      route: "do" as const,
      resolvedTools: validResolvedTools,
      promptContent: "Planning guidance text",
      createdAt: now,
      expiresAt: "2025-01-01",
    };
    const result = validateExecutionPlan(plan);
    expect(result.success).toBe(false);
  });

  // ============================================================================
  // Deterministic Serialization
  // ============================================================================

  it("should produce stable JSON serialization", () => {
    const plan: ExecutionPlan = {
      id: "ghostwire:workflows:plan::planner::advisor-architecture",
      commandId: "ghostwire:workflows:plan",
      profileId: "planner",
      assetId: "advisor-architecture",
      route: "do",
      resolvedTools: validResolvedTools,
      promptContent: "This is planned guidance for architecture validation",
      createdAt: now,
    };
    const ser1 = serializeExecutionPlan(plan);
    const ser2 = serializeExecutionPlan(plan);
    expect(ser1).toBe(ser2);
  });

  it("should round-trip correctly through parse", () => {
    const plan: ExecutionPlan = {
      id: "ghostwire:code:review::reviewer_typescript::advisor-architecture",
      commandId: "ghostwire:code:review",
      profileId: "reviewer_typescript",
      assetId: "advisor-architecture",
      route: "do",
      resolvedTools: validResolvedTools,
      promptContent: "Review code for TypeScript correctness and style",
      args: { filePath: "src/index.ts" },
      createdAt: now,
      expiresAt: future,
    };

    const serialized = serializeExecutionPlan(plan);
    const parsed = JSON.parse(serialized);
    const validated = validateExecutionPlan(parsed);
    expect(validated.success).toBe(true);
    if (validated.success) {
      expect(validated.data.id).toBe(plan.id);
      expect(validated.data.profileId).toBe(plan.profileId);
    }
  });

  // ============================================================================
  // Digest Functions
  // ============================================================================

  it("should produce stable digest for same plan", async () => {
    const plan: ExecutionPlan = {
      id: "ghostwire:workflows:plan::planner::advisor-architecture",
      commandId: "ghostwire:workflows:plan",
      profileId: "planner",
      assetId: "advisor-architecture",
      route: "do",
      resolvedTools: validResolvedTools,
      promptContent: "Planning guidance for architecture",
      createdAt: now,
    };
    const digest1 = await digestExecutionPlan(plan);
    const digest2 = await digestExecutionPlan(plan);
    expect(digest1).toBe(digest2);
  });

  it("should produce different digest when promptContent changes", async () => {
    const plan1: ExecutionPlan = {
      id: "ghostwire:workflows:plan::planner::advisor-architecture",
      commandId: "ghostwire:workflows:plan",
      profileId: "planner",
      assetId: "advisor-architecture",
      route: "do",
      resolvedTools: validResolvedTools,
      promptContent: "Planning guidance version 1",
      createdAt: now,
    };

    const plan2: ExecutionPlan = {
      ...plan1,
      promptContent: "Planning guidance version 2",
    };

    const digest1 = await digestExecutionPlan(plan1);
    const digest2 = await digestExecutionPlan(plan2);
    expect(digest1).not.toBe(digest2);
  });

  // ============================================================================
  // Batch Validation
  // ============================================================================

  it("should validate list with all valid plans", () => {
    const plans = [
      {
        id: "ghostwire:workflows:plan::planner::plan-one",
        commandId: "ghostwire:workflows:plan",
        profileId: "planner",
        assetId: "plan-one",
        route: "do" as const,
        resolvedTools: validResolvedTools,
        promptContent: "First valid plan prompt content",
        createdAt: now,
      },
      {
        id: "ghostwire:code:review::reviewer_typescript::review-one",
        commandId: "ghostwire:code:review",
        profileId: "reviewer_typescript",
        assetId: "review-one",
        route: "do" as const,
        resolvedTools: validResolvedTools,
        promptContent: "Second valid review plan prompt content",
        createdAt: now,
      },
    ];
    const results = validateExecutionPlanList(plans);
    expect(results.length).toBe(2);
    expect(results.every((r) => r.isValid)).toBe(true);
  });

  it("should report per-item errors in batch validation", () => {
    const plans = [
      {
        id: "ghostwire:workflows:plan::planner::valid-plan",
        commandId: "ghostwire:workflows:plan",
        profileId: "planner",
        assetId: "valid-plan",
        route: "do" as const,
        resolvedTools: validResolvedTools,
        promptContent: "Valid plan with proper content length",
        createdAt: now,
      },
      {
        id: "invalid",
        commandId: "ghostwire:code:review",
        profileId: "reviewer_typescript",
        assetId: "invalid-plan",
        route: "do" as const,
        resolvedTools: validResolvedTools,
        promptContent: "Short",
        createdAt: now,
      },
    ];
    const results = validateExecutionPlanList(plans as unknown[]);
    expect(results[0].isValid).toBe(true);
    expect(results[1].isValid).toBe(false);
    expect(results[1].errors.length).toBeGreaterThan(0);
  });

  // ============================================================================
  // Duplicate Detection
  // ============================================================================

  it("should detect duplicate execution plan IDs", () => {
    const plans: ExecutionPlan[] = [
      {
        id: "ghostwire:workflows:plan::planner::advisor-architecture",
        commandId: "ghostwire:workflows:plan",
        profileId: "planner",
        assetId: "advisor-architecture",
        route: "do",
        resolvedTools: validResolvedTools,
        promptContent: "First plan with this composition",
        createdAt: now,
      },
      {
        id: "ghostwire:code:review::reviewer_typescript::advisor-architecture",
        commandId: "ghostwire:code:review",
        profileId: "reviewer_typescript",
        assetId: "advisor-architecture",
        route: "do",
        resolvedTools: validResolvedTools,
        promptContent: "Different plan composition",
        createdAt: now,
      },
      {
        id: "ghostwire:workflows:plan::planner::advisor-architecture",
        commandId: "ghostwire:workflows:plan",
        profileId: "planner",
        assetId: "advisor-architecture",
        route: "do",
        resolvedTools: validResolvedTools,
        promptContent: "Duplicate plan composition",
        createdAt: now,
      },
    ];

    const duplicates = detectDuplicateExecutionPlanIds(plans);
    expect(duplicates.length).toBe(1);
    expect(duplicates[0].id).toBe("ghostwire:workflows:plan::planner::advisor-architecture");
    expect(duplicates[0].indices).toEqual([0, 2]);
  });

  it("should return empty array when no duplicates", () => {
    const plans: ExecutionPlan[] = [
      {
        id: "ghostwire:workflows:plan::planner::plan-one",
        commandId: "ghostwire:workflows:plan",
        profileId: "planner",
        assetId: "plan-one",
        route: "do",
        resolvedTools: validResolvedTools,
        promptContent: "First unique plan",
        createdAt: now,
      },
      {
        id: "ghostwire:code:review::reviewer_typescript::review-one",
        commandId: "ghostwire:code:review",
        profileId: "reviewer_typescript",
        assetId: "review-one",
        route: "do",
        resolvedTools: validResolvedTools,
        promptContent: "Second unique plan",
        createdAt: now,
      },
    ];

    const duplicates = detectDuplicateExecutionPlanIds(plans);
    expect(duplicates.length).toBe(0);
  });

  // ============================================================================
  // Expiration & Validity Checks
  // ============================================================================

  it("should report plan as valid when no expiration", () => {
    const plan: ExecutionPlan = {
      id: "ghostwire:workflows:plan::planner::advisor-architecture",
      commandId: "ghostwire:workflows:plan",
      profileId: "planner",
      assetId: "advisor-architecture",
      route: "do",
      resolvedTools: validResolvedTools,
      promptContent: "Planning guidance",
      createdAt: now,
    };
    expect(isExecutionPlanValid(plan)).toBe(true);
  });

  it("should report plan as valid when expiration is in future", () => {
    const plan: ExecutionPlan = {
      id: "ghostwire:workflows:plan::planner::advisor-architecture",
      commandId: "ghostwire:workflows:plan",
      profileId: "planner",
      assetId: "advisor-architecture",
      route: "do",
      resolvedTools: validResolvedTools,
      promptContent: "Planning guidance",
      createdAt: now,
      expiresAt: future,
    };
    expect(isExecutionPlanValid(plan)).toBe(true);
  });

  it("should report plan as invalid when expiration is in past", () => {
    const past = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
    const plan: ExecutionPlan = {
      id: "ghostwire:workflows:plan::planner::advisor-architecture",
      commandId: "ghostwire:workflows:plan",
      profileId: "planner",
      assetId: "advisor-architecture",
      route: "do",
      resolvedTools: validResolvedTools,
      promptContent: "Planning guidance",
      createdAt: now,
      expiresAt: past,
    };
    expect(isExecutionPlanValid(plan)).toBe(false);
  });

  // ============================================================================
  // Tool Access Checks
  // ============================================================================

  it("should allow access to granted tools", () => {
    const plan: ExecutionPlan = {
      id: "ghostwire:workflows:plan::planner::advisor-architecture",
      commandId: "ghostwire:workflows:plan",
      profileId: "planner",
      assetId: "advisor-architecture",
      route: "do",
      resolvedTools: validResolvedTools,
      promptContent: "Planning guidance",
      createdAt: now,
    };
    expect(canAccessTool(plan, "read")).toBe(true);
    expect(canAccessTool(plan, "search")).toBe(true);
    expect(canAccessTool(plan, "delegate_task")).toBe(true);
  });

  it("should deny access to denied tools", () => {
    const plan: ExecutionPlan = {
      id: "ghostwire:workflows:plan::planner::advisor-architecture",
      commandId: "ghostwire:workflows:plan",
      profileId: "planner",
      assetId: "advisor-architecture",
      route: "do",
      resolvedTools: validResolvedTools,
      promptContent: "Planning guidance",
      createdAt: now,
    };
    expect(canAccessTool(plan, "edit")).toBe(false);
    expect(canAccessTool(plan, "bash")).toBe(false);
    expect(canAccessTool(plan, "look_at")).toBe(false);
  });

  it("should allow conditional access tools", () => {
    const plan: ExecutionPlan = {
      id: "ghostwire:workflows:plan::planner::advisor-architecture",
      commandId: "ghostwire:workflows:plan",
      profileId: "planner",
      assetId: "advisor-architecture",
      route: "do",
      resolvedTools: validResolvedTools,
      promptContent: "Planning guidance",
      createdAt: now,
    };
    expect(canAccessTool(plan, "web")).toBe(true);
  });

  it("should count granted tools correctly", () => {
    const plan: ExecutionPlan = {
      id: "ghostwire:workflows:plan::planner::advisor-architecture",
      commandId: "ghostwire:workflows:plan",
      profileId: "planner",
      assetId: "advisor-architecture",
      route: "do",
      resolvedTools: validResolvedTools,
      promptContent: "Planning guidance",
      createdAt: now,
    };
    // read, search, delegate_task = 3 granted
    expect(countGrantedTools(plan)).toBe(3);
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  it("should accept plan with very long id", () => {
    const plan = {
      id: `ghostwire:workflows:${"x".repeat(50)}::${"y".repeat(80)}::${"z".repeat(80)}`,
      commandId: "ghostwire:workflows:plan",
      profileId: "planner",
      assetId: "advisor-architecture",
      route: "do" as const,
      resolvedTools: validResolvedTools,
      promptContent:
        "Planning guidance with long identifier composition reference this is long content",
      createdAt: now,
    };
    const result = validateExecutionPlan(plan);
    expect(result.success).toBe(true);
  });

  it("should accept plan with complex metadata", () => {
    const plan: ExecutionPlan = {
      id: "ghostwire:workflows:plan::planner::advisor-architecture",
      commandId: "ghostwire:workflows:plan",
      profileId: "planner",
      assetId: "advisor-architecture",
      route: "do",
      resolvedTools: validResolvedTools,
      promptContent: "Planning guidance with complex context",
      createdAt: now,
      metadata: {
        adapterHints: {
          adapter: "claude-code",
          timeout: 30000,
          streaming: true,
        },
        executionContext: {
          sessionId: "session-123",
          userId: "user-456",
          workspace: "/path/to/project",
        },
        retryPolicy: {
          maxRetries: 5,
          backoffMs: 2000,
        },
      },
    };
    const result = validateExecutionPlan(plan);
    expect(result.success).toBe(true);
  });
});
