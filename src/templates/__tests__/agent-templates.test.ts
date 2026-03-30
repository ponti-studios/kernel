import { describe, expect, it } from "bun:test";

import { getDefaultAgentTemplates } from "../catalog.js";
import { AGENT_NAMES, SKILL_NAMES } from "../constants.js";

import {
  ALL_AGENTS,
  getArchitectAgentTemplate,
  getCaptureAgentTemplate,
  getDesignerAgentTemplate,
  getDoAgentTemplate,
  getGitAgentTemplate,
  getPlanAgentTemplate,
  getReviewAgentTemplate,
  getSearchAgentTemplate,
} from "../agents/index.js";

const templates = [
  getPlanAgentTemplate(),
  getDoAgentTemplate(),
  getReviewAgentTemplate(),
  getArchitectAgentTemplate(),
  getDesignerAgentTemplate(),
  getGitAgentTemplate(),
  getSearchAgentTemplate(),
];

describe("agent templates", () => {
  it("use kernel-prefixed agent identifiers", () => {
    expect(getPlanAgentTemplate().name).toBe(AGENT_NAMES.PLAN);
    expect(getDoAgentTemplate().name).toBe(AGENT_NAMES.DO);
    expect(getCaptureAgentTemplate().name).toBe(AGENT_NAMES.CAPTURE);
    expect(getReviewAgentTemplate().name).toBe(AGENT_NAMES.REVIEW);
    expect(getArchitectAgentTemplate().name).toBe(AGENT_NAMES.ARCHITECT);
    expect(getDesignerAgentTemplate().name).toBe(AGENT_NAMES.DESIGNER);
    expect(getGitAgentTemplate().name).toBe(AGENT_NAMES.GIT);
    expect(getSearchAgentTemplate().name).toBe(AGENT_NAMES.SEARCH);
  });

  it("expose available skills", () => {
    for (const template of templates) {
      expect(template.availableSkills?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("do not duplicate capability sections in instructions (added by formatAgent)", () => {
    for (const template of templates) {
      expect(template.instructions).not.toContain("## Available commands");
      expect(template.instructions).not.toContain("## Available skills");
    }
  });

  it("keeps review agent classified separately from orchestrators", () => {
    const review = getReviewAgentTemplate();
    expect(review.metadata?.category).toBe("Reviewer");
    expect(review.role).toBe("Reviewer");
  });

  it("assigns persona-aligned skills to specialist agents", () => {
    expect(getDesignerAgentTemplate().availableSkills).toEqual([
      SKILL_NAMES.DESIGN,
      SKILL_NAMES.REVIEW,
    ]);

    expect(getArchitectAgentTemplate().availableSkills).toEqual([
      SKILL_NAMES.REVIEW,
      SKILL_NAMES.MAP_CODEBASE,
      SKILL_NAMES.SHIP,
    ]);

    expect(getGitAgentTemplate().availableSkills).toEqual([SKILL_NAMES.GIT_MASTER]);

    expect(getSearchAgentTemplate().availableSkills).toEqual([
      SKILL_NAMES.GIT_MASTER,
      SKILL_NAMES.MAP_CODEBASE,
      SKILL_NAMES.RESEARCH,
    ]);

    expect(getReviewAgentTemplate().availableSkills).toEqual([
      SKILL_NAMES.REVIEW,
      SKILL_NAMES.SHIP,
      SKILL_NAMES.GIT_MASTER,
    ]);
  });

  it("assigns orchestration skills to planning and execution agents", () => {
    expect(getPlanAgentTemplate().availableSkills).toEqual([
      SKILL_NAMES.GIT_MASTER,
      SKILL_NAMES.DESIGN,
      SKILL_NAMES.MAP_CODEBASE,
      SKILL_NAMES.RESEARCH,
      SKILL_NAMES.PLAN,
      SKILL_NAMES.INTAKE,
    ]);

    expect(getDoAgentTemplate().availableSkills).toEqual([
      SKILL_NAMES.GIT_MASTER,
      SKILL_NAMES.DESIGN,
      SKILL_NAMES.REVIEW,
      SKILL_NAMES.STATUS,
      SKILL_NAMES.EXECUTE,
      SKILL_NAMES.SYNC,
      SKILL_NAMES.INTAKE,
      SKILL_NAMES.UNBLOCK,
      SKILL_NAMES.SHIP,
      SKILL_NAMES.PROJECT_INIT,
      SKILL_NAMES.BUILD,
      SKILL_NAMES.MAP_CODEBASE,
    ]);

    expect(getCaptureAgentTemplate().availableSkills).toEqual([
      SKILL_NAMES.GIT_MASTER,
      SKILL_NAMES.CLOSE,
    ]);
  });

  it("does not duplicate available skills within a template", () => {
    for (const template of templates) {
      expect(new Set(template.availableSkills).size).toBe(template.availableSkills?.length ?? 0);
    }
  });

  it("catalog ships every registered agent", () => {
    const defaultTemplates = getDefaultAgentTemplates();

    expect(defaultTemplates).toHaveLength(ALL_AGENTS.length);
    expect(defaultTemplates.map((template) => template.name)).toEqual(
      ALL_AGENTS.map((getAgentTemplate) => getAgentTemplate().name),
    );
  });
});
