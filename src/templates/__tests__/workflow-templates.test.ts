import { describe, expect, it } from "bun:test";

import { getDefaultSkillTemplates } from "../catalog.js";
import { SKILL_NAMES } from "../constants.js";
import { getExploreSkillTemplate } from "../skills/kernel-explore/template.js";
import { getCloseSkillTemplate } from "../skills/kernel-close/template.js";
import { getExecuteSkillTemplate } from "../skills/kernel-execute/template.js";
import { getIntakeSkillTemplate } from "../skills/kernel-intake/template.js";
import { getPlanSkillTemplate } from "../skills/kernel-plan/template.js";
import { getResearchSkillTemplate } from "../skills/kernel-research/template.js";
import { getReviewSkillTemplate } from "../skills/kernel-review/template.js";
import { getShipSkillTemplate } from "../skills/kernel-ship/template.js";
import { getStatusSkillTemplate } from "../skills/kernel-status/template.js";
import { getSyncSkillTemplate } from "../skills/kernel-sync/template.js";
import { getUnblockSkillTemplate } from "../skills/kernel-unblock/template.js";

const templates = [
  getPlanSkillTemplate(),
  getResearchSkillTemplate(),
  getExecuteSkillTemplate(),
  getExploreSkillTemplate(),
  getStatusSkillTemplate(),
  getIntakeSkillTemplate(),
  getCloseSkillTemplate(),
  getShipSkillTemplate(),
  getSyncSkillTemplate(),
  getUnblockSkillTemplate(),
  getReviewSkillTemplate(),
];

describe("workflow skill templates", () => {
  it("all workflow skills have non-empty instructions", () => {
    for (const template of templates) {
      expect(template.instructions.length).toBeGreaterThan(0);
    }
  });

  it("all workflow skills have at least one allowed tool", () => {
    for (const template of templates) {
      expect(template.allowedTools?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("workflow skill dependencies exist in the default catalog", () => {
    const defaultSkillNames = new Set(getDefaultSkillTemplates("extended").map((template) => template.name));

    for (const template of templates) {
      for (const dependency of template.dependencies ?? []) {
        expect(defaultSkillNames.has(dependency)).toBe(true);
      }
    }
  });

  it("all workflow skills reference Linear", () => {
    for (const template of templates) {
      expect(template.instructions.toLowerCase()).toContain("linear");
    }
  });

  it("intake skill resolves team and labels before creating", () => {
    const instructions = getIntakeSkillTemplate().instructions;
    expect(instructions).toContain("label");
    expect(instructions).toContain("status");
  });

  it("sync skill presents drift report before applying changes", () => {
    const instructions = getSyncSkillTemplate().instructions;
    expect(instructions.toLowerCase()).toMatch(/confirm|approval|approve|present/);
  });

  it("unblock skill handles duplicate and blocked-by relations", () => {
    const instructions = getUnblockSkillTemplate().instructions;
    expect(instructions).toContain("duplicate");
    expect(instructions.toLowerCase()).toContain("block");
  });

  it("close skill produces a retrospective document", () => {
    const instructions = getCloseSkillTemplate().instructions;
    expect(instructions.toLowerCase()).toContain("retrospective");
  });

  it("plan skill supports initiative, project, milestone, and cycle scopes", () => {
    const instructions = getPlanSkillTemplate().instructions;
    expect(instructions.toLowerCase()).toContain("initiative");
    expect(instructions.toLowerCase()).toContain("project");
    expect(instructions.toLowerCase()).toContain("milestone");
    expect(instructions.toLowerCase()).toContain("cycle");
  });
});
