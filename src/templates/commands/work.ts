import type { CommandTemplate } from '../../core/templates/types.js';

export function getWorkCancelCommandTemplate(): CommandTemplate {
  return {
    name: 'Work Cancel',
    description: 'Cancel ongoing work or process',
    category: 'Work',
    tags: ['cancel', 'stop', 'abort'],
    content: `# Work Cancel

Cancel ongoing work or process.

## When to Use

- User requests cancellation
- Error encountered
- Direction change needed

## Process

1. **Stop Execution**
   - Cancel running processes
   - Stop watchers/builds
   - Kill background jobs

2. **Save State**
   - Note current progress
   - Save partial work
   - Document what was done

3. **Cleanup**
   - Remove temporary files
   - Revert partial changes
   - Reset environment

4. **Report**
   - What was stopped
   - Why it was stopped
   - Recommendations for next steps
`,
  };
}

export function getWorkLoopCommandTemplate(): CommandTemplate {
  return {
    name: 'Work Loop',
    description: 'Execute work in a continuous loop',
    category: 'Work',
    tags: ['loop', 'iteration', 'repeat'],
    content: `# Work Loop

Execute work in a continuous loop.

## Purpose

Process multiple items or repeat until condition met.

## Use Cases

- Process queue items
- Batch processing
- Watch for changes

## Process

1. **Define Work Item**
   - What to process
   - Input source
   - Success criteria

2. **Execute Loop**
   - Process item
   - Check result
   - Handle errors
   - Continue or stop

3. **Monitor**
   - Progress tracking
   - Error handling
   - Performance

4. **Complete**
   - Final summary
   - Success/failure count
   - Recommendations
`,
  };
}
