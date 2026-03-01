export const PROJECT_INIT_TEMPLATE = `
# Project:Init Command
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
<project-context>
$ARGUMENTS
</project-context>
`;
