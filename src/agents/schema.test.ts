import { describe, it, expect } from "bun:test";
import {
  type AgentSpec,
  validateAgentSpec,
  validateAgentSpecList,
  serializeAgentSpec,
  digestAgentSpec,
} from "./schema";

describe("AgentSpec Schema", () => {
  // ============================================================================
  // Valid Instances (minimal to comprehensive)
  // ============================================================================

  it("should accept minimal valid profile", () => {
    const profile = {
      id: "test_profile",
      intent: "Provide minimal test profile intent",
      role: "Tester",
      route: "do" as const,
      tools: ["read"],
      acceptanceChecks: ["test passes"],
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "Test prompt append instruction",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("test_profile");
    }
  });

  it("should accept profile with all fields including optional", async () => {
    const profile: AgentSpec = {
      id: "advisor_architecture",
      intent: "Validate architecture for agent-native parity and system cohesion",
      role: "Reviewer",
      route: "do",
      tools: ["read", "search", "delegate_task"],
      acceptanceChecks: ["parity matrix complete", "architecture risks prioritized"],
      defaultCommand: "ghostwire:workflows:review",
      promptAppend:
        "Perform architecture parity and capability mapping checks before implementation recommendations.",
      lifecycleHints: { adapter: "claude-code", timeout: 30000 },
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lifecycleHints).toEqual({
        adapter: "claude-code",
        timeout: 30000,
      });
    }
  });

  it("should accept research route profiles", () => {
    const profile = {
      id: "analyzer_design",
      intent: "Assess implementation against visual design specifications",
      role: "Designer",
      route: "research" as const,
      tools: ["read", "delegate_task", "look_at"],
      acceptanceChecks: ["visual deltas listed", "actionable fix list produced"],
      defaultCommand: "ghostwire:workflows:review",
      promptAppend: "Compare visual outputs against spec and list delta categories with severity.",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(true);
  });

  it("should accept profiles with multiple tools", () => {
    const profile = {
      id: "designer_iterator",
      intent: "Iterative UX quality refinement across feedback cycles",
      role: "Refiner",
      route: "do" as const,
      tools: ["read", "delegate_task", "look_at", "edit"],
      acceptanceChecks: ["iteration deltas documented", "quality threshold achieved"],
      defaultCommand: "ghostwire:docs:test-browser",
      promptAppend: "Run bounded iteration cycles with measurable visual quality deltas.",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tools.length).toBe(4);
    }
  });

  it("should accept profiles with many acceptance checks", () => {
    const profile = {
      id: "executor",
      intent: "Execute implementation tasks with strict verification loops",
      role: "Implementer",
      route: "do" as const,
      tools: ["read", "edit", "bash", "delegate_task"],
      acceptanceChecks: [
        "task started",
        "intermediate checkpoints verified",
        "edge cases tested",
        "final validation passed",
      ],
      defaultCommand: "ghostwire:workflows:execute",
      promptAppend: "Execute with strict verification discipline and abort on errors.",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(true);
  });

  // ============================================================================
  // Invalid Instances (missing/wrong fields/types)
  // ============================================================================

  it("should reject profile missing id", () => {
    const profile = {
      intent: "Test intent",
      role: "Tester",
      route: "do" as const,
      tools: ["read"],
      acceptanceChecks: ["test passes"],
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "Test prompt",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(false);
  });

  it("should reject profile with empty id", () => {
    const profile = {
      id: "",
      intent: "Test intent",
      role: "Tester",
      route: "do" as const,
      tools: ["read"],
      acceptanceChecks: ["test passes"],
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "Test prompt",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(false);
  });

  it("should reject id starting with uppercase", () => {
    const profile = {
      id: "Advisor_architecture",
      intent: "Test intent",
      role: "Tester",
      route: "do" as const,
      tools: ["read"],
      acceptanceChecks: ["test passes"],
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "Test prompt",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(false);
  });

  it("should reject id with hyphens (only underscores allowed)", () => {
    const profile = {
      id: "advisor-architecture",
      intent: "Test intent",
      role: "Tester",
      route: "do" as const,
      tools: ["read"],
      acceptanceChecks: ["test passes"],
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "Test prompt",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(false);
  });

  it("should reject id starting with digit", () => {
    const profile = {
      id: "1advisor_architecture",
      intent: "Test intent",
      role: "Tester",
      route: "do" as const,
      tools: ["read"],
      acceptanceChecks: ["test passes"],
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "Test prompt",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(false);
  });

  it("should reject intent too short (< 10 chars)", () => {
    const profile = {
      id: "test_profile",
      intent: "Short",
      role: "Tester",
      route: "do" as const,
      tools: ["read"],
      acceptanceChecks: ["test passes"],
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "Test prompt",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(false);
  });

  it("should reject intent too long (> 500 chars)", () => {
    const profile = {
      id: "test_profile",
      intent: "x".repeat(501),
      role: "Tester",
      route: "do" as const,
      tools: ["read"],
      acceptanceChecks: ["test passes"],
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "Test prompt",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(false);
  });

  it("should reject empty role", () => {
    const profile = {
      id: "test_profile",
      intent: "Provide test profile",
      role: "",
      route: "do" as const,
      tools: ["read"],
      acceptanceChecks: ["test passes"],
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "Test prompt",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(false);
  });

  it("should reject invalid route (not do or research)", () => {
    const profile = {
      id: "test_profile",
      intent: "Provide test profile",
      role: "Tester",
      route: "invalid" as any,
      tools: ["read"],
      acceptanceChecks: ["test passes"],
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "Test prompt",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(false);
  });

  it("should reject empty tools array", () => {
    const profile = {
      id: "test_profile",
      intent: "Provide test profile",
      role: "Tester",
      route: "do" as const,
      tools: [] as any,
      acceptanceChecks: ["test passes"],
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "Test prompt",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(false);
  });

  it("should reject invalid tool name", () => {
    const profile = {
      id: "test_profile",
      intent: "Provide test profile",
      role: "Tester",
      route: "do" as const,
      tools: ["read", "invalid_tool"] as any,
      acceptanceChecks: ["test passes"],
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "Test prompt",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(false);
  });

  it("should reject empty acceptanceChecks array", () => {
    const profile = {
      id: "test_profile",
      intent: "Provide test profile",
      role: "Tester",
      route: "do" as const,
      tools: ["read"],
      acceptanceChecks: [] as any,
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "Test prompt",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(false);
  });

  it("should reject empty acceptanceCheck item", () => {
    const profile = {
      id: "test_profile",
      intent: "Provide test profile",
      role: "Tester",
      route: "do" as const,
      tools: ["read"],
      acceptanceChecks: ["valid check", ""],
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "Test prompt",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(false);
  });

  it("should reject empty defaultCommand", () => {
    const profile = {
      id: "test_profile",
      intent: "Provide test profile",
      role: "Tester",
      route: "do" as const,
      tools: ["read"],
      acceptanceChecks: ["test passes"],
      defaultCommand: "",
      promptAppend: "Test prompt",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(false);
  });

  it("should reject empty promptAppend", () => {
    const profile = {
      id: "test_profile",
      intent: "Provide test profile",
      role: "Tester",
      route: "do" as const,
      tools: ["read"],
      acceptanceChecks: ["test passes"],
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(false);
  });

  it("should reject promptAppend too short (< 10 chars)", () => {
    const profile = {
      id: "test_profile",
      intent: "Provide test profile",
      role: "Tester",
      route: "do" as const,
      tools: ["read"],
      acceptanceChecks: ["test passes"],
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "Short",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(false);
  });

  it("should reject type mismatch for tools (string instead of array)", () => {
    const profile = {
      id: "test_profile",
      intent: "Provide test profile",
      role: "Tester",
      route: "do" as const,
      tools: "read" as any,
      acceptanceChecks: ["test passes"],
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "Test prompt",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(false);
  });

  it("should reject type mismatch for acceptanceChecks (string instead of array)", () => {
    const profile = {
      id: "test_profile",
      intent: "Provide test profile",
      role: "Tester",
      route: "do" as const,
      tools: ["read"],
      acceptanceChecks: "test passes" as any,
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "Test prompt",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(false);
  });

  // ============================================================================
  // Deterministic Serialization
  // ============================================================================

  it("should produce stable JSON serialization", () => {
    const profile: AgentSpec = {
      id: "test_profile",
      intent: "Provide test profile intent",
      role: "Tester",
      route: "do",
      tools: ["delegate_task", "read", "search"],
      acceptanceChecks: ["test passes", "validation complete"],
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "Test prompt append instruction",
    };
    const ser1 = serializeAgentSpec(profile);
    const ser2 = serializeAgentSpec(profile);
    expect(ser1).toBe(ser2);
  });

  it("should produce consistent serialization regardless of tool order", () => {
    const profile1: AgentSpec = {
      id: "test_profile",
      intent: "Provide test profile intent",
      role: "Tester",
      route: "do",
      tools: ["read", "search", "delegate_task"],
      acceptanceChecks: ["test passes"],
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "Test prompt append instruction",
    };

    const profile2: AgentSpec = {
      ...profile1,
      tools: ["delegate_task", "read", "search"],
    };

    const ser1 = serializeAgentSpec(profile1);
    const ser2 = serializeAgentSpec(profile2);
    expect(ser1).toBe(ser2);
  });

  it("should round-trip correctly through parse", () => {
    const profile: AgentSpec = {
      id: "reviewer_typescript",
      intent: "Review TypeScript changes for correctness and maintainability",
      role: "Reviewer",
      route: "do",
      tools: ["read", "search", "delegate_task"],
      acceptanceChecks: ["type safety verified", "best practices applied"],
      defaultCommand: "ghostwire:code:review",
      promptAppend: "Review TypeScript code for type safety, best practices, and performance.",
    };

    const serialized = serializeAgentSpec(profile);
    const parsed = JSON.parse(serialized);
    const validated = validateAgentSpec(parsed);
    expect(validated.success).toBe(true);
    if (validated.success) {
      expect(validated.data.id).toBe(profile.id);
      expect(validated.data.tools).toEqual(profile.tools.sort());
    }
  });

  // ============================================================================
  // Digest Functions
  // ============================================================================

  it("should produce stable digest for same profile", async () => {
    const profile: AgentSpec = {
      id: "test_profile",
      intent: "Provide test profile intent",
      role: "Tester",
      route: "do",
      tools: ["read"],
      acceptanceChecks: ["test passes"],
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "Test prompt append instruction",
    };
    const digest1 = await digestAgentSpec(profile);
    const digest2 = await digestAgentSpec(profile);
    expect(digest1).toBe(digest2);
  });

  it("should produce different digest when intent changes", async () => {
    const profile1: AgentSpec = {
      id: "test_profile",
      intent: "Provide test profile intent version 1",
      role: "Tester",
      route: "do",
      tools: ["read"],
      acceptanceChecks: ["test passes"],
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "Test prompt append instruction",
    };

    const profile2: AgentSpec = {
      ...profile1,
      intent: "Provide test profile intent version 2",
    };

    const digest1 = await digestAgentSpec(profile1);
    const digest2 = await digestAgentSpec(profile2);
    expect(digest1).not.toBe(digest2);
  });

  // ============================================================================
  // Batch Validation
  // ============================================================================

  it("should validate list with all valid profiles", () => {
    const profiles = [
      {
        id: "profile_one",
        intent: "First valid test profile",
        role: "Tester",
        route: "do" as const,
        tools: ["read"],
        acceptanceChecks: ["test passes"],
        defaultCommand: "ghostwire:workflows:plan",
        promptAppend: "Test prompt one",
      },
      {
        id: "profile_two",
        intent: "Second valid test profile",
        role: "Tester",
        route: "research" as const,
        tools: ["search"],
        acceptanceChecks: ["research complete"],
        defaultCommand: "ghostwire:workflows:review",
        promptAppend: "Test prompt two",
      },
    ];
    const results = validateAgentSpecList(profiles);
    expect(results.length).toBe(2);
    expect(results.every((r) => r.isValid)).toBe(true);
  });

  it("should report per-item errors in batch validation", () => {
    const profiles = [
      {
        id: "profile_one",
        intent: "Valid first profile with proper intent length",
        role: "Tester",
        route: "do" as const,
        tools: ["read"],
        acceptanceChecks: ["test passes"],
        defaultCommand: "ghostwire:workflows:plan",
        promptAppend: "Test prompt one",
      },
      {
        id: "",
        intent: "Missing intent",
        role: "Tester",
        route: "do" as const,
        tools: ["read"],
        acceptanceChecks: ["test"],
        defaultCommand: "ghostwire:workflows:plan",
        promptAppend: "Test prompt two",
      },
    ];
    const results = validateAgentSpecList(profiles as unknown[]);
    expect(results[0].isValid).toBe(true);
    expect(results[1].isValid).toBe(false);
    expect(results[1].errors.length).toBeGreaterThan(0);
  });

  // ============================================================================
  // Duplicate Detection
  // ============================================================================

  it("should detect duplicate profile IDs", () => {
    const specs: AgentSpec[] = [
      {
        id: "plan",
        intent: "First plan profile",
        role: "Planner",
        route: "do",
        tools: ["read", "search", "delegate_task"],
        acceptanceChecks: ["plan complete"],
        defaultCommand: "ghostwire:workflows:plan",
        promptAppend: "Produce deterministic plan",
      },
      {
        id: "other_profile",
        intent: "Other profile for testing",
        role: "Tester",
        route: "do",
        tools: ["read"],
        acceptanceChecks: ["test passes"],
        defaultCommand: "ghostwire:workflows:plan",
        promptAppend: "Test prompt append",
      },
      {
        id: "plan",
        intent: "Duplicate plan profile",
        role: "Planner",
        route: "research",
        tools: ["search"],
        acceptanceChecks: ["duplicate detected"],
        defaultCommand: "ghostwire:workflows:review",
        promptAppend: "This is a duplicate",
      },
    ];
    const duplicates = serializeAgentSpec(specs);
    expect(duplicates.length).toBe(1);
    expect(duplicates[0].id).toBe("plan");
    expect(duplicates[0].indices).toEqual([0, 2]);
  });

  it("should return empty array when no duplicates", () => {
    const specs: AgentSpec[] = [
      {
        id: "unique_profile_1",
        intent: "First unique profile",
        role: "Tester",
        route: "do",
        tools: ["read"],
        acceptanceChecks: ["test passes"],
        defaultCommand: "ghostwire:workflows:plan",
        promptAppend: "First test prompt",
      },
      {
        id: "unique_profile_2",
        intent: "Second unique profile",
        role: "Tester",
        route: "research",
        tools: ["search"],
        acceptanceChecks: ["research complete"],
        defaultCommand: "ghostwire:workflows:review",
        promptAppend: "Second test prompt",
      },
    ];
    const duplicates = serializeAgentSpec(specs);
    expect(duplicates.length).toBe(0);
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  it("should accept profile with web tool for researcher profiles", () => {
    const profile = {
      id: "researcher_world",
      intent: "Fetch external docs, examples, and data-driven references accurately",
      role: "Researcher",
      route: "research" as const,
      tools: ["web", "read", "delegate_task"],
      acceptanceChecks: ["sources cited", "data verified", "links working"],
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "Retrieve and validate external documentation",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(true);
  });

  it("should accept profile with bash tool for executor", () => {
    const profile = {
      id: "executor",
      intent: "Execute implementation tasks with strict verification loops",
      role: "Implementer",
      route: "do" as const,
      tools: ["read", "edit", "bash", "delegate_task"],
      acceptanceChecks: ["task executed", "verification passed"],
      defaultCommand: "ghostwire:workflows:execute",
      promptAppend: "Execute with strict verification discipline",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(true);
  });

  it("should accept profile with special characters in acceptanceChecks", () => {
    const profile = {
      id: "validator_audit",
      intent: "Validate work plans against clarity and completeness standards",
      role: "Validator",
      route: "do" as const,
      tools: ["read", "search", "delegate_task"],
      acceptanceChecks: ["✓ clarity verified", "✓ completeness >= 95%", "✓ references @valid"],
      defaultCommand: "ghostwire:workflows:review",
      promptAppend: "Validate plan against all criteria",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(true);
  });

  it("should accept profile with complex lifecycle hints", () => {
    const profile: AgentSpec = {
      id: "designer_iterator",
      intent: "Iterative UX quality refinement across feedback cycles",
      role: "Refiner",
      route: "do",
      tools: ["read", "edit", "look_at", "delegate_task"],
      acceptanceChecks: ["iteration delta measured", "quality threshold met"],
      defaultCommand: "ghostwire:docs:test-browser",
      promptAppend: "Iterate design with measurable improvements",
      lifecycleHints: {
        maxIterations: 5,
        qualityThreshold: 0.95,
        adapter: "claude-code",
      },
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(true);
  });

  it("should accept id with multiple underscores", () => {
    const profile = {
      id: "reviewer_rails_dh",
      intent: "Review Rails code from DHH perspective with opinionated style",
      role: "Reviewer",
      route: "do" as const,
      tools: ["read", "search", "delegate_task"],
      acceptanceChecks: ["rails conventions checked", "dh opinions applied"],
      defaultCommand: "ghostwire:code:review",
      promptAppend: "Apply DHH Rails conventions",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(true);
  });

  it("should accept id with digits", () => {
    const profile = {
      id: "validator_audit_v2",
      intent: "Validate work plans against clarity and completeness standards",
      role: "Validator",
      route: "do" as const,
      tools: ["read"],
      acceptanceChecks: ["validation complete"],
      defaultCommand: "ghostwire:workflows:review",
      promptAppend: "Validate with version 2 criteria",
    };
    const result = validateAgentSpec(profile);
    expect(result.success).toBe(true);
  });

  it("should accept profile even with unknown properties (they are ignored)", () => {
    const profile = {
      id: "test_profile",
      intent: "Provide test profile intent",
      role: "Tester",
      route: "do" as const,
      tools: ["read"],
      acceptanceChecks: ["test passes"],
      defaultCommand: "ghostwire:workflows:plan",
      promptAppend: "Test prompt append",
      unknownField: "will be ignored by schema",
    };
    const result = validateAgentSpec(profile as any);
    // Zod strict mode strips unknown fields but still validates
    expect(result.success).toBe(true);
    if (result.success) {
      // Verify unknown property is not in result
      expect("unknownField" in result.data).toBe(false);
    }
  });
});
