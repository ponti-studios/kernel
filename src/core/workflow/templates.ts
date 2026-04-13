export const workflowArtifactDefinitions = [
  {
    id: "proposal",
    title: "Proposal",
    fileName: "proposal.md",
    dependencies: [] as string[],
    instruction:
      "Capture the problem, user impact, scope boundaries, and success criteria for this change.",
    context:
      "This artifact should explain what is changing and why it matters before design or implementation details appear.",
    rules: [
      "Keep the proposal user-outcome oriented.",
      "State explicit in-scope and out-of-scope boundaries.",
      "Include acceptance criteria that can be validated later.",
    ],
    template: `# Proposal

## Summary

## Problem

## Goals

## Non-Goals

## Acceptance Criteria
`,
  },
  {
    id: "design",
    title: "Design",
    fileName: "design.md",
    dependencies: ["proposal"] as string[],
    instruction:
      "Describe the technical approach, data flow, interfaces, tradeoffs, and risks for the approved proposal.",
    context:
      "This artifact translates the approved proposal into an implementation shape that minimizes ambiguity for task creation.",
    rules: [
      "Reference proposal constraints directly.",
      "Document interfaces and data flow before implementation details.",
      "Call out edge cases and operational risks.",
    ],
    template: `# Design

## Architecture

## Data Flow

## Interfaces

## Risks
`,
  },
  {
    id: "tasks",
    title: "Tasks",
    fileName: "tasks.md",
    dependencies: ["design"] as string[],
    instruction:
      "Break the approved design into ordered, testable implementation tasks with clear completion states.",
    context:
      "This artifact should make implementation executable without requiring new architectural decisions.",
    rules: [
      "Each task should be independently understandable.",
      "Use markdown checkboxes for task state.",
      "Order tasks by dependency, not by file path.",
    ],
    template: `# Tasks

- [ ] Implement the first vertical slice
- [ ] Validate the behavior with tests
`,
  },
] as const;

export const kernelTemplateFiles: Record<string, string> = {
  "templates/spec-template.md": `# Specification

## Summary

## Actors

## User Stories

## Constraints

## Open Questions
`,
  "templates/plan-template.md": `# Implementation Plan

## Technical Context

## Approach

## Risks

## Validation
`,
  "templates/tasks-template.md": `# Tasks

## Phase 1

- [ ] Build the first task
`,
  "templates/checklist-template.md": `# Checklist

- [ ] Spec reviewed
- [ ] Plan reviewed
- [ ] Tasks reviewed
`,
  "memory/constitution.md": `# Kernel Constitution

## Principles

- Prefer small, focused changes.
- Optimize for correctness, performance, and low duplication.
- Keep public interfaces stable and explicit.
`,
};
