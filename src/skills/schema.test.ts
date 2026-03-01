import { describe, it, expect } from "bun:test";
import {
  skillSchema,
  type SkillSpec,
  validateSkill,
  validateSkillList,
  detectDuplicateSkillNames,
  serializeSkill,
  digestSkill,
} from "./schema";

describe("Skill Schema", () => {
  it("accepts a minimal valid skill", () => {
    const skill: SkillSpec = {
      name: "my-skill",
      description: "Does something useful",
      template: "# My Skill\n\nInstructions...",
    };
    const result = validateSkill(skill);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("my-skill");
  });

  it("accepts optional fields", async () => {
    const skill: SkillSpec = {
      name: "another-skill",
      description: "Detailed description",
      template: "template text",
      allowedTools: ["bash", "read"],
      agent: "my-agent",
      model: "gpt-4o",
      subtask: true,
      argumentHint: "--foo <bar>",
      metadata: { foo: 1 },
      license: "MIT",
      compatibility: ">=1.0",
      mcpConfig: { example: true } as any,
    };
    const result = validateSkill(skill);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.allowedTools).toHaveLength(2);
    }

    const digest = await digestSkill(skill);
    expect(typeof digest).toBe("string");
  });

  it("rejects missing required fields", () => {
    const skill = {
      description: "no name",
      template: "template",
    } as any;
    const result = validateSkill(skill);
    expect(result.success).toBe(false);
  });

  it("rejects invalid name patterns", () => {
    const badNames = ["-bad", "Bad", "123start", "with_space"];
    for (const name of badNames) {
      const skill = {
        name,
        description: "desc",
        template: "t",
      } as any;
      const result = validateSkill(skill);
      expect(result.success).toBe(false);
    }
  });

  it("can validate a list and report errors per index", () => {
    const arr = [
      { name: "good", description: "ok", template: "t" },
      { name: "Bad", description: "no", template: "t" },
    ];
    const results = validateSkillList(arr as unknown as unknown[]);
    expect(results.length).toBe(2);
    expect(results[0].isValid).toBe(true);
    expect(results[1].isValid).toBe(false);
    expect(results[1].errors.length).toBeGreaterThan(0);
  });

  it("detects duplicate skill names", () => {
    const skills: SkillSpec[] = [
      { name: "one", description: "", template: "" },
      { name: "one", description: "", template: "" },
      { name: "two", description: "", template: "" },
    ];
    const dup = detectDuplicateSkillNames(skills);
    expect(dup).toHaveLength(1);
    expect(dup[0].name).toBe("one");
    expect(dup[0].indices).toEqual([0, 1]);
  });

  it("serializeSkill produces deterministic json", () => {
    const skill: SkillSpec = {
      name: "serial",
      description: "desc",
      template: "template",
      allowedTools: ["z", "a"],
    };
    const s1 = serializeSkill(skill);
    const s2 = serializeSkill(skill);
    expect(s1).toBe(s2);
    expect(s1).toContain("allowedTools");
  });
});
