import { describe, expect, it } from "bun:test";

import { getDefaultSkillTemplates } from "../catalog.js";
import { SKILL_NAMES } from "../constants.js";
import { getChangeApplySkillTemplate } from "../skills/kernel-change-apply/template.js";
import { getChangeArchiveSkillTemplate } from "../skills/kernel-change-archive/template.js";
import { getChangeExploreSkillTemplate } from "../skills/kernel-change-explore/template.js";
import { getChangeProposeSkillTemplate } from "../skills/kernel-change-propose/template.js";
import { getGhPrErrorsSkillTemplate } from "../skills/kernel-gh-pr-errors/template.js";

describe("Kernel skill templates", () => {
  const templates = [
    getGhPrErrorsSkillTemplate(),
    getChangeProposeSkillTemplate(),
    getChangeExploreSkillTemplate(),
    getChangeApplySkillTemplate(),
    getChangeArchiveSkillTemplate(),
  ];

  it("registers all Kernel skills in the default catalog", () => {
    const names = new Set(getDefaultSkillTemplates("extended").map((template) => template.name));

    expect(names.has(SKILL_NAMES.GH_PR_ERRORS)).toBe(true);
    expect(names.has(SKILL_NAMES.CHANGE_PROPOSE)).toBe(true);
    expect(names.has(SKILL_NAMES.CHANGE_EXPLORE)).toBe(true);
    expect(names.has(SKILL_NAMES.CHANGE_APPLY)).toBe(true);
    expect(names.has(SKILL_NAMES.CHANGE_ARCHIVE)).toBe(true);
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

  it("Kernel workflow skills preserve their operational content", () => {
    expect(getChangeProposeSkillTemplate().instructions).toContain("kernel new <name>");
    expect(getChangeExploreSkillTemplate().instructions).toContain("Explore mode is for thinking");
    expect(getChangeApplySkillTemplate().instructions).toContain("kernel instructions apply");
    expect(getChangeArchiveSkillTemplate().instructions).toContain("kernel/changes/archive");
  });

  it("removes legacy layout references from kernel workflow skills", () => {
    for (const template of templates) {
      expect(template.instructions).not.toContain("openspec");
      expect(template.instructions).not.toContain(".specify/");
    }
  });
});
