import type { CommandTemplate } from '../../core/templates/types.js';

export function getProjectBuildCommandTemplate(): CommandTemplate {
  return {
    name: 'Project Build',
    description: 'Build the project for production',
    category: 'Project',
    tags: ['build', 'production', 'deployment'],
    content: `# Project Build

Build the project for production.

## Process

1. **Clean Previous Build**
   - Remove dist/build directories
   - Clear caches

2. **Install Dependencies**
   - Ensure all dependencies installed
   - Check for outdated packages

3. **Run Build**
   - Execute build command
   - Handle environment variables
   - Generate optimized assets

4. **Verify Output**
   - Check build artifacts
   - Verify file sizes
   - Test in preview mode

## Common Build Commands

- Node.js: npm run build
- Python: python setup.py build
- Ruby: rake build
- Go: go build
`,
  };
}

export function getProjectDeployCommandTemplate(): CommandTemplate {
  return {
    name: 'Project Deploy',
    description: 'Deploy project to hosting environment',
    category: 'Project',
    tags: ['deploy', 'deployment', 'release'],
    content: `# Project Deploy

Deploy project to hosting environment.

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Build successful
- [ ] Environment configured
- [ ] Database migrations ready
- [ ] Rollback plan in place

## Deployment Steps

1. **Prepare** - Build, test, backup
2. **Deploy** - Push to target environment
3. **Verify** - Health checks pass
4. **Monitor** - Watch for issues

## Strategies

- Blue-Green Deployments
- Rolling Deployments
- Canary Releases
- Feature Flags
`,
  };
}

export function getProjectTestCommandTemplate(): CommandTemplate {
  return {
    name: 'Project Test',
    description: 'Run project test suite',
    category: 'Project',
    tags: ['testing', 'quality', 'test'],
    content: `# Project Test

Run project test suite.

## Test Types

- **Unit Tests** - Individual components
- **Integration Tests** - Component interaction
- **E2E Tests** - Full user flows
- **Performance Tests** - Load and speed

## Running Tests

1. Run all tests
2. Run specific test file
3. Run tests matching pattern
4. Run with coverage

## Best Practices

- Run tests before commits
- Maintain test coverage
- Keep tests fast
- Write meaningful assertions
`,
  };
}

export function getProjectConstitutionCommandTemplate(): CommandTemplate {
  return {
    name: 'Project Constitution',
    description: 'Define project conventions and standards',
    category: 'Project',
    tags: ['conventions', 'standards', 'rules'],
    content: `# Project Constitution

Define project conventions and standards.

## Purpose

Establish clear rules that all team members follow.

## Constitution Elements

### Code Standards
- Linting rules
- Formatting conventions
- Naming patterns

### Git Workflow
- Branch naming
- Commit message format
- PR requirements

### Documentation
- README requirements
- API documentation
- Code comments

### Testing
- Coverage requirements
- Test patterns
- When to test

## Process

1. Gather existing conventions
2. Discuss and agree on rules
3. Document clearly
4. Enforce with tooling
`,
  };
}

export function getProjectInitCommandTemplate(): CommandTemplate {
  return {
    name: 'Project Init',
    description: 'Initialize new project structure',
    category: 'Project',
    tags: ['init', 'setup', 'scaffold'],
    content: `# Project Init

Initialize new project structure.

## Process

1. **Choose Template**
   - From existing project
   - Framework default
   - Custom specification

2. **Install Dependencies**
   - Package manager setup
   - Core dependencies
   - Dev dependencies

3. **Configure Tools**
   - Linter, formatter
   - Test runner
   - Type checking

4. **Setup Git**
   - Initialize repo
   - Create .gitignore
   - Initial commit

5. **Verify**
   - Run build
   - Run tests
   - Check for errors
`,
  };
}

export function getProjectMapCommandTemplate(): CommandTemplate {
  return {
    name: 'Project Map',
    description: 'Map project structure and dependencies',
    category: 'Project',
    tags: ['mapping', 'structure', 'dependencies'],
    content: `# Project Map

Map project structure and dependencies.

## Purpose

Understand codebase organization and relationships.

## Mapping Steps

1. **Directory Structure**
   - Top-level folders
   - Purpose of each directory
   - File organization patterns

2. **Dependencies**
   - Package dependencies
   - External services
   - Internal modules

3. **Entry Points**
   - Main entry files
   - API routes
   - CLI commands

4. **Key Files**
   - Configuration files
   - Core modules
   - Test setup

## Output

- Visual diagram or text map
- Dependency list
- Architecture summary
`,
  };
}
