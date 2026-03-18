import type { CommandTemplate } from '../../core/templates/types.js';

export function getDocsDeployCommandTemplate(): CommandTemplate {
  return {
    name: 'Jinn: Docs Deploy',
    description: 'Build and deploy documentation to hosting',
    category: 'Docs',
    tags: ['docs', 'deployment', 'hosting'],
    content: `# Jinn: Docs Deploy

Build and deploy documentation to live hosting platform.

## Process

1. Build Documentation - Generate HTML/static content
2. Link Validation - Verify all links
3. Environment Setup - Configure deployment target
4. Deployment - Upload to hosting platform
5. Verification - Verify deployed docs accessible

## Supported Formats

- Markdown-based docs
- API Docs (OpenAPI/GraphQL)
- Docusaurus, MkDocs, Sphinx, Jekyll

## Deployment Targets

- GitHub Pages, Vercel, Netlify
- AWS S3/CloudFront, Self-Hosted
`,
  };
}

export function getDocsFeatureVideoCommandTemplate(): CommandTemplate {
  return {
    name: 'Jinn: Docs Feature Video',
    description: 'Create demonstration video for feature',
    category: 'Docs',
    tags: ['docs', 'video', 'demo'],
    content: `# Jinn: Docs Feature Video

Create demonstration video for new feature.

## Process

1. Script Writing - Clear, concise demo script
2. Environment Setup - Prepare for recording
3. Recording - Record feature demonstration
4. Editing - Edit for clarity
5. Captioning - Add accessibility captions
6. Hosting - Upload to video platform
7. Publishing - Publish to channels

## Video Types

- Feature Demo, Tutorial, Comparison, Quick Tip, Troubleshooting
`,
  };
}

export function getDocsReleaseCommandTemplate(): CommandTemplate {
  return {
    name: 'Jinn: Docs Release',
    description: 'Create versioned documentation release',
    category: 'Docs',
    tags: ['docs', 'versioning', 'release'],
    content: `# Jinn: Docs Release

Create versioned documentation release.

## Process

1. Documentation Audit - Verify docs match version
2. Version Creation - Create new version branch
3. Content Review - Ensure completeness
4. Breaking Changes - Document clearly
5. Migration Guides - Create upgrade path
6. Release Notes - Generate from commits
7. Deployment - Deploy versioned docs

## Features

- Archive previous versions
- Version selector in UI
- Compatibility matrix
- Changelog generation
`,
  };
}

export function getDocsTestBrowserCommandTemplate(): CommandTemplate {
  return {
    name: 'Jinn: Docs Test Browser',
    description: 'Test documentation in browser environment',
    category: 'Docs',
    tags: ['docs', 'testing', 'browser'],
    content: `# Jinn: Docs Test Browser

Test documentation in browser environment.

## Process

1. Start local server
2. Open in multiple browsers
3. Check rendering
4. Test navigation
5. Verify interactive elements
6. Check responsive behavior

## Browsers to Test

- Chrome, Firefox, Safari, Edge
- Mobile viewport
- Different screen sizes
`,
  };
}
