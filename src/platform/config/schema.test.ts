import { describe, expect, test } from "bun:test";
import {
  AgentNameSchema,
  AgentOverrideConfigSchema,
  BrowserAutomationConfigSchema,
  BrowserAutomationProviderSchema,
  CategoryNameSchema,
  CategoryConfigSchema,
  GhostwireConfigSchema,
} from "./schema";

describe("disabled_mcps schema", () => {
  test("should accept built-in MCP names", () => {
    //#given
    const config = {
      disabled_mcps: ["context7", "grep_app"],
    };

    //#when
    const result = GhostwireConfigSchema.safeParse(config);

    //#then
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.disabled_mcps).toEqual(["context7", "grep_app"]);
    }
  });

  test("should accept custom MCP names", () => {
    //#given
    const config = {
      disabled_mcps: ["playwright", "sqlite", "custom-mcp"],
    };

    //#when
    const result = GhostwireConfigSchema.safeParse(config);

    //#then
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.disabled_mcps).toEqual(["playwright", "sqlite", "custom-mcp"]);
    }
  });

  test("should accept mixed built-in and custom names", () => {
    //#given
    const config = {
      disabled_mcps: ["context7", "playwright", "custom-server"],
    };

    //#when
    const result = GhostwireConfigSchema.safeParse(config);

    //#then
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.disabled_mcps).toEqual(["context7", "playwright", "custom-server"]);
    }
  });

  test("should accept empty array", () => {
    //#given
    const config = {
      disabled_mcps: [],
    };

    //#when
    const result = GhostwireConfigSchema.safeParse(config);

    //#then
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.disabled_mcps).toEqual([]);
    }
  });

  test("should reject non-string values", () => {
    //#given
    const config = {
      disabled_mcps: [123, true, null],
    };

    //#when
    const result = GhostwireConfigSchema.safeParse(config);

    //#then
    expect(result.success).toBe(false);
  });

  test("should accept undefined (optional field)", () => {
    //#given
    const config = {};

    //#when
    const result = GhostwireConfigSchema.safeParse(config);

    //#then
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.disabled_mcps).toBeUndefined();
    }
  });

  test("should reject empty strings", () => {
    //#given
    const config = {
      disabled_mcps: [""],
    };

    //#when
    const result = GhostwireConfigSchema.safeParse(config);

    //#then
    expect(result.success).toBe(false);
  });

  test("should accept MCP names with various naming patterns", () => {
    //#given
    const config = {
      disabled_mcps: [
        "my-custom-mcp",
        "my_custom_mcp",
        "myCustomMcp",
        "my.custom.mcp",
        "my-custom-mcp-123",
      ],
    };

    //#when
    const result = GhostwireConfigSchema.safeParse(config);

    //#then
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.disabled_mcps).toEqual([
        "my-custom-mcp",
        "my_custom_mcp",
        "myCustomMcp",
        "my.custom.mcp",
        "my-custom-mcp-123",
      ]);
    }
  });
});

describe("AgentOverrideConfigSchema", () => {
  describe("category field", () => {
    test("accepts category as optional string", () => {
      // #given
      const config = { category: "visual-engineering" };

      // #when
      const result = AgentOverrideConfigSchema.safeParse(config);

      // #then
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.category).toBe("visual-engineering");
      }
    });

    test("accepts config without category", () => {
      // #given
      const config = { temperature: 0.5 };

      // #when
      const result = AgentOverrideConfigSchema.safeParse(config);

      // #then
      expect(result.success).toBe(true);
    });

    test("rejects non-string category", () => {
      // #given
      const config = { category: 123 };

      // #when
      const result = AgentOverrideConfigSchema.safeParse(config);

      // #then
      expect(result.success).toBe(false);
    });
  });

  describe("variant field", () => {
    test("accepts variant as optional string", () => {
      // #given
      const config = { variant: "high" };

      // #when
      const result = AgentOverrideConfigSchema.safeParse(config);

      // #then
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.variant).toBe("high");
      }
    });

    test("rejects non-string variant", () => {
      // #given
      const config = { variant: 123 };

      // #when
      const result = AgentOverrideConfigSchema.safeParse(config);

      // #then
      expect(result.success).toBe(false);
    });
  });

  describe("skills field", () => {
    test("accepts skills as optional string array", () => {
      // #given
      const config = { skills: ["frontend-ui-ux", "code-reviewer"] };

      // #when
      const result = AgentOverrideConfigSchema.safeParse(config);

      // #then
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.skills).toEqual(["frontend-ui-ux", "code-reviewer"]);
      }
    });

    test("accepts empty skills array", () => {
      // #given
      const config = { skills: [] };

      // #when
      const result = AgentOverrideConfigSchema.safeParse(config);

      // #then
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.skills).toEqual([]);
      }
    });

    test("accepts config without skills", () => {
      // #given
      const config = { temperature: 0.5 };

      // #when
      const result = AgentOverrideConfigSchema.safeParse(config);

      // #then
      expect(result.success).toBe(true);
    });

    test("rejects non-array skills", () => {
      // #given
      const config = { skills: "frontend-ui-ux" };

      // #when
      const result = AgentOverrideConfigSchema.safeParse(config);

      // #then
      expect(result.success).toBe(false);
    });
  });

  describe("backward compatibility", () => {
    test("still accepts model field (deprecated)", () => {
      // #given
      const config = { model: "openai/gpt-5.2" };

      // #when
      const result = AgentOverrideConfigSchema.safeParse(config);

      // #then
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.model).toBe("openai/gpt-5.2");
      }
    });

    test("accepts both model and category (deprecated usage)", () => {
      // #given - category should take precedence at runtime, but both should validate
      const config = {
        model: "openai/gpt-5.2",
        category: "ultrabrain",
      };

      // #when
      const result = AgentOverrideConfigSchema.safeParse(config);

      // #then
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.model).toBe("openai/gpt-5.2");
        expect(result.data.category).toBe("ultrabrain");
      }
    });
  });

  describe("combined fields", () => {
    test("accepts category with skills", () => {
      // #given
      const config = {
        category: "visual-engineering",
        skills: ["frontend-ui-ux"],
      };

      // #when
      const result = AgentOverrideConfigSchema.safeParse(config);

      // #then
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.category).toBe("visual-engineering");
        expect(result.data.skills).toEqual(["frontend-ui-ux"]);
      }
    });

    test("accepts category with skills and other fields", () => {
      // #given
      const config = {
        category: "ultrabrain",
        skills: ["code-reviewer"],
        temperature: 0.3,
        prompt_append: "Extra instructions",
      };

      // #when
      const result = AgentOverrideConfigSchema.safeParse(config);

      // #then
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.category).toBe("ultrabrain");
        expect(result.data.skills).toEqual(["code-reviewer"]);
        expect(result.data.temperature).toBe(0.3);
        expect(result.data.prompt_append).toBe("Extra instructions");
      }
    });
  });
});

describe("CategoryConfigSchema", () => {
  test("accepts variant as optional string", () => {
    // #given
    const config = { model: "openai/gpt-5.2", variant: "xhigh" };

    // #when
    const result = CategoryConfigSchema.safeParse(config);

    // #then
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.variant).toBe("xhigh");
    }
  });

  test("accepts reasoningEffort as optional string with xhigh", () => {
    // #given
    const config = { reasoningEffort: "xhigh" };

    // #when
    const result = CategoryConfigSchema.safeParse(config);

    // #then
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.reasoningEffort).toBe("xhigh");
    }
  });

  test("rejects non-string variant", () => {
    // #given
    const config = { model: "openai/gpt-5.2", variant: 123 };

    // #when
    const result = CategoryConfigSchema.safeParse(config);

    // #then
    expect(result.success).toBe(false);
  });
});

describe("two-agent runtime schema", () => {
  test("accepts only do and research in disabled_agents", () => {
    const result = GhostwireConfigSchema.safeParse({
      disabled_agents: ["do", "research"],
    });
    expect(result.success).toBe(true);
  });

  test("rejects retired agent names in disabled_agents", () => {
    const result = GhostwireConfigSchema.safeParse({
      disabled_agents: ["planner"],
    });
    expect(result.success).toBe(false);
  });

  test("AgentNameSchema accepts do and research", () => {
    expect(AgentNameSchema.safeParse("do").success).toBe(true);
    expect(AgentNameSchema.safeParse("research").success).toBe(true);
  });
});

describe("CategoryNameSchema", () => {
  test("accepts all plugin category names", () => {
    // #given
    const categories = [
      "visual-engineering",
      "ultrabrain",
      "artistry",
      "quick",
      "unspecified-low",
      "unspecified-high",
      "writing",
    ];

    // #when / #then
    for (const cat of categories) {
      const result = CategoryNameSchema.safeParse(cat);
      expect(result.success).toBe(true);
    }
  });
});

describe("Two-agent override schema", () => {
  test("schema accepts agents['do'] and retains the key after parsing", () => {
    // #given
    const config = {
      agents: {
        do: {
          model: "openai/gpt-5.2",
          temperature: 0.2,
        },
      },
    };

    // #when
    const result = GhostwireConfigSchema.safeParse(config);

    // #then
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.agents?.do).toBeDefined();
      expect(result.data.agents?.do?.model).toBe("openai/gpt-5.2");
      expect(result.data.agents?.do?.temperature).toBe(0.2);
    }
  });

  test("schema accepts do with prompt_append", () => {
    // #given
    const config = {
      agents: {
        do: {
          prompt_append: "Additional instructions for do",
        },
      },
    };

    // #when
    const result = GhostwireConfigSchema.safeParse(config);

    // #then
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.agents?.do?.prompt_append).toBe("Additional instructions for do");
    }
  });

  test("schema accepts do with tools override", () => {
    // #given
    const config = {
      agents: {
        do: {
          tools: {
            read: true,
            write: false,
          },
        },
      },
    };

    // #when
    const result = GhostwireConfigSchema.safeParse(config);

    // #then
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.agents?.do?.tools).toEqual({
        read: true,
        write: false,
      });
    }
  });

  test("schema accepts do and research override keys", () => {
    // #given
    const config = {
      agents: {
        do: {
          temperature: 0.1,
        },
        research: {
          temperature: 0.2,
        },
      },
    };

    // #when
    const result = GhostwireConfigSchema.safeParse(config);

    // #then
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.agents?.do?.temperature).toBe(0.1);
      expect(result.data.agents?.research?.temperature).toBe(0.2);
    }
  });

  test("schema rejects retired override keys", () => {
    // #given
    const config = {
      agents: {
        planner: {
          temperature: 0.3,
        },
      },
    };

    // #when
    const result = GhostwireConfigSchema.safeParse(config);

    // #then
    expect(result.success).toBe(false);
  });
});

describe("BrowserAutomationProviderSchema", () => {
  test("accepts 'playwright' as valid provider", () => {
    // #given
    const input = "playwright";

    // #when
    const result = BrowserAutomationProviderSchema.safeParse(input);

    // #then
    expect(result.success).toBe(true);
    expect(result.data).toBe("playwright");
  });

  test("accepts 'agent-browser' as valid provider", () => {
    // #given
    const input = "agent-browser";

    // #when
    const result = BrowserAutomationProviderSchema.safeParse(input);

    // #then
    expect(result.success).toBe(true);
    expect(result.data).toBe("agent-browser");
  });

  test("rejects invalid provider", () => {
    // #given
    const input = "invalid-provider";

    // #when
    const result = BrowserAutomationProviderSchema.safeParse(input);

    // #then
    expect(result.success).toBe(false);
  });
});

describe("BrowserAutomationConfigSchema", () => {
  test("defaults provider to 'playwright' when not specified", () => {
    // #given
    const input = {};

    // #when
    const result = BrowserAutomationConfigSchema.parse(input);

    // #then
    expect(result.provider).toBe("playwright");
  });

  test("accepts agent-browser provider", () => {
    // #given
    const input = { provider: "agent-browser" };

    // #when
    const result = BrowserAutomationConfigSchema.parse(input);

    // #then
    expect(result.provider).toBe("agent-browser");
  });
});

describe("GhostwireConfigSchema - browser_automation_engine", () => {
  test("accepts browser_automation_engine config", () => {
    // #given
    const input = {
      browser_automation_engine: {
        provider: "agent-browser",
      },
    };

    // #when
    const result = GhostwireConfigSchema.safeParse(input);

    // #then
    expect(result.success).toBe(true);
    expect(result.data?.browser_automation_engine?.provider).toBe("agent-browser");
  });

  test("accepts config without browser_automation_engine", () => {
    // #given
    const input = {};

    // #when
    const result = GhostwireConfigSchema.safeParse(input);

    // #then
    expect(result.success).toBe(true);
    expect(result.data?.browser_automation_engine).toBeUndefined();
  });
});
