import { describe, expect, it } from 'bun:test';

import {
  getJinnApplyCommandTemplate,
  getJinnArchiveCommandTemplate,
  getJinnExploreCommandTemplate,
  getJinnProposeCommandTemplate,
} from '../commands/workflows.js';
import {
  getJinnApplySkillTemplate,
  getJinnArchiveSkillTemplate,
  getJinnExploreSkillTemplate,
  getJinnProposeSkillTemplate,
} from '../skills/jinn-skills.js';

const templates = [
  getJinnProposeCommandTemplate().content,
  getJinnExploreCommandTemplate().content,
  getJinnApplyCommandTemplate().content,
  getJinnArchiveCommandTemplate().content,
  getJinnProposeSkillTemplate().instructions,
  getJinnExploreSkillTemplate().instructions,
  getJinnApplySkillTemplate().instructions,
  getJinnArchiveSkillTemplate().instructions,
];

describe('linear workflow templates', () => {
  it('reference Linear as the system of record', () => {
    for (const template of templates) {
      expect(template).toContain('Linear');
    }
  });

  it('do not depend on local spec artifacts', () => {
    for (const template of templates) {
      expect(template.includes('tasks.md')).toBe(false);
      expect(template.includes('spec.md')).toBe(false);
      expect(template.includes('openspec/changes')).toBe(false);
    }
  });
});
