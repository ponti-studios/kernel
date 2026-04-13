import { describe, expect, it } from "bun:test";

import { getDefaultCommandTemplates, getDefaultSkillTemplates } from "../catalog.js";
import { COMMAND_NAMES, SKILL_NAMES } from "../constants.js";

describe("command templates", () => {
  const commands = getDefaultCommandTemplates();
  const skillNames = new Set(getDefaultSkillTemplates("extended").map((template) => template.name));

  it("registers the expected kernel change and kernel spec commands", () => {
    const names = new Set(commands.map((command) => command.name));

    expect(names.has(COMMAND_NAMES.GH_PR_ERRORS)).toBe(true);
    expect(names.has(COMMAND_NAMES.CHANGE_PROPOSE)).toBe(true);
    expect(names.has(COMMAND_NAMES.CHANGE_EXPLORE)).toBe(true);
    expect(names.has(COMMAND_NAMES.CHANGE_APPLY)).toBe(true);
    expect(names.has(COMMAND_NAMES.CHANGE_ARCHIVE)).toBe(true);
    expect(names.has(COMMAND_NAMES.SPEC_PLAN)).toBe(true);
    expect(names.has(COMMAND_NAMES.SPEC_TASKS_TO_ISSUES)).toBe(true);
  });

  it("keeps backedBySkill references valid", () => {
    for (const command of commands) {
      if (!command.backedBySkill) continue;
      expect(skillNames.has(command.backedBySkill)).toBe(true);
    }
  });

  it("preserves gh-pr-errors intent and routing", () => {
    const command = commands.find((entry) => entry.name === COMMAND_NAMES.GH_PR_ERRORS);
    expect(command).toBeDefined();
    expect(command!.backedBySkill).toBe(SKILL_NAMES.GH_PR_ERRORS);
    expect(command!.instructions).toContain("Use the `kernel-gh-pr-errors` skill.");
    expect(command!.instructions).toContain("first actionable error");
  });

  it("preserves kernel change command content", () => {
    const apply = commands.find((entry) => entry.name === COMMAND_NAMES.CHANGE_APPLY);
    const archive = commands.find((entry) => entry.name === COMMAND_NAMES.CHANGE_ARCHIVE);

    expect(apply!.instructions).toContain("kernel instructions apply");
    expect(apply!.instructions).toContain("Mark task complete");
    expect(archive!.instructions).toContain("Archive Complete");
    expect(archive!.instructions).toContain("kernel/changes/archive");
  });

  it("fully removes legacy surfaces from command content", () => {
    for (const command of commands) {
      expect(command.instructions).not.toContain("openspec");
      expect(command.instructions).not.toContain("opsx");
      expect(command.instructions).not.toContain("speckit");
      expect(command.instructions).not.toContain(".specify/");
    }
  });
});
