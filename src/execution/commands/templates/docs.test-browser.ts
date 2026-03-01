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
