# code

Source: code.ts

<command-instruction>
# Code:Refactor Command

Systematically refactor code while maintaining functionality and improving clarity, performance, or maintainability.

## Process

1. **Scope Analysis** - Define refactoring boundaries (file, module, or project level)
2. **Impact Assessment** - Identify affected code, tests, and dependencies
3. **Strategy Selection** - Choose approach (safe vs aggressive, incremental vs comprehensive)
4. **Refactoring Execution** - Apply transformations using code transformation tools
5. **Verification** - Run tests and validate functionality
6. **Documentation** - Update comments and related documentation

## Key Agents & Tasks

- Use \`reviewer-typescript\` or \`reviewer-python\` for language-specific reviews
- Use \`reviewer-simplicity\` to ensure simplifications don't over-engineer
- Use \`analyzer-patterns\` to identify and apply consistent patterns
- Run comprehensive test suites before/after refactoring

## Refactoring Types

- **Extract Method** - Break large functions into smaller, focused units
- **Rename** - Improve code clarity through better naming
- **Inline** - Remove unnecessary abstraction layers
- **Move** - Reorganize code for better structure
- **Simplify** - Remove duplication and complexity
- **Performance** - Optimize without changing behavior
</command-instruction>

<refactoring-target>
$ARGUMENTS
</refactoring-target>

---

<command-instruction>
# Code:Review Command

Conduct comprehensive code reviews leveraging multiple specialist agents.

## Review Types

- **Architecture Review** - High-level design and patterns
- **Security Review** - Vulnerability and security best practices
- **Performance Review** - Optimization opportunities
- **Style Review** - Code quality and consistency
- **Complexity Review** - Simplification opportunities
- **Test Coverage Review** - Testing strategy adequacy

## Key Agents & Tasks

- Use \`reviewer-rails\` for Ruby/Rails code
- Use \`reviewer-python\` for Python code
- Use \`reviewer-typescript\` for TypeScript/JavaScript
- Use \`reviewer-rails-dh\` for architectural opinions
- Use \`security-sentinel\` for security issues
- Use \`performance-advisor-plan\` for optimization
- Use \`reviewer-simplicity\` for YAGNI violations

## Output

- Structured review comments
- Priority-ordered issues
- Actionable suggestions
- References to relevant patterns or best practices
</command-instruction>

<code-context>
$ARGUMENTS
</code-context>

---

<command-instruction>
# Code:Optimize Command

Improve performance, reduce bundle size, or enhance runtime efficiency.

## Optimization Areas

- **Algorithmic** - Better algorithms and data structures
- **Memory** - Reduce allocations and improve garbage collection
- **CPU** - Cache-friendly code, vectorization
- **Network** - Reduce requests, optimize payload sizes
- **Build** - Faster compilation and bundling
- **Runtime** - Lazy loading, code splitting

## Key Agents & Tasks

- Use \`performance-advisor-plan\` for systematic optimization
- Measure performance before and after optimizations
- Profile code to identify actual bottlenecks
- Prioritize high-impact optimizations
- Ensure optimizations don't harm readability

## Verification

- Benchmark improvements with concrete metrics
- Run full test suite
- Check production-like environment behavior
- Monitor for regressions
</command-instruction>

<optimization-target>
$ARGUMENTS
</optimization-target>

---

<command-instruction>
# Code:Format Command

Apply consistent formatting and style standards across codebase.

## Process

1. **Config Review** - Verify formatting rules (prettier, eslint, rustfmt, etc.)
2. **Apply Formatter** - Run format tools across specified scope
3. **Review Changes** - Check formatted output for correctness
4. **Commit** - Create formatting-only commit with clear message
5. **Update CI** - Ensure formatting checks pass

## Features

- Batch format multiple files or entire directories
- Apply language-specific formatters
- Integrate with pre-commit hooks
- Generate formatting-only commits for clean history

## Rules

- Formatting changes should be separate from functional changes
- Always get team consensus on formatting rules before bulk formatting
- Don't mix formatting with functional changes
</command-instruction>

<format-scope>
$ARGUMENTS
</format-scope>
