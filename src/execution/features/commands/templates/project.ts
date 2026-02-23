export const PROJECT_INIT_TEMPLATE = `# Project:Init Command

Initialize a new project with proper structure, configuration, and development tooling.

## Process

1. **Project Analysis** - Understand project type and requirements
2. **Template Selection** - Choose appropriate starter template
3. **Structure Creation** - Set up directory structure
4. **Config Setup** - Initialize configuration files (package.json, tsconfig, etc.)
5. **Tooling Setup** - Configure linting, testing, formatting
6. **Documentation** - Create README and contributing guides
7. **VCS Setup** - Initialize git and create initial commit

## Project Types

- **Web Application** - React, Vue, Angular, Next.js, etc.
- **API Server** - Express, Rails, FastAPI, etc.
- **Library** - TypeScript, Python, Ruby gem, etc.
- **CLI Tool** - Command-line utility
- **Monorepo** - Multi-package repository

## Key Features

- Choose language and framework
- Configure package manager (npm, bun, pip, cargo)
- Setup testing framework (Jest, pytest, RSpec)
- Configure linting (ESLint, Pylint, RuboCop)
- Setup formatting (Prettier, Black, RuboCop)
- Create git workflow templates
- Generate GitHub Actions workflows
`;

export const PROJECT_BUILD_TEMPLATE = `# Project:Build Command

Compile, transpile, and bundle project code for distribution.

## Process

1. **Build Configuration Review** - Understand build setup
2. **Dependency Verification** - Ensure all dependencies installed
3. **Build Execution** - Run build process
4. **Output Verification** - Validate build artifacts
5. **Artifact Organization** - Organize outputs by platform/variant

## Build Types

- **Development** - Fast rebuilds with source maps
- **Production** - Optimized, minified output
- **Staging** - Production-like with debug capabilities
- **Test** - Instrumented for coverage

## Features

- Parallel builds for speed
- Incremental rebuilds (only changed files)
- Multiple output formats (ESM, CommonJS, UMD, etc.)
- Platform-specific builds
- Asset optimization
- Type checking integration
`;

export const PROJECT_DEPLOY_TEMPLATE = `# Project:Deploy Command

Deploy project to specified environment (staging, production, etc.).

## Process

1. **Build Verification** - Ensure successful build
2. **Environment Validation** - Verify target environment configuration
3. **Dependency Preparation** - Install/update all dependencies
4. **Migration Execution** - Run any database migrations
5. **Deployment** - Deploy to target environment
6. **Health Checks** - Verify deployment health
7. **Rollback Plan** - Prepare rollback if needed

## Deployment Targets

- **Development** - Local or dev server
- **Staging** - Pre-production testing environment
- **Production** - Public-facing environment
- **Multiple Regions** - Distributed deployment

## Features

- Blue-green deployments
- Canary deployments
- Zero-downtime updates
- Automatic rollback on failure
- Health check monitoring
- Deployment notifications

## Safety

- Always test deployments in staging first
- Use feature flags for risky changes
- Monitor logs and metrics after deployment
- Have rollback procedure ready
- Get approval for production deployments
`;

export const PROJECT_TEST_TEMPLATE = `# Project:Test Command

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
`;
