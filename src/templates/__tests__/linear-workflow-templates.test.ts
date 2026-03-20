import { describe, expect, it } from "bun:test";

import { getSpecApplySkillTemplate } from "../skills/spec-apply/template.js";
import { getSpecArchiveSkillTemplate } from "../skills/spec-archive/template.js";
import { getSpecExploreSkillTemplate } from "../skills/spec-explore/template.js";
import { getSpecProposeSkillTemplate } from "../skills/spec-propose/template.js";

const templates = [
  getSpecProposeSkillTemplate().instructions,
  getSpecExploreSkillTemplate().instructions,
  getSpecApplySkillTemplate().instructions,
  getSpecArchiveSkillTemplate().instructions,
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
