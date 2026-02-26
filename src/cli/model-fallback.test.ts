import { describe, expect, test } from "bun:test";

import { generateModelConfig } from "./model-fallback";
import type { InstallConfig } from "./types";

function createConfig(overrides: Partial<InstallConfig> = {}): InstallConfig {
  return {
    hasOpenAI: false,
    hasGemini: false,
    hasCopilot: false,
    hasOpencodeZen: false,
    hasZaiCodingPlan: false,
    hasKimiForCoding: false,
    ...overrides,
  };
}

describe("generateModelConfig", () => {
  describe("no providers available", () => {
    test("returns ULTIMATE_FALLBACK for all agents and categories when no providers", () => {
      // #given no providers are available
      const config = createConfig();

      // #when generateModelConfig is called
      const result = generateModelConfig(config);

      // #then should use ULTIMATE_FALLBACK for everything
      expect(result).toMatchSnapshot();
    });
  });

  describe("single native provider", () => {
    test("uses OpenAI models when only OpenAI is available", () => {
      // #given only OpenAI is available
      const config = createConfig({ hasOpenAI: true });

      // #when generateModelConfig is called
      const result = generateModelConfig(config);

      // #then should use OpenAI models
      expect(result).toMatchSnapshot();
    });

    test("uses Gemini models when only Gemini is available", () => {
      // #given only Gemini is available
      const config = createConfig({ hasGemini: true });

      // #when generateModelConfig is called
      const result = generateModelConfig(config);

      // #then should use Gemini models
      expect(result).toMatchSnapshot();
    });
  });

  describe("all native providers", () => {
    test("uses preferred models from fallback chains when all natives available", () => {
      // #given all native providers are available
      const config = createConfig({
        hasOpenAI: true,
        hasGemini: true,
      });

      // #when generateModelConfig is called
      const result = generateModelConfig(config);

      // #then should use first provider in each fallback chain
      expect(result).toMatchSnapshot();
    });
  });

  describe("fallback providers", () => {
    test("uses OpenCode Zen models when only OpenCode Zen is available", () => {
      // #given only OpenCode Zen is available
      const config = createConfig({ hasOpencodeZen: true });

      // #when generateModelConfig is called
      const result = generateModelConfig(config);

      // #then should use OPENCODE_ZEN_MODELS
      expect(result).toMatchSnapshot();
    });

    test("uses GitHub Copilot models when only Copilot is available", () => {
      // #given only GitHub Copilot is available
      const config = createConfig({ hasCopilot: true });

      // #when generateModelConfig is called
      const result = generateModelConfig(config);

      // #then should use GITHUB_COPILOT_MODELS
      expect(result).toMatchSnapshot();
    });

    test("uses ZAI model for research when only ZAI is available", () => {
      // #given only ZAI is available
      const config = createConfig({ hasZaiCodingPlan: true });

      // #when generateModelConfig is called
      const result = generateModelConfig(config);

      // #then should use ZAI_MODEL for research
      expect(result).toMatchSnapshot();
    });
  });

  describe("mixed provider scenarios", () => {
    test("uses OpenAI + Copilot combination", () => {
      // #given OpenAI and Copilot are available
      const config = createConfig({
        hasOpenAI: true,
        hasCopilot: true,
      });

      // #when generateModelConfig is called
      const result = generateModelConfig(config);

      // #then should prefer Openai (native) over Copilot
      expect(result).toMatchSnapshot();
    });

    test("uses ZAI combination (research uses ZAI)", () => {
      // #given OpenAI and ZAI are available
      const config = createConfig({
        hasOpenAI: true,
        hasZaiCodingPlan: true,
      });

      // #when generateModelConfig is called
      const result = generateModelConfig(config);

      // #then research should use ZAI
      expect(result).toMatchSnapshot();
    });

    test("uses all fallback providers together", () => {
      // #given all fallback providers are available
      const config = createConfig({
        hasOpencodeZen: true,
        hasCopilot: true,
        hasZaiCodingPlan: true,
      });

      // #when generateModelConfig is called
      const result = generateModelConfig(config);

      // #then should prefer OpenCode Zen, but research uses ZAI
      expect(result).toMatchSnapshot();
    });

    test("uses all providers together", () => {
      // #given all providers are available
      const config = createConfig({
        hasOpenAI: true,
        hasGemini: true,
        hasOpencodeZen: true,
        hasCopilot: true,
        hasZaiCodingPlan: true,
      });

      // #when generateModelConfig is called
      const result = generateModelConfig(config);

      // #then should prefer native providers, research uses ZAI
      expect(result).toMatchSnapshot();
    });
  });

  describe("research agent special cases", () => {
    test("research uses gpt-5-nano when only Gemini available", () => {
      // #given only Gemini is available
      const config = createConfig({ hasGemini: true });

      // #when generateModelConfig is called
      const result = generateModelConfig(config);

      // #then research should use gpt-5-nano (fallback)
      expect(result.agents?.["research"]?.model).toBe("opencode/gpt-5-nano");
    });

    test("research uses OpenCode claude-haiku when OpenCode Zen available", () => {
      // #given OpenCode Zen is available
      const config = createConfig({ hasOpencodeZen: true });

      // #when generateModelConfig is called
      const result = generateModelConfig(config);

      // #then research should use opencode/claude-haiku-4-5
      expect(result.agents?.["research"]?.model).toBe("opencode/claude-haiku-4-5");
    });

    test("research uses gpt-5-nano when only OpenAI available", () => {
      // #given only OpenAI is available
      const config = createConfig({ hasOpenAI: true });

      // #when generateModelConfig is called
      const result = generateModelConfig(config);

      // #then research should use gpt-5-nano (fallback)
      expect(result.agents?.["research"]?.model).toBe("opencode/gpt-5-nano");
    });

    test("research uses gpt-5-mini when only Copilot available", () => {
      // #given only Copilot is available
      const config = createConfig({ hasCopilot: true });

      // #when generateModelConfig is called
      const result = generateModelConfig(config);

      // #then research should use gpt-5-mini (Copilot fallback)
      expect(result.agents?.["research"]?.model).toBe("github-copilot/gpt-5-mini");
    });
  });

  describe("research agent special cases", () => {
    test("research uses ZAI when ZAI is available regardless of other providers", () => {
      // #given ZAI and OpenAI are available
      const config = createConfig({
        hasOpenAI: true,
        hasZaiCodingPlan: true,
      });

      // #when generateModelConfig is called
      const result = generateModelConfig(config);

      // #then research should use ZAI_MODEL
      expect(result.agents?.["research"]?.model).toBe("zai-coding-plan/glm-4.7");
    });
  });

  describe("schema URL", () => {
    test("always includes correct schema URL", () => {
      // #given any config
      const config = createConfig();

      // #when generateModelConfig is called
      const result = generateModelConfig(config);

      // #then should include correct schema URL
      expect(result.$schema).toBe(
        "https://raw.githubusercontent.com/hackefeller/ghostwire/master/assets/ghostwire.schema.json",
      );
    });
  });
});
