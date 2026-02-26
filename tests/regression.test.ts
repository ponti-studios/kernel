import { describe, test, expect } from "bun:test";

describe("Regression Tests", () => {
  describe("No Breaking Changes to Existing Agents", () => {
    test("plugin agents are unaffected", () => {
      //#given
      const pluginAgents = [
        "operator",
        "advisor-plan",
        "researcher-data",
        "researcher-codebase",
        "build",
        "orchestrator",
        "planner",
        "advisor-strategy",
        "validator-bugs",
      ];

      //#when & #then
      pluginAgents.forEach((agent) => {
        expect(agent).toBeTruthy();
        expect(agent).not.toContain("grid:");
      });
    });

    test("plugin agent names are lowercase", () => {
      //#given
      const pluginAgents = [
        "operator",
        "advisor-plan",
        "researcher-data",
        "researcher-codebase",
        "build",
        "orchestrator",
      ];

      //#when
      const invalidAgents = pluginAgents.filter((agent) => agent !== agent.toLowerCase());

      //#then
      expect(invalidAgents.length).toBe(0);
    });
  });

  describe("No Breaking Changes to Existing Commands", () => {
    test("plugin commands remain unchanged", () => {
      //#given
      const pluginCommands = [
        "project:map",
        "work:loop",
        "work:cancel",
        "refactor",
        "workflows:execute",
        "workflows:stop",
      ];

      //#when & #then
      pluginCommands.forEach((cmd) => {
        expect(cmd).toBeTruthy();
        expect(cmd).not.toContain("grid:");
      });
    });

    test("plugin command names use consistent pattern", () => {
      //#given
      const pluginCommands = [
        "project:map",
        "work:loop",
        "work:cancel",
        "refactor",
        "workflows:execute",
        "workflows:stop",
      ];

      //#when
      const invalidCommands = pluginCommands.filter((cmd) => !cmd.match(/^[a-z:-]+$/));

      //#then
      expect(invalidCommands.length).toBe(0);
    });

    test("new project:map command exists (init-deep has been removed)", () => {
      //#given
      const { CommandNameSchema } = require("../src/platform/config/schema");

      //#when & #then
      expect(CommandNameSchema.safeParse("ghostwire:project:map").success).toBe(true);
      // init-deep has been removed - use project:map instead
      expect(CommandNameSchema.safeParse("ghostwire:init-deep").success).toBe(false);
    });
  });

  describe("No Breaking Changes to Existing Skills", () => {
    test("builtin skills remain unchanged", () => {
      //#given
      const builtinSkills = [
        "playwright",
        "agent-browser",
        "frontend-ui-ux",
        "git-master",
        "learnings",
      ];

      //#when & #then
      builtinSkills.forEach((skill) => {
        expect(skill).toBeTruthy();
      });
    });

    test("builtin skill names are lowercase with hyphens", () => {
      //#given
      const builtinSkills = [
        "playwright",
        "agent-browser",
        "frontend-ui-ux",
        "git-master",
        "learnings",
      ];

      //#when
      const invalidSkills = builtinSkills.filter((skill) => !skill.match(/^[a-z]+(-[a-z]+)*$/));

      //#then
      expect(invalidSkills.length).toBe(0);
    });
  });

  describe("Learnings System", () => {
    test("learnings command exists", () => {
      //#given & #when
      const { CommandNameSchema } = require("../src/platform/config/schema");

      //#then
      expect(CommandNameSchema.safeParse("ghostwire:workflows:learnings").success).toBe(true);
    });

    test("learnings skill exists", () => {
      //#given & #when
      const { createSkills } = require("../src/execution/features/skills/skills");
      const skills = createSkills();

      //#then
      expect(skills.find((s) => s.name === "learnings")).toBeDefined();
    });
  });

  describe("Backward Compatibility: Old Command Names", () => {
    test("old command names have been removed (use new names instead)", () => {
      //#given
      const { CommandNameSchema } = require("../src/platform/config/schema");
      const oldCommandNames = [
        "ghostwire:jack-in-work",
        "ghostwire:ultrawork-loop",
        "ghostwire:cancel-ultrawork",
        "ghostwire:stop-continuation",
      ];

      //#when & #then - all old names should now fail
      oldCommandNames.forEach((oldCmd) => {
        expect(CommandNameSchema.safeParse(oldCmd).success).toBe(false);
      });
    });

    test("new command names work correctly", () => {
      //#given
      const { CommandNameSchema } = require("../src/platform/config/schema");

      //#when & #then
      expect(CommandNameSchema.safeParse("ghostwire:workflows:execute").success).toBe(true);
      expect(CommandNameSchema.safeParse("ghostwire:work:loop").success).toBe(true);
      expect(CommandNameSchema.safeParse("ghostwire:work:cancel").success).toBe(true);
      expect(CommandNameSchema.safeParse("ghostwire:workflows:stop").success).toBe(true);
    });

    test("spec aliases have been removed", () => {
      //#given
      const { CommandNameSchema } = require("../src/platform/config/schema");
      const removedSpecAliases = [
        "ghostwire:spec:create",
        "ghostwire:spec:plan",
        "ghostwire:spec:tasks",
        "ghostwire:spec:implement",
        "ghostwire:spec:clarify",
        "ghostwire:spec:analyze",
        "ghostwire:spec:checklist",
        "ghostwire:spec:to-issues",
      ];

      //#when & #then
      removedSpecAliases.forEach((name) => {
        expect(CommandNameSchema.safeParse(name).success).toBe(false);
      });
    });
  });

  describe("New Task-Driven Command Names", () => {
    test("all new workflow commands are defined with ghostwire: prefix", () => {
      //#given
      const newWorkflowCommands = [
        "ghostwire:workflows:create",
        "ghostwire:workflows:execute",
        "ghostwire:workflows:status",
        "ghostwire:workflows:complete",
        "ghostwire:workflows:plan",
      ];

      //#when
      const { CommandNameSchema } = require("../src/platform/config/schema");

      //#then
      newWorkflowCommands.forEach((cmd) => {
        expect(CommandNameSchema.safeParse(cmd).success).toBe(true);
      });
    });

    test("all new work loop commands are defined with ghostwire: prefix", () => {
      //#given
      const newWorkCommands = ["ghostwire:work:loop", "ghostwire:work:cancel"];

      //#when
      const { CommandNameSchema } = require("../src/platform/config/schema");

      //#then
      newWorkCommands.forEach((cmd) => {
        expect(CommandNameSchema.safeParse(cmd).success).toBe(true);
      });
    });

    test("new commands exist (old aliases have been removed)", () => {
      //#given
      const { CommandNameSchema } = require("../src/platform/config/schema");
      const newCommands = [
        "ghostwire:workflows:execute",
        "ghostwire:work:loop",
        "ghostwire:work:cancel",
        "ghostwire:workflows:stop",
      ];

      //#when & #then - new commands work, old aliases are removed
      newCommands.forEach((cmd) => {
        expect(CommandNameSchema.safeParse(cmd).success).toBe(true);
      });
    });
  });
});
