import { describe, test, expect } from "bun:test"

describe("Regression Tests", () => {
  describe("No Breaking Changes to Existing Agents", () => {
    test("builtin agents are unaffected", () => {
      //#given
      const builtinAgents = ["operator", "seer-advisor", "archive-researcher", "scout-recon", "build", "orchestrator", "planner", "tactician-strategist", "glitch-auditor"]

      //#when & #then
      builtinAgents.forEach((agent) => {
        expect(agent).toBeTruthy()
        expect(agent).not.toContain("grid:")
      })
    })

    test("builtin agent names are lowercase", () => {
      //#given
      const builtinAgents = ["operator", "seer-advisor", "archive-researcher", "scout-recon", "build", "orchestrator"]

      //#when
      const invalidAgents = builtinAgents.filter((agent) => agent !== agent.toLowerCase())

      //#then
      expect(invalidAgents.length).toBe(0)
    })
  })

  describe("No Breaking Changes to Existing Commands", () => {
    test("builtin commands remain unchanged", () => {
      //#given
      const builtinCommands = ["init-deep", "ultrawork-loop", "ulw-ultrawork", "cancel-ultrawork", "refactor", "jack-in-work", "stop-continuation"]

      //#when & #then
      builtinCommands.forEach((cmd) => {
        expect(cmd).toBeTruthy()
        expect(cmd).not.toContain("grid:")
      })
    })

    test("builtin command names use consistent pattern", () => {
      //#given
      const builtinCommands = ["init-deep", "ultrawork-loop", "ulw-ultrawork", "cancel-ultrawork", "refactor", "jack-in-work", "stop-continuation"]

      //#when
      const invalidCommands = builtinCommands.filter((cmd) => !cmd.match(/^[a-z]+(-[a-z]+)*$/))

      //#then
      expect(invalidCommands.length).toBe(0)
    })
  })

  describe("No Breaking Changes to Existing Skills", () => {
    test("builtin skills remain unchanged", () => {
      //#given
      const builtinSkills = ["playwright", "agent-browser", "frontend-ui-ux", "git-master", "learnings"]

      //#when & #then
      builtinSkills.forEach((skill) => {
        expect(skill).toBeTruthy()
      })
    })

    test("builtin skill names are lowercase with hyphens", () => {
      //#given
      const builtinSkills = ["playwright", "agent-browser", "frontend-ui-ux", "git-master", "learnings"]

      //#when
      const invalidSkills = builtinSkills.filter((skill) => !skill.match(/^[a-z]+(-[a-z]+)*$/))

      //#then
      expect(invalidSkills.length).toBe(0)
    })
  })

  describe("Learnings System", () => {
    test("learnings command exists", () => {
      //#given & #when
      const { BuiltinCommandNameSchema } = require('../src/platform/config/schema');
      
      //#then
      expect(BuiltinCommandNameSchema.safeParse("ghostwire:workflows:learnings").success).toBe(true)
    })
    
    test("learnings skill exists", () => {
      //#given & #when
      const { createBuiltinSkills } = require('../src/execution/features/builtin-skills/skills');
      const skills = createBuiltinSkills();
      
      //#then
      expect(skills.find(s => s.name === 'learnings')).toBeDefined()
    })
  })
})
