export const DOCS_DEPLOY_DOCS_TEMPLATE = `
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
export const DOCS_RELEASE_DOCS_TEMPLATE = `
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
export const DOCS_FEATURE_VIDEO_TEMPLATE = `
# Docs:Feature-Video Command
Create demonstration video for new feature or capability.
## Video Production Process
1. **Script Writing** - Write clear, concise demo script
2. **Environment Setup** - Prepare for recording
3. **Recording** - Record feature demonstration
4. **Editing** - Edit for clarity and pacing
5. **Captioning** - Add captions for accessibility
6. **Hosting** - Upload to video platform
7. **Documentation** - Embed in documentation
8. **Publishing** - Publish to channels
## Video Types
- **Feature Demo** - Walkthrough of new feature
- **Tutorial** - Step-by-step usage guide
- **Comparison** - Before/after comparison
- **Quick Tip** - Brief optimization techniques
- **Troubleshooting** - Common issues and solutions
## Platforms
- **YouTube** - Public video hosting
- **Vimeo** - Professional video hosting
- **Docs Site** - Embedded in documentation
- **Social Media** - Short clips for marketing
- **Internal** - Private videos for team
<video-context>
$ARGUMENTS
</video-context>
`;
export const DOCS_TEST_BROWSER_TEMPLATE = `
# Docs:Test-Browser Command
Test documentation in actual browser environment for functionality and rendering.
## Testing Scope
- **Rendering** - Verify HTML/CSS renders correctly
- **Responsiveness** - Check mobile, tablet, desktop views
- **Interactivity** - Test any interactive elements
- **Code Examples** - Run and verify code samples work
- **Links** - Validate all links are functional
- **Search** - Test search functionality
- **Accessibility** - Check WCAG compliance
- **Performance** - Measure load times and responsiveness
## Browser Coverage
- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)
## Test Types
- **Visual Regression** - Compare screenshots to baseline
- **Functional** - Test interactive components
- **Integration** - Test links between docs and external sites
- **Accessibility** - Screen reader compatibility, keyboard navigation
- **SEO** - Meta tags, structured data
<test-context>
$ARGUMENTS
</test-context>
`;
