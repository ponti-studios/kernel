/**
 * Template for ghostwire:workflows:create command
 *
 * Generates domain-specific checklists.
 * Replaces: speckit.checklist.md + checklist-template.md
 */
export const SPEC_CHECKLIST_TEMPLATE = `
---
description: "Checklist for $DOMAIN: $FEATURE_NAME"
---
# Checklist: $FEATURE_NAME ($DOMAIN)
**Created**: $TIMESTAMP  
**Domain**: $DOMAIN  
**Feature**: [docs/specs/$BRANCH_NAME/spec.md](../spec.md)
---
## $DOMAIN Checklist
$CHECKLIST_ITEMS
---
## Usage
1. Review each item before implementation
2. Mark items as complete: \`- [x]\`
3. All items must pass before \`/ghostwire:workflows:work\`
4. Update this file as you progress
---
**Status**: $COMPLETED_COUNT/$TOTAL_COUNT complete
`;
/**
 * Domain-specific checklist items
 */
export const DOMAIN_CHECKLISTS: Record<string, string[]> = {
  requirements: [
    "All functional requirements have clear acceptance criteria",
    "User scenarios cover primary flows",
    "Edge cases are identified and documented",
    "No [NEEDS CLARIFICATION] markers remain",
    "Requirements are testable and unambiguous",
    "Success criteria are measurable",
    "Scope is clearly bounded",
    "Dependencies and assumptions identified",
  ],
  ux: [
    "User flows are intuitive and well-defined",
    "Error states are handled gracefully",
    "Loading states provide feedback",
    "Accessibility requirements met (WCAG 2.1 AA)",
    "Responsive design for all target devices",
    "Consistent with existing UI patterns",
    "User feedback mechanisms in place",
  ],
  security: [
    "Input validation on all user inputs",
    "Authentication required where appropriate",
    "Authorization checks implemented",
    "Sensitive data encrypted at rest",
    "Sensitive data encrypted in transit (TLS)",
    "No secrets in code or logs",
    "Rate limiting for API endpoints",
    "Audit logging for sensitive operations",
  ],
  performance: [
    "Response time < 200ms for critical paths",
    "Database queries are optimized",
    "Caching strategy implemented",
    "Bundle size < 500KB (frontend)",
    "Memory usage monitored",
    "Load testing completed",
    "Graceful degradation under load",
  ],
  testing: [
    "Unit tests for all business logic",
    "Integration tests for API contracts",
    "End-to-end tests for critical paths",
    "Test coverage > 80%",
    "All tests passing in CI",
    "Contract tests for external APIs",
    "Performance benchmarks established",
  ],
  documentation: [
    "API documentation complete",
    "User-facing documentation updated",
    "README updated with new features",
    "Changelog updated",
    "Code comments for complex logic",
    "Architecture Decision Records (ADRs) for major decisions",
  ],
  deployment: [
    "Environment variables documented",
    "Database migrations prepared",
    "Rollback plan documented",
    "Monitoring and alerting configured",
    "Health checks implemented",
    "Feature flags if needed",
    "Staging environment validated",
  ],
};
/**
 * Generate checklist items for domain
 */
export function generateChecklistItems(domain: string): string {
  const items = DOMAIN_CHECKLISTS[domain] || DOMAIN_CHECKLISTS.requirements;
  return items.map((item) => `- [ ] ${item}`).join("\n");
}
/**
 * Get available domains
 */
export function getAvailableDomains(): string[] {
  return Object.keys(DOMAIN_CHECKLISTS);
}
/**
 * Validate checklist completion
 */
export function validateChecklist(checklistContent: string): {
  total: number;
  completed: number;
  incomplete: number;
  passed: boolean;
} {
  const total = (checklistContent.match(/- \[.\]/g) || []).length;
  const completed = (checklistContent.match(/- \[[xX]\]/g) || []).length;
  const incomplete = total - completed;
  return {
    total,
    completed,
    incomplete,
    passed: incomplete === 0,
  };
}
