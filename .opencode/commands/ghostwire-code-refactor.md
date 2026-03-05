---
description: Systematically refactor code while maintaining functionality
---

# Ghostwire: Code Refactor

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
