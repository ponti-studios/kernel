import type { CommandDefinition } from "../../claude-code-command-loader";

export const NAME = "ghostwire:project:test";
export const DESCRIPTION = "Run test suites and measure code coverage";
export const TEMPLATE = `<command-instruction>
# Project:Test Command

Run test suites and measure code coverage.

## Process

1. **Test Discovery** - Find all test files
2. **Environment Setup** - Prepare test database and fixtures
3. **Test Execution** - Run test suite
4. **Coverage Analysis** - Measure code coverage
5. **Report Generation** - Create human-readable reports
6. **Failure Analysis** - Debug failing tests

## Test Types

- **Unit Tests** - Individual function/class testing
- **Integration Tests** - Component interaction testing
- **End-to-End Tests** - Full workflow testing
- **Performance Tests** - Speed and scalability testing
- **Security Tests** - Vulnerability testing

## Features

- Run specific test suites or individual tests
- Parallel test execution for speed
- Code coverage reporting
- Failed test re-runs
- Test result persistence
- Watch mode for development
</command-instruction>

<test-context>
$ARGUMENTS
</test-context>
`;
export const ARGUMENT_HINT = "[--type=unit|integration|e2e|all] [--coverage]";

export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
