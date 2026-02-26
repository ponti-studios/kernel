import { describe, it, expect, beforeEach, afterEach, spyOn, mock } from "bun:test";

describe("model-resolution check", () => {
  describe("getModelResolutionInfo", () => {
    // #given: Model requirements are defined in model-requirements.ts
    // #when: Getting model resolution info
    // #then: Returns info for all agents and categories with their provider chains

    it("returns agent requirements with provider chains", async () => {
      const { getModelResolutionInfo } = await import("./model-resolution");

      const info = getModelResolutionInfo();

      // #then: Should have agent entries
      const doAgent = info.agents.find((a) => a.name === "do");
      expect(doAgent).toBeDefined();
      // Model is flexible - just verify structure is correct
      expect(doAgent!.requirement.fallbackChain[0]?.model).toBeDefined();
      expect(typeof doAgent!.requirement.fallbackChain[0]?.model).toBe("string");
      expect(doAgent!.requirement.fallbackChain[0]?.providers).toBeDefined();
      expect(Array.isArray(doAgent!.requirement.fallbackChain[0]?.providers)).toBe(true);
    });

    it("returns category requirements with provider chains", async () => {
      const { getModelResolutionInfo } = await import("./model-resolution");

      const info = getModelResolutionInfo();

      // #then: Should have category entries
      const visual = info.categories.find((c) => c.name === "visual-engineering");
      expect(visual).toBeDefined();
      // Model is flexible - just verify structure is correct
      expect(visual!.requirement.fallbackChain[0]?.model).toBeDefined();
      expect(typeof visual!.requirement.fallbackChain[0]?.model).toBe("string");
      expect(visual!.requirement.fallbackChain[0]?.providers).toBeDefined();
      expect(Array.isArray(visual!.requirement.fallbackChain[0]?.providers)).toBe(true);
    });
  });

  describe("getModelResolutionInfoWithOverrides", () => {
    // #given: User has overrides in ghostwire.json
    // #when: Getting resolution info with config
    // #then: Shows user override in Step 1 position

    it("shows user override for agent when configured", async () => {
      const { getModelResolutionInfoWithOverrides } = await import("./model-resolution");

      // #given: User has override for do agent
      const mockConfig = {
        agents: {
          do: { model: "anthropic/claude-opus-4-5" },
        },
      };

      const info = getModelResolutionInfoWithOverrides(mockConfig);

      // #then: do should show the override
      const doAgent = info.agents.find((a) => a.name === "do");
      expect(doAgent).toBeDefined();
      expect(doAgent!.userOverride).toBe("anthropic/claude-opus-4-5");
      expect(doAgent!.effectiveResolution).toBe("User override: anthropic/claude-opus-4-5");
    });

    it("shows user override for category when configured", async () => {
      const { getModelResolutionInfoWithOverrides } = await import("./model-resolution");

      // #given: User has override for visual-engineering category
      const mockConfig = {
        categories: {
          "visual-engineering": { model: "openai/gpt-5.2" },
        },
      };

      const info = getModelResolutionInfoWithOverrides(mockConfig);

      // #then: visual-engineering should show the override
      const visual = info.categories.find((c) => c.name === "visual-engineering");
      expect(visual).toBeDefined();
      expect(visual!.userOverride).toBe("openai/gpt-5.2");
      expect(visual!.effectiveResolution).toBe("User override: openai/gpt-5.2");
    });

    it("shows provider fallback when no override exists", async () => {
      const { getModelResolutionInfoWithOverrides } = await import("./model-resolution");

      // #given: No overrides configured
      const mockConfig = {};

      const info = getModelResolutionInfoWithOverrides(mockConfig);

      // #then: Should show provider fallback chain (model is flexible)
      const doAgent = info.agents.find((a) => a.name === "do");
      expect(doAgent).toBeDefined();
      expect(doAgent!.userOverride).toBeUndefined();
      expect(doAgent!.effectiveResolution).toContain("Provider fallback:");
      // Model is flexible - just verify it contains some provider
      expect(typeof doAgent!.effectiveResolution).toBe("string");
    });
  });

  describe("checkModelResolution", () => {
    // #given: Doctor check is executed
    // #when: Running the model resolution check
    // #then: Returns pass with details showing resolution flow

    it("returns pass or warn status with agent and category counts", async () => {
      const { checkModelResolution } = await import("./model-resolution");

      const result = await checkModelResolution();

      // #then: Should pass (with cache) or warn (no cache) and show counts
      // In CI without model cache, status is "warn"; locally with cache, status is "pass"
      expect(["pass", "warn"]).toContain(result.status);
      expect(result.message).toMatch(/\d+ agents?, \d+ categories?/);
    });

    it("includes resolution details in verbose mode details array", async () => {
      const { checkModelResolution } = await import("./model-resolution");

      const result = await checkModelResolution();

      // #then: Details should contain agent/category resolution info
      expect(result.details).toBeDefined();
      expect(result.details!.length).toBeGreaterThan(0);
      // Should have Available Models and Configured Models headers
      expect(result.details!.some((d) => d.includes("Available Models"))).toBe(true);
      expect(result.details!.some((d) => d.includes("Configured Models"))).toBe(true);
      expect(result.details!.some((d) => d.includes("Agents:"))).toBe(true);
      expect(result.details!.some((d) => d.includes("Categories:"))).toBe(true);
      // Should have legend
      expect(result.details!.some((d) => d.includes("user override"))).toBe(true);
    });
  });

  describe("getModelResolutionCheckDefinition", () => {
    it("returns valid check definition", async () => {
      const { getModelResolutionCheckDefinition } = await import("./model-resolution");

      const def = getModelResolutionCheckDefinition();

      expect(def.id).toBe("model-resolution");
      expect(def.name).toBe("Model Resolution");
      expect(def.category).toBe("configuration");
      expect(typeof def.check).toBe("function");
    });
  });
});
