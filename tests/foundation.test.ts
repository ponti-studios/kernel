import { describe, test, expect } from 'bun:test'

describe('Learnings System - Foundation Tests', () => {
  describe('Learnings Command', () => {
    test('learnings command is registered', () => {
      // Verify the learnings command exists in schema
      const { BuiltinCommandNameSchema } = require('../src/platform/config/schema');
      
      const result = BuiltinCommandNameSchema.safeParse("ghostwire:workflows:learnings");
      expect(result.success).toBe(true);
    });
  });

  describe('Learnings Skill', () => {
    test('learnings skill is registered', () => {
      // Verify the learnings skill directory exists
      const fs = require('fs');
      
      const skillPath = 'src/execution/features/builtin-skills/learnings/SKILL.md';
      expect(fs.existsSync(skillPath)).toBe(true);
      expect(fs.statSync(skillPath).isFile()).toBe(true);
    });
    
    test('learnings skill has valid frontmatter', () => {
      const { createBuiltinSkills } = require('../src/execution/features/skills/skills');
      
      const skills = createBuiltinSkills();
      const learningsSkill = skills.find(s => s.name === 'learnings');
      
      expect(learningsSkill).toBeDefined();
      expect(learningsSkill?.description).toBeDefined();
      expect(learningsSkill?.template).toBeDefined();
    });
  });
});
