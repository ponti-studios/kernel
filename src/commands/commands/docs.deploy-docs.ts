import type { CommandDefinition } from "../../claude-code-command-loader";
export const NAME = "ghostwire:docs:deploy-docs";
export const DESCRIPTION = "Build and deploy documentation to hosting";
export const TEMPLATE = `
# Docs:Deploy-Docs Command
Build and deploy documentation to live hosting platform.
## Process
1. **Build Documentation** - Generate HTML/static content from sources
2. **Link Validation** - Verify all internal and external links
3. **Search Indexing** - Build search indexes for documentation
4. **Environment Setup** - Configure deployment target
5. **Deployment** - Upload to hosting platform
6. **Verification** - Verify deployed docs are accessible
7. **Notification** - Announce deployment to team
## Documentation Formats Supported
- **Markdown** - Static markdown-based docs
- **API Docs** - Generated from OpenAPI/GraphQL specs
- **Docusaurus** - React-based documentation site
- **MkDocs** - Python-based documentation
- **Sphinx** - Python documentation generator
- **Jekyll** - Static site generator
## Deployment Targets
- **GitHub Pages** - Free hosted on GitHub
- **Vercel** - Automatic deployments
- **Netlify** - Continuous deployment
- **AWS S3/CloudFront** - Custom hosting
- **Self-Hosted** - Custom server
<docs-context>
$ARGUMENTS
</docs-context>
`;
export const ARGUMENT_HINT = "[--target=github-pages|vercel|netlify|s3] [--version=latest|stable]";
export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
