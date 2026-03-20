import { describe, expect, it } from "bun:test";

import { getJinnApplySkillTemplate } from "../skills/jinn-apply/template.js";
import { getJinnArchiveSkillTemplate } from "../skills/jinn-archive/template.js";
import { getJinnExploreSkillTemplate } from "../skills/jinn-explore/template.js";
import { getJinnProposeSkillTemplate } from "../skills/jinn-propose/template.js";

const templates = [
  getJinnProposeSkillTemplate().instructions,
  getJinnExploreSkillTemplate().instructions,
  getJinnApplySkillTemplate().instructions,
  getJinnArchiveSkillTemplate().instructions,
];

describe("linear workflow templates", () => {
  it("reference Linear as the system of record", () => {
    for (const template of templates) {
      expect(template).toContain("Linear");
    }
  });

  it("do not depend on local spec artifacts", () => {
    for (const template of templates) {
      expect(template.includes("tasks.md")).toBe(false);
      expect(template.includes("spec.md")).toBe(false);
      expect(template.includes("openspec/changes")).toBe(false);
    }
  });
});
