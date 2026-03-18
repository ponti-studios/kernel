import type { CommandTemplate } from '../../core/templates/types.js';

export function getCodeFormatCommandTemplate(): CommandTemplate {
  return {
    name: 'Code Format',
    description: 'Apply consistent formatting and style standards',
    category: 'Code',
    tags: ['formatting', 'style', 'code-quality'],
    content: `# Code Format

Apply consistent formatting and style standards across codebase.

## When to Use

- Before committing changes
- During code cleanup sessions
- When onboarding new team members
- After modifying linting rules

## Process

1. **Determine Formatter**
   
   Check which formatter your project uses:
   - JavaScript/TypeScript: prettier, eslint
   - Ruby: standardrb, rubocop
   - Python: black, autopep8
   - Rust: rustfmt
   - Go: gofmt

2. **Run the Formatter**
   
   Execute the appropriate formatter for your changes.

3. **Review Changes**
   
   Check the formatted output for correctness.

4. **Commit Separately**
   
   If part of a larger change, commit formatting separately.

## Rules

- Separate formatting from functional changes
- Get team consensus on formatting rules
- Run in CI to ensure checks pass
- Document exceptions
`,
  };
}

export function getCodeRefactorCommandTemplate(): CommandTemplate {
  return {
    name: 'Code Refactor',
    description: 'Systematically refactor code while maintaining functionality',
    category: 'Code',
    tags: ['refactoring', 'code-quality', 'maintenance'],
    content: `# Code Refactor

Systematically refactor code while maintaining functionality.

## Process

1. **Scope Analysis**
   
   Define refactoring boundaries (file, module, or project level)

2. **Impact Assessment**
   
   Identify affected code, tests, and dependencies

3. **Strategy Selection**
   
   Choose approach: safe vs aggressive, incremental vs comprehensive

4. **Refactoring Execution**
   
   Apply transformations using code transformation tools

5. **Verification**
   
   Run tests and validate functionality

6. **Documentation**
   
   Update comments and related documentation

## Refactoring Types

- Extract Method - Break large functions into smaller units
- Rename - Improve code clarity through better naming
- Inline - Remove unnecessary abstraction layers
- Move - Reorganize code for better structure
- Simplify - Remove duplication and complexity

## Rules

- Always run tests before and after
- Make one type of change at a time
- Commit frequently with clear messages
- Don't change behavior, only structure
`,
  };
}

export function getCodeReviewCommandTemplate(): CommandTemplate {
  return {
    name: 'Code Review',
    description: 'Conduct comprehensive code reviews',
    category: 'Code',
    tags: ['review', 'code-quality', 'security'],
    content: `# Code Review

Conduct comprehensive code reviews.

## Review Types

- Architecture Review - High-level design and patterns
- Security Review - Vulnerability and security best practices
- Performance Review - Optimization opportunities
- Style Review - Code quality and consistency
- Complexity Review - Simplification opportunities
- Test Coverage Review - Testing strategy adequacy

## Process

1. **Understand Context**
   
   Read the code and understand what it's trying to do

2. **Identify Issues**
   
   Look for bugs, security issues, performance problems

3. **Suggest Improvements**
   
   Offer constructive suggestions for better code

4. **Prioritize**
   
   Distinguish must-fix from nice-to-have

## Output

- Structured review comments
- Priority-ordered issues
- Actionable suggestions
- References to relevant patterns
`,
  };
}

export function getCodeOptimizeCommandTemplate(): CommandTemplate {
  return {
    name: 'Code Optimize',
    description: 'Improve performance and reduce bundle size',
    category: 'Code',
    tags: ['performance', 'optimization', 'efficiency'],
    content: `# Code Optimize

Improve performance, reduce bundle size, or enhance runtime efficiency.

## Optimization Areas

- Algorithmic - Better algorithms and data structures
- Memory - Reduce allocations and improve garbage collection
- CPU - Cache-friendly code, vectorization
- Network - Reduce requests, optimize payload sizes
- Build - Faster compilation and bundling
- Runtime - Lazy loading, code splitting

## Process

1. **Profile First**
   
   Identify actual bottlenecks before optimizing

2. **Measure**
   
   Benchmark performance before and after

3. **Optimize**
   
   Apply targeted optimizations

4. **Verify**
   
   Ensure improvements are real and don't break things

## Rules

- Don't optimize prematurely
- Profile to find real bottlenecks
- Measure with realistic data
- Don't sacrifice readability for minor gains
`,
  };
}
