import type { CommandDefinition } from "../../claude-code-command-loader";
export const NAME = "ghostwire:project:build";
export const DESCRIPTION = "Compile, transpile, and bundle project code";
export const TEMPLATE = `
# Project:Build Command
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
<build-context>
$ARGUMENTS
</build-context>
`;
export const ARGUMENT_HINT = "[--mode=development|production|staging]";
export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
