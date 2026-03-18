import { describe, expect, it } from 'bun:test';

import {
  getPlanAgentTemplate,
  getDoAgentTemplate,
  getReviewAgentTemplate,
  getArchitectAgentTemplate,
  getDesignerAgentTemplate,
  getGitAgentTemplate,
  getSearchCodeAgentTemplate,
  getSearchDocsAgentTemplate,
  getSearchHistoryAgentTemplate,
  getSearchLearningsAgentTemplate,
} from '../agents/index.js';

const templates = [
  getPlanAgentTemplate(),
  getDoAgentTemplate(),
  getReviewAgentTemplate(),
  getArchitectAgentTemplate(),
  getDesignerAgentTemplate(),
  getGitAgentTemplate(),
  getSearchCodeAgentTemplate(),
  getSearchDocsAgentTemplate(),
  getSearchHistoryAgentTemplate(),
  getSearchLearningsAgentTemplate(),
];

describe('agent templates', () => {
  it('expose available commands', () => {
    for (const template of templates) {
      expect(template.availableCommands?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it('expose available skills', () => {
    for (const template of templates) {
      expect(template.availableSkills?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it('do not duplicate capability sections in instructions (added by formatAgent)', () => {
    for (const template of templates) {
      expect(template.instructions).not.toContain('## Available commands');
      expect(template.instructions).not.toContain('## Related skills');
    }
  });
});
