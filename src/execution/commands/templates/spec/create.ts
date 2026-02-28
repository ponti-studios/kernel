/**
 * Template for ghostwire:workflows:plan command
 *
 * Creates a feature specification from a natural language description.
 * Replaces: .specify/templates/spec-template.md + speckit.specify.md logic
 */
export const SPEC_CREATE_TEMPLATE = `
## Feature Specification: $FEATURE_NAME
**Feature Branch**: \`[$FEATURE_NUM-$FEATURE_SHORT_NAME]\`  
**Created**: $TIMESTAMP  
**Status**: Draft  
**Input**: User description: "<feature-description>$ARGUMENTS</feature-description>"
---
## User Scenarios & Testing *(mandatory)*
### User Story 1 - $US1_TITLE (Priority: P1)
$US1_DESCRIPTION
**Why this priority**: $US1_PRIORITY_REASON
**Independent Test**: $US1_TEST_DESCRIPTION
**Acceptance Scenarios**:
1. **Given** $US1_GIVEN_1, **When** $US1_WHEN_1, **Then** $US1_THEN_1
2. **Given** $US1_GIVEN_2, **When** $US1_WHEN_2, **Then** $US1_THEN_2
---
### User Story 2 - $US2_TITLE (Priority: P2)
$US2_DESCRIPTION
**Why this priority**: $US2_PRIORITY_REASON
**Independent Test**: $US2_TEST_DESCRIPTION
**Acceptance Scenarios**:
1. **Given** $US2_GIVEN_1, **When** $US2_WHEN_1, **Then** $US2_THEN_1
---
### Edge Cases
- What happens when $EDGE_CASE_1?
- How does system handle $EDGE_CASE_2?
## Requirements *(mandatory)*
### Functional Requirements
- **FR-001**: System MUST $FR_001
- **FR-002**: System MUST $FR_002
- **FR-003**: Users MUST be able to $FR_003
- **FR-004**: System MUST $FR_004
- **FR-005**: System MUST $FR_005
### Key Entities *(include if feature involves data)*
- **$ENTITY_1**: $ENTITY_1_DESCRIPTION
- **$ENTITY_2**: $ENTITY_2_DESCRIPTION
## Success Criteria *(mandatory)*
### Measurable Outcomes
- **SC-001**: $SC_001
- **SC-002**: $SC_002
- **SC-003**: $SC_003
- **SC-004**: $SC_004
## Assumptions
$ASSUMPTIONS
## Notes
- Focus on **WHAT** users need and **WHY**
- Avoid HOW to implement (no tech stack, APIs, code structure)
- Written for business stakeholders, not developers
---
**Next**: Run \`/ghostwire:workflows:plan\` to create implementation plan
`;
/**
 * Short name generation helper
 * Extracts 2-4 meaningful keywords from feature description
 */
export function generateShortName(description: string): string {
  // Common stop words to filter out
  const stopWords = new Set([
    "i",
    "a",
    "an",
    "the",
    "to",
    "for",
    "of",
    "in",
    "on",
    "at",
    "by",
    "with",
    "from",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "should",
    "could",
    "can",
    "may",
    "might",
    "must",
    "shall",
    "this",
    "that",
    "these",
    "those",
    "my",
    "your",
    "our",
    "their",
    "want",
    "need",
    "add",
    "get",
    "set",
  ]);
  // Clean and split
  const clean = description.toLowerCase().replace(/[^a-z0-9]/g, " ");
  const words = clean.split(/\s+/).filter((w) => w.length > 0);
  // Filter meaningful words
  const meaningful = words.filter((word) => {
    if (stopWords.has(word)) return false;
    if (word.length >= 3) return true;
    // Keep short words if uppercase in original (acronyms)
    return description.includes(word.toUpperCase());
  });
  // Take first 3-4 words
  const maxWords = Math.min(meaningful.length, 4);
  return meaningful.slice(0, maxWords).join("-");
}
/**
 * Feature number generation
 * Finds next available number from existing specs and branches
 */
export function getNextFeatureNumber(existingSpecs: string[]): number {
  let highest = 0;
  for (const spec of existingSpecs) {
    const match = spec.match(/^(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > highest) highest = num;
    }
  }
  return highest + 1;
}
/**
 * Branch name generation
 */
export function generateBranchName(featureNum: number, shortName: string): string {
  const paddedNum = featureNum.toString().padStart(3, "0");
  return `${paddedNum}-${shortName}`;
}
/**
 * Feature directory path
 */
export function getFeatureDir(baseDir: string, branchName: string): string {
  return `${baseDir}/docs/specs/${branchName}`;
}
/**
 * Spec file path
 */
export function getSpecFilePath(featureDir: string): string {
  return `${featureDir}/spec.md`;
}
