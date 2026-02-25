# spec-create

Source: spec/create.ts

<command-instruction>
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

**Next**: Run \`/ghostwire:spec:plan\` to create implementation plan
</command-instruction>
