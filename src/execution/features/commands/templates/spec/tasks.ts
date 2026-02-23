/**
 * Template for ghostwire:spec:tasks command
 * 
 * Generates an actionable, dependency-ordered tasks.md from design artifacts.
 * Replaces: .specify/templates/tasks-template.md + speckit.tasks.md logic
 */

export const SPEC_TASKS_TEMPLATE = `---
description: "Task list for $FEATURE_NAME implementation"
---

# Tasks: $FEATURE_NAME

**Input**: Design documents from \`.ghostwire/specs/$BRANCH_NAME/\`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

---

## Format: \`[ID] [P?] [Story?] Description\`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: \`src/\`, \`tests/\` at repository root
- **Web app**: \`backend/src/\`, \`frontend/src/\`
- **Mobile**: \`api/src/\`, \`ios/src/\` or \`android/src/\`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

$SETUP_TASKS

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

⚠️ **CRITICAL**: No user story work can begin until this phase is complete

$FOUNDATIONAL_TASKS

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

$USER_STORY_PHASES

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional unit tests in tests/unit/
- [ ] TXXX Security hardening
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

$USER_STORY_DEPENDENCIES

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

**Next**: Run \`/ghostwire:spec:implement\` to execute all tasks
`;

/**
 * Task format helper
 */
export function formatTask(
  id: number,
  description: string,
  isParallel: boolean = false,
  story?: string
): string {
  const idStr = `T${id.toString().padStart(3, '0')}`;
  const parallelMarker = isParallel ? ' [P]' : '';
  const storyMarker = story ? ` [${story}]` : '';
  
  return `- [ ] ${idStr}${parallelMarker}${storyMarker} ${description}`;
}

/**
 * User story phase generator
 */
export function generateUserStoryPhase(
  storyNum: number,
  title: string,
  priority: string,
  goal: string,
  testDescription: string,
  tasks: string[]
): string {
  const phaseNum = storyNum + 2; // Phase 1 = Setup, Phase 2 = Foundational
  
  return `## Phase ${phaseNum}: User Story ${storyNum} - ${title} (Priority: ${priority}) 🎯 MVP

**Goal**: ${goal}

**Independent Test**: ${testDescription}

### Tests for User Story ${storyNum} (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

${tasks.filter(t => t.includes('[test]')).join('\n')}

### Implementation for User Story ${storyNum}

${tasks.filter(t => !t.includes('[test]')).join('\n')}

**Checkpoint**: At this point, User Story ${storyNum} should be fully functional and testable independently
`;
}

/**
 * Extract user stories from spec
 */
export interface UserStory {
  number: number;
  title: string;
  priority: string;
  description: string;
  testDescription: string;
  given: string[];
  when: string[];
  then: string[];
}

export function extractUserStories(specContent: string): UserStory[] {
  const stories: UserStory[] = [];
  
  // Pattern to match user story sections
  const storyPattern = /### User Story (\d+) - ([^\n]+) \(Priority: (P\d+)\)[\s\S]*?(?=### User Story \d+|$)/g;
  let match;
  
  while ((match = storyPattern.exec(specContent)) !== null) {
    const content = match[0];
    
    stories.push({
      number: parseInt(match[1], 10),
      title: match[2].trim(),
      priority: match[3],
      description: extractField(content, 'description'),
      testDescription: extractField(content, 'Independent Test'),
      given: extractListItems(content, 'Given'),
      when: extractListItems(content, 'When'),
      then: extractListItems(content, 'Then')
    });
  }
  
  return stories;
}

function extractField(content: string, fieldName: string): string {
  const pattern = new RegExp(`\\*\\*${fieldName}\\*\\*: ([^\\n]+)`);
  const match = content.match(pattern);
  return match ? match[1].trim() : '';
}

function extractListItems(content: string, keyword: string): string[] {
  const items: string[] = [];
  const pattern = new RegExp(`\\*\\*${keyword}\\*\\* ([^,]+)`, 'g');
  let match;
  
  while ((match = pattern.exec(content)) !== null) {
    items.push(match[1].trim());
  }
  
  return items;
}
