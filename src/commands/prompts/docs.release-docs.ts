import type { CommandDefinition } from "../../claude-code-command-loader";
export const NAME = "ghostwire:docs:release-docs";
export const DESCRIPTION = "Create versioned documentation release";
export const TEMPLATE = `
# Docs:Release-Docs Command
Create versioned documentation release for new software version.
## Process
1. **Documentation Audit** - Verify docs match software version
2. **Version Creation** - Create new version branch/directory
3. **Content Review** - Ensure completeness and accuracy
4. **Breaking Changes** - Document any breaking changes clearly
5. **Migration Guides** - Create guides for upgrade path
6. **Release Notes** - Generate release notes from commits
7. **Deployment** - Deploy versioned documentation
8. **Announcement** - Publish release announcement
## Features
- Archive previous versions
- Version selector in docs UI
- Compatibility matrix display
- Changelog generation
- Migration guide generation
- SEO optimization for versioned content
<release-context>
$ARGUMENTS
</release-context>
`;
export const ARGUMENT_HINT = "[version] [--create-migration-guide]";
export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
