import type { CommandTemplate } from '../../core/templates/types.js';

export function getLintRubyCommandTemplate(): CommandTemplate {
  return {
    name: 'Lint Ruby',
    description: 'Run Ruby linting and style checks',
    category: 'Lint',
    tags: ['lint', 'ruby', 'style'],
    content: `# Lint Ruby

Run Ruby linting and style checks.

## Linters

- RuboCop - Main Ruby linter
- StandardRB - Opinionated Ruby style
- Fasterer - Performance checks

## Process

1. Run Linter
   - Check all Ruby files
   - Include rules configuration

2. Review Results
   - Fatal errors
   - Warnings
   - Style violations

3. Fix Issues
   - Auto-fixable first
   - Manual fixes needed
   - Document exceptions

4. Verify
   - Re-run linter
   - Ensure clean pass
`,
  };
}
