export const PROJECT_TEST_TEMPLATE = `
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
<test-context>
$ARGUMENTS
</test-context>
`;
