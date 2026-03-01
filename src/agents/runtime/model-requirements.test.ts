import { describe, expect, test } from "bun:test";
import {
  AGENT_MODEL_REQUIREMENTS,
  CATEGORY_MODEL_REQUIREMENTS,
  type FallbackEntry,
  type ModelRequirement,
} from "./model-requirements";

describe("AGENT_MODEL_REQUIREMENTS", () => {
  test("all runtime agents have valid fallbackChain arrays", () => {
    const expectedAgents = ["do", "research"];

    // #when - checking AGENT_MODEL_REQUIREMENTS
    const definedAgents = Object.keys(AGENT_MODEL_REQUIREMENTS);

    // #then - all agents present with valid fallbackChain
    expect(definedAgents).toHaveLength(2);
    for (const agent of expectedAgents) {
      const requirement = AGENT_MODEL_REQUIREMENTS[agent];
      expect(requirement).toBeDefined();
      expect(requirement.fallbackChain).toBeArray();
      expect(requirement.fallbackChain.length).toBeGreaterThan(0);

      for (const entry of requirement.fallbackChain) {
        expect(entry.providers).toBeArray();
        expect(entry.providers.length).toBeGreaterThan(0);
        expect(typeof entry.model).toBe("string");
        expect(entry.model.length).toBeGreaterThan(0);
      }
    }
  });

  test("agents use flexible model configuration", () => {
    // #given - all agent requirements
    // #when - checking fallback chains
    // #then - agents have valid model configurations (specific values determined by config)
    const allAgents = Object.values(AGENT_MODEL_REQUIREMENTS);

    for (const agent of allAgents) {
      expect(agent.fallbackChain).toBeDefined();
      expect(agent.fallbackChain.length).toBeGreaterThan(0);

      for (const entry of agent.fallbackChain) {
        // Verify structure - models can be any valid model
        expect(entry.providers).toBeDefined();
        expect(Array.isArray(entry.providers)).toBe(true);
        expect(entry.providers.length).toBeGreaterThan(0);
        expect(entry.model).toBeDefined();
        expect(typeof entry.model).toBe("string");
      }
    }
  });
});

describe("CATEGORY_MODEL_REQUIREMENTS", () => {
  test("all 8 categories have valid fallbackChain arrays", () => {
    // #given - list of 8 category names
    const expectedCategories = [
      "visual-engineering",
      "ultrabrain",
      "deep",
      "artistry",
      "quick",
      "unspecified-low",
      "unspecified-high",
      "writing",
    ];

    // #when - checking CATEGORY_MODEL_REQUIREMENTS
    const definedCategories = Object.keys(CATEGORY_MODEL_REQUIREMENTS);

    // #then - all categories present with valid fallbackChain
    expect(definedCategories).toHaveLength(8);
    for (const category of expectedCategories) {
      const requirement = CATEGORY_MODEL_REQUIREMENTS[category];
      expect(requirement).toBeDefined();
      expect(requirement.fallbackChain).toBeArray();
      expect(requirement.fallbackChain.length).toBeGreaterThan(0);

      for (const entry of requirement.fallbackChain) {
        expect(entry.providers).toBeArray();
        expect(entry.providers.length).toBeGreaterThan(0);
        expect(typeof entry.model).toBe("string");
        expect(entry.model.length).toBeGreaterThan(0);
      }
    }
  });

  test("categories use flexible model configuration", () => {
    // #given - all category requirements
    // #when - checking fallback chains
    // #then - categories have valid model configurations (specific values determined by config)
    const allCategories = Object.values(CATEGORY_MODEL_REQUIREMENTS);

    for (const category of allCategories) {
      expect(category.fallbackChain).toBeDefined();
      expect(category.fallbackChain.length).toBeGreaterThan(0);

      for (const entry of category.fallbackChain) {
        // Verify structure - models can be any valid model
        expect(entry.providers).toBeDefined();
        expect(Array.isArray(entry.providers)).toBe(true);
        expect(entry.providers.length).toBeGreaterThan(0);
        expect(entry.model).toBeDefined();
        expect(typeof entry.model).toBe("string");
      }
    }
  });

  test("categories may have variant preferences", () => {
    // #given - all category requirements
    // #when - checking for variant field
    // #then - variant is optional, but if present must be a valid string
    const allCategories = Object.values(CATEGORY_MODEL_REQUIREMENTS);

    for (const category of allCategories) {
      if (category.variant !== undefined) {
        expect(typeof category.variant).toBe("string");
        expect(category.variant.length).toBeGreaterThan(0);
      }

      for (const entry of category.fallbackChain) {
        if (entry.variant !== undefined) {
          expect(typeof entry.variant).toBe("string");
          expect(entry.variant.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("FallbackEntry type", () => {
  test("FallbackEntry structure is correct", () => {
    // #given - a valid FallbackEntry object
    const entry: FallbackEntry = {
      providers: ["anthropic", "github-copilot", "opencode"],
      model: "claude-opus-4-5",
      variant: "high",
    };

    // #when - accessing properties
    // #then - all properties are accessible
    expect(entry.providers).toEqual(["anthropic", "github-copilot", "opencode"]);
    expect(entry.model).toBe("claude-opus-4-5");
    expect(entry.variant).toBe("high");
  });

  test("FallbackEntry variant is optional", () => {
    // #given - a FallbackEntry without variant
    const entry: FallbackEntry = {
      providers: ["opencode", "anthropic"],
      model: "glm-4.7-free",
    };

    // #when - accessing variant
    // #then - variant is undefined
    expect(entry.variant).toBeUndefined();
  });
});

describe("ModelRequirement type", () => {
  test("ModelRequirement structure with fallbackChain is correct", () => {
    // #given - a valid ModelRequirement object
    const requirement: ModelRequirement = {
      fallbackChain: [
        { providers: ["anthropic", "github-copilot"], model: "claude-opus-4-5", variant: "max" },
        { providers: ["openai", "github-copilot"], model: "gpt-5.2", variant: "high" },
      ],
    };

    // #when - accessing properties
    // #then - fallbackChain is accessible with correct structure
    expect(requirement.fallbackChain).toBeArray();
    expect(requirement.fallbackChain).toHaveLength(2);
    expect(requirement.fallbackChain[0].model).toBe("claude-opus-4-5");
    expect(requirement.fallbackChain[1].model).toBe("gpt-5.2");
  });

  test("ModelRequirement variant is optional", () => {
    // #given - a ModelRequirement without top-level variant
    const requirement: ModelRequirement = {
      fallbackChain: [{ providers: ["opencode"], model: "glm-4.7-free" }],
    };

    // #when - accessing variant
    // #then - variant is undefined
    expect(requirement.variant).toBeUndefined();
  });

  test("no model in fallbackChain has provider prefix", () => {
    // #given - all agent and category requirements
    const allRequirements = [
      ...Object.values(AGENT_MODEL_REQUIREMENTS),
      ...Object.values(CATEGORY_MODEL_REQUIREMENTS),
    ];

    // #when - checking each model in fallbackChain
    // #then - none contain "/" (provider prefix)
    for (const req of allRequirements) {
      for (const entry of req.fallbackChain) {
        expect(entry.model).not.toContain("/");
      }
    }
  });

  test("all fallbackChain entries have non-empty providers array", () => {
    // #given - all agent and category requirements
    const allRequirements = [
      ...Object.values(AGENT_MODEL_REQUIREMENTS),
      ...Object.values(CATEGORY_MODEL_REQUIREMENTS),
    ];

    // #when - checking each entry in fallbackChain
    // #then - all have non-empty providers array
    for (const req of allRequirements) {
      for (const entry of req.fallbackChain) {
        expect(entry.providers).toBeArray();
        expect(entry.providers.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("requiresModel field in categories", () => {
  test("requiresModel is optional - categories work without it", () => {
    // #given - all category requirements
    // #when / #then - requiresModel is optional, system works with or without it
    const allCategories = Object.values(CATEGORY_MODEL_REQUIREMENTS);

    // All categories should have a valid fallbackChain regardless of requiresModel
    for (const category of allCategories) {
      expect(category.fallbackChain).toBeDefined();
      expect(category.fallbackChain.length).toBeGreaterThan(0);

      // If requiresModel exists, it should be a valid model name
      if (category.requiresModel !== undefined) {
        expect(typeof category.requiresModel).toBe("string");
        expect(category.requiresModel.length).toBeGreaterThan(0);
      }
    }
  });
});
