import { describe, it, expect } from "bun:test";
import { CommandIntentSpec, commandIntentSpecSchema } from "./schema";

describe("CommandIntentSpec Schema", () => {
  describe("valid instances", () => {
    it("should accept minimal valid command intent", () => {
      const intent: CommandIntentSpec = {
        id: "ghostwire:workflows:plan",
        description: "Plan comprehensive solution",
        argsSchema: { type: "object" },
        acceptanceChecks: ["plan completeness validated"],
        defaultRoute: "do",
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("ghostwire:workflows:plan");
      }
    });

    it("should accept intent with lifecycleHints", () => {
      const intent: CommandIntentSpec = {
        id: "ghostwire:code:review",
        description: "Conduct comprehensive code reviews",
        argsSchema: { type: "object", properties: { file: { type: "string" } } },
        acceptanceChecks: ["review complete", "findings documented"],
        defaultRoute: "do",
        lifecycleHints: {
          phases: ["analysis", "recommendations"],
          estimatedDuration: "15m",
        },
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(true);
    });

    it("should accept intent with multiple acceptance checks", () => {
      const intent: CommandIntentSpec = {
        id: "ghostwire:project:deploy",
        description: "Deploy to environment",
        argsSchema: {},
        acceptanceChecks: [
          "build successful",
          "tests passing",
          "health checks green",
          "rollback ready",
        ],
        defaultRoute: "do",
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.acceptanceChecks).toHaveLength(4);
      }
    });
  });

  describe("invalid instances", () => {
    it("should reject intent with missing id", () => {
      const intent = {
        description: "Plan comprehensive solution",
        argsSchema: {},
        acceptanceChecks: ["plan complete"],
        defaultRoute: "do",
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(false);
    });

    it("should reject intent with empty id", () => {
      const intent = {
        id: "",
        description: "Plan comprehensive solution",
        argsSchema: {},
        acceptanceChecks: ["plan complete"],
        defaultRoute: "do",
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(false);
    });

    it("should reject intent with invalid id pattern (capital letters)", () => {
      const intent = {
        id: "Ghostwire:Workflows:Plan",
        description: "Plan comprehensive solution",
        argsSchema: {},
        acceptanceChecks: ["plan complete"],
        defaultRoute: "do",
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(false);
    });

    it("should reject intent with invalid id pattern (spaces)", () => {
      const intent = {
        id: "ghostwire workflows plan",
        description: "Plan comprehensive solution",
        argsSchema: {},
        acceptanceChecks: ["plan complete"],
        defaultRoute: "do",
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(false);
    });

    it("should reject intent with missing description", () => {
      const intent = {
        id: "ghostwire:workflows:plan",
        argsSchema: {},
        acceptanceChecks: ["plan complete"],
        defaultRoute: "do",
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(false);
    });

    it("should reject intent with empty description", () => {
      const intent = {
        id: "ghostwire:workflows:plan",
        description: "",
        argsSchema: {},
        acceptanceChecks: ["plan complete"],
        defaultRoute: "do",
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(false);
    });

    it("should accept argsSchema that is an object-like structure", () => {
      const intent = {
        id: "ghostwire:workflows:plan",
        description: "Plan comprehensive solution",
        argsSchema: { type: "object", properties: {} },
        acceptanceChecks: ["plan complete"],
        defaultRoute: "do",
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(true);
    });

    it("should reject intent with missing acceptanceChecks", () => {
      const intent = {
        id: "ghostwire:workflows:plan",
        description: "Plan comprehensive solution",
        argsSchema: {},
        defaultRoute: "do",
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(false);
    });

    it("should reject intent with empty acceptanceChecks array", () => {
      const intent = {
        id: "ghostwire:workflows:plan",
        description: "Plan comprehensive solution",
        argsSchema: {},
        acceptanceChecks: [],
        defaultRoute: "do",
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(false);
    });

    it("should reject intent with non-string acceptance check", () => {
      const intent = {
        id: "ghostwire:workflows:plan",
        description: "Plan comprehensive solution",
        argsSchema: {},
        acceptanceChecks: ["valid check", 123],
        defaultRoute: "do",
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(false);
    });

    it("should reject intent with missing defaultRoute", () => {
      const intent = {
        id: "ghostwire:workflows:plan",
        description: "Plan comprehensive solution",
        argsSchema: {},
        acceptanceChecks: ["plan complete"],
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(false);
    });

    it("should reject intent with empty defaultRoute", () => {
      const intent = {
        id: "ghostwire:workflows:plan",
        description: "Plan comprehensive solution",
        argsSchema: {},
        acceptanceChecks: ["plan complete"],
        defaultRoute: "",
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(false);
    });

    it("should reject intent with extra unknown properties", () => {
      const intent = {
        id: "ghostwire:workflows:plan",
        description: "Plan comprehensive solution",
        argsSchema: {},
        acceptanceChecks: ["plan complete"],
        defaultRoute: "do",
        unknownField: "should not allow",
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(false);
    });
  });

  describe("deterministic serialization", () => {
    it("should serialize and deserialize consistently", () => {
      const intent: CommandIntentSpec = {
        id: "ghostwire:workflows:plan",
        description: "Plan comprehensive solution",
        argsSchema: { type: "object", properties: { scope: { type: "string" } } },
        acceptanceChecks: ["plan complete", "dependencies validated"],
        defaultRoute: "do",
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(true);
      if (result.success) {
        const serialized = JSON.stringify(result.data);
        const deserialized = JSON.parse(serialized);
        const revalidated = commandIntentSpecSchema.safeParse(deserialized);
        expect(revalidated.success).toBe(true);
      }
    });

    it("should produce stable JSON representation", () => {
      const intent: CommandIntentSpec = {
        id: "ghostwire:code:review",
        description: "Review code",
        argsSchema: { type: "object" },
        acceptanceChecks: ["review complete"],
        defaultRoute: "do",
      };

      const result1 = commandIntentSpecSchema.safeParse(intent);
      const result2 = commandIntentSpecSchema.safeParse(intent);

      if (result1.success && result2.success) {
        expect(JSON.stringify(result1.data)).toBe(JSON.stringify(result2.data));
      }
    });
  });

  describe("type safety", () => {
    it("should reject non-string id", () => {
      const intent = {
        id: 123,
        description: "Plan comprehensive solution",
        argsSchema: {},
        acceptanceChecks: ["plan complete"],
        defaultRoute: "do",
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(false);
    });

    it("should reject non-string description", () => {
      const intent = {
        id: "ghostwire:workflows:plan",
        description: 42,
        argsSchema: {},
        acceptanceChecks: ["plan complete"],
        defaultRoute: "do",
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(false);
    });

    it("should reject non-string defaultRoute", () => {
      const intent = {
        id: "ghostwire:workflows:plan",
        description: "Plan comprehensive solution",
        argsSchema: {},
        acceptanceChecks: ["plan complete"],
        defaultRoute: 123,
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should accept id with allowed special characters (colons, hyphens)", () => {
      const intent: CommandIntentSpec = {
        id: "ghostwire:code-review:deep-dive",
        description: "Deep code review",
        argsSchema: {},
        acceptanceChecks: ["review complete"],
        defaultRoute: "do",
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(true);
    });

    it("should reject id starting with uppercase", () => {
      const intent = {
        id: "Ghostwire:workflows:plan",
        description: "Plan comprehensive solution",
        argsSchema: {},
        acceptanceChecks: ["plan complete"],
        defaultRoute: "do",
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(false);
    });

    it("should accept very long description", () => {
      const longDesc = "This is a very long description ".repeat(10);
      const intent: CommandIntentSpec = {
        id: "ghostwire:workflows:plan",
        description: longDesc,
        argsSchema: {},
        acceptanceChecks: ["plan complete"],
        defaultRoute: "do",
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(true);
    });

    it("should accept complex nested argsSchema", () => {
      const intent: CommandIntentSpec = {
        id: "ghostwire:workflows:plan",
        description: "Plan comprehensive solution",
        argsSchema: {
          type: "object",
          properties: {
            scope: { type: "string", enum: ["module", "file", "project"] },
            options: {
              type: "object",
              properties: {
                dryRun: { type: "boolean" },
              },
            },
          },
          required: ["scope"],
        },
        acceptanceChecks: ["plan complete"],
        defaultRoute: "do",
      };

      const result = commandIntentSpecSchema.safeParse(intent);
      expect(result.success).toBe(true);
    });
  });
});
