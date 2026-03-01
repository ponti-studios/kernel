import { renderProfileUsage } from "../profiles";

export const CODE_REFACTOR_TEMPLATE = `# Code:Refactor Command
Systematically refactor code while maintaining functionality and improving clarity, performance, or maintainability.
## Process
1. **Scope Analysis** - Define refactoring boundaries (file, module, or project level)
2. **Impact Assessment** - Identify affected code, tests, and dependencies
3. **Strategy Selection** - Choose approach (safe vs aggressive, incremental vs comprehensive)
4. **Refactoring Execution** - Apply transformations using code transformation tools
5. **Verification** - Run tests and validate functionality
6. **Documentation** - Update comments and related documentation
## Key Profiles & Tasks
${renderProfileUsage([
  "reviewer_typescript",
  "reviewer_python",
  "reviewer_simplicity",
  "analyzer_patterns",
])}
- Run comprehensive test suites before/after refactoring
## Refactoring Types
- **Extract Method** - Break large functions into smaller, focused units
- **Rename** - Improve code clarity through better naming
- **Inline** - Remove unnecessary abstraction layers
- **Move** - Reorganize code for better structure
- **Simplify** - Remove duplication and complexity
- **Performance** - Optimize without changing behavior
<refactoring-target>
$ARGUMENTS
</refactoring-target>`;
