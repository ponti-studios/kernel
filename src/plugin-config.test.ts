import { describe, expect, it } from "bun:test";
import { mergeConfigs } from "./plugin-config";
import type { GhostwireConfig } from "./platform/config";

describe("mergeConfigs", () => {
  describe("categories merging", () => {
    // #given base config has categories, override has different categories
    // #when merging configs
    // #then should deep merge categories, not override completely

    it("should deep merge categories from base and override", () => {
      const base = {
        categories: {
          general: {
            model: "openai/gpt-5.2",
            temperature: 0.5,
          },
          quick: {
            model: "anthropic/claude-haiku-4-5",
          },
        },
      } as GhostwireConfig;

      const override = {
        categories: {
          general: {
            temperature: 0.3,
          },
          visual: {
            model: "google/gemini-3-pro",
          },
        },
      } as unknown as GhostwireConfig;

      const result = mergeConfigs(base, override);

      // #then general.model should be preserved from base
      expect(result.categories?.general?.model).toBe("openai/gpt-5.2");
      // #then general.temperature should be overridden
      expect(result.categories?.general?.temperature).toBe(0.3);
      // #then quick should be preserved from base
      expect(result.categories?.quick?.model).toBe("anthropic/claude-haiku-4-5");
      // #then visual should be added from override
      expect(result.categories?.visual?.model).toBe("google/gemini-3-pro");
    });

    it("should preserve base categories when override has no categories", () => {
      const base: GhostwireConfig = {
        categories: {
          general: {
            model: "openai/gpt-5.2",
          },
        },
      };

      const override: GhostwireConfig = {};

      const result = mergeConfigs(base, override);

      expect(result.categories?.general?.model).toBe("openai/gpt-5.2");
    });

    it("should use override categories when base has no categories", () => {
      const base: GhostwireConfig = {};

      const override: GhostwireConfig = {
        categories: {
          general: {
            model: "openai/gpt-5.2",
          },
        },
      };

      const result = mergeConfigs(base, override);

      expect(result.categories?.general?.model).toBe("openai/gpt-5.2");
    });
  });

  describe("existing behavior preservation", () => {
    it("should deep merge agents", () => {
      const base: GhostwireConfig = {
        agents: {
          do: { model: "openai/gpt-5.2" },
        },
      };

      const override: GhostwireConfig = {
        agents: {
          do: { temperature: 0.5 },
          research: { model: "anthropic/claude-haiku-4-5" },
        },
      };

      const result = mergeConfigs(base, override);

      expect(result.agents?.do?.model).toBe("openai/gpt-5.2");
      expect(result.agents?.do?.temperature).toBe(0.5);
      expect(result.agents?.research?.model).toBe("anthropic/claude-haiku-4-5");
    });

    it("should merge disabled arrays without duplicates", () => {
      const base: GhostwireConfig = {
        disabled_hooks: ["comment-checker", "think-mode"],
      };

      const override: GhostwireConfig = {
        disabled_hooks: ["think-mode", "session-recovery"],
      };

      const result = mergeConfigs(base, override);

      expect(result.disabled_hooks).toContain("comment-checker");
      expect(result.disabled_hooks).toContain("think-mode");
      expect(result.disabled_hooks).toContain("session-recovery");
      expect(result.disabled_hooks?.length).toBe(3);
    });
  });
});
