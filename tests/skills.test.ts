import { describe, test, expect } from "bun:test";
import { createBuiltinSkills } from "../src/execution/features/skills/skills";

describe("Learnings Skill", () => {
  test("learnings skill is defined in builtin skills", () => {
    //#given
    const skills = createBuiltinSkills();

    //#when
    const learningsSkill = skills.find((s) => s.name === "learnings");

    //#then
    expect(learningsSkill).toBeDefined();
    expect(learningsSkill?.name).toBe("learnings");
  });

  test("learnings skill has description", () => {
    //#given
    const skills = createBuiltinSkills();
    const learningsSkill = skills.find((s) => s.name === "learnings");

    //#when & #then
    expect(learningsSkill?.description).toBeDefined();
    expect(learningsSkill?.description.length).toBeGreaterThan(20);
  });

  test("learnings skill has template", () => {
    //#given
    const skills = createBuiltinSkills();
    const learningsSkill = skills.find((s) => s.name === "learnings");

    //#when & #then
    expect(learningsSkill?.template).toBeDefined();
    expect(learningsSkill?.template.length).toBeGreaterThan(50);
  });
});
