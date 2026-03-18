import { createAdapter } from './base.js';
import type { CommandContent } from './types.js';

function escapeYamlValue(value: string): string {
  const needsQuoting = /[:\n\r#{}\[\],&*!|>'"%@`]|^\s|\s$/.test(value);
  if (needsQuoting) {
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    return `"${escaped}"`;
  }
  return value;
}

function formatCommand(content: CommandContent): string {
  return `---
name: /jinn-${content.id}
id: jinn-${content.id}
category: ${escapeYamlValue(content.category)}
description: ${escapeYamlValue(content.description)}
---

${content.body}`;
}

export const cursorAdapter = createAdapter({
  toolId: 'cursor',
  toolName: 'Cursor',
  skillsDir: '.cursor',
  formatCommand,
});
