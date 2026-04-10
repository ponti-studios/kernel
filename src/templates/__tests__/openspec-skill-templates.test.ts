import { describe, expect, it } from "bun:test";

import { getDefaultSkillTemplates } from "../catalog.js";
import { SKILL_NAMES } from "../constants.js";
import { getGhPrErrorsSkillTemplate } from "../skills/kernel-gh-pr-errors/template.js";
import { getOpenSpecApplyChangeSkillTemplate } from "../skills/kernel-openspec-apply-change/template.js";
import { getOpenSpecArchiveChangeSkillTemplate } from "../skills/kernel-openspec-archive-change/template.js";
import { getOpenSpecExploreSkillTemplate } from "../skills/kernel-openspec-explore/template.js";
import { getOpenSpecProposeSkillTemplate } from "../skills/kernel-openspec-propose/template.js";

describe("OpenSpec skill templates", () => {
  const templates = [
    getGhPrErrorsSkillTemplate(),
    getOpenSpecProposeSkillTemplate(),
    getOpenSpecExploreSkillTemplate(),
    getOpenSpecApplyChangeSkillTemplate(),
    getOpenSpecArchiveChangeSkillTemplate(),
  ];

  it("registers all OpenSpec skills in the default catalog", () => {
    const names = new Set(getDefaultSkillTemplates("extended").map((template) => template.name));

    expect(names.has(SKILL_NAMES.GH_PR_ERRORS)).toBe(true);
    expect(names.has(SKILL_NAMES.OPENSPEC_PROPOSE)).toBe(true);
    expect(names.has(SKILL_NAMES.OPENSPEC_EXPLORE)).toBe(true);
    expect(names.has(SKILL_NAMES.OPENSPEC_APPLY_CHANGE)).toBe(true);
    expect(names.has(SKILL_NAMES.OPENSPEC_ARCHIVE_CHANGE)).toBe(true);
  });

  it("has non-empty instructions", () => {
    for (const template of templates) {
      expect(template.instructions.length).toBeGreaterThan(0);
    }
  });

  it("gh-pr-errors preserves the shell helper and CI edge cases", () => {
    const template = getGhPrErrorsSkillTemplate();
    expect(template.references?.[0]?.relativePath).toBe("scripts/check-last-gh-actions-errors.sh");
    expect(template.instructions).toContain("`gh` is missing or unauthenticated");
    expect(template.instructions).toContain("no pull request workflow runs exist yet");
    expect(template.instructions).toContain("first actionable error");
  });

  it("OpenSpec workflow skills preserve their operational content", () => {
    expect(getOpenSpecProposeSkillTemplate().instructions).toContain("openspec new change");
    expect(getOpenSpecExploreSkillTemplate().instructions).toContain("Explore mode is for thinking");
    expect(getOpenSpecApplyChangeSkillTemplate().instructions).toContain("openspec instructions apply");
    expect(getOpenSpecArchiveChangeSkillTemplate().instructions).toContain("openspec/changes/archive");
  });
});
