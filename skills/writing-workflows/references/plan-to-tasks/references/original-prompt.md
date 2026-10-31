---
title: Plan-to-Tasks Conversion Prompt (original)
knowledge_type: process
domain: vault/tasks/planning
scope: breaking-plans-into-task-files
status: active
updated: 2026-08-25
applies_to:
---
Convert the implementation plan into a set of separate Markdown task files. Each file must represent exactly one independently actionable task and must follow the format below without deviation.

## File naming

Use this filename format:

`NNN-short-kebab-case-title.md`

Requirements:

- `NNN` is a zero-padded sequence number beginning with `001`.
    
- Order files by dependency and recommended implementation sequence.
    
- Use lowercase kebab-case after the sequence number.
    
- Do not create nested directories unless explicitly requested.
    

Example:

`003-add-user-authentication.md`

## Required front matter

Every file must begin with this exact YAML front matter schema:

```yaml
---
title: "Task title"
status: "todo"
priority: "no-priority"
labels: []
depends_on: []
blocks: []
estimated_size: "M"
---
```

Follow these rules:

- `title`: A concise, action-oriented task title.
    
- `status`: Always set to `"todo"`.
    
- `priority`: Must be one of:
    
    - `"urgent"`
        
    - `"high"`
        
    - `"medium"`
        
    - `"low"`
        
    - `"no-priority"`
        
- `labels`: A YAML array of short lowercase kebab-case labels.
    
- `depends_on`: A YAML array containing the filenames of tasks that must be completed first.
    
- `blocks`: A YAML array containing the filenames of tasks that depend on this task.
    
- `estimated_size`: Must be one of:
    
    - `"XS"`
        
    - `"S"`
        
    - `"M"`
        
    - `"L"`
        
    - `"XL"`
        

Do not add, remove, rename, or reorder front matter fields.

## Required Markdown body

After the front matter, use exactly these sections in this order:

```markdown
## Objective

A concise description of the outcome this task must produce.

## Context

Relevant architectural, product, or implementation context needed to complete the task.

## Requirements

- A complete list of concrete implementation requirements.
- Each requirement must describe an observable deliverable or behavior.
- Avoid vague instructions such as “handle edge cases” without listing them.

## Implementation Notes

- Suggested files, modules, components, APIs, schemas, or technical approaches.
- Include constraints and important tradeoffs.
- Do not prescribe an implementation when the plan does not provide enough evidence.

## Acceptance Criteria

- [ ] A set of objective, testable completion conditions.
- [ ] Each criterion must be verifiable through code, tests, or observable behavior.
- [ ] Do not include subjective criteria such as “works well” or “looks good.”

## Testing

- Tests that must be added or updated.
- Include relevant unit, integration, end-to-end, manual, or regression testing.
- Write `Not required` only when testing genuinely does not apply.
```

## Task decomposition rules

- Each task must be small enough for one engineer to complete as a focused unit of work.
    
- Each task must produce a concrete, reviewable change.
    
- Do not combine unrelated backend, frontend, infrastructure, migration, and documentation work into one task.
    
- Separate prerequisite work from dependent implementation work.
    
- Separate schema changes, migrations, APIs, UI work, tests, observability, rollout, and documentation when they can be completed or reviewed independently.
    
- Avoid tasks that only say “investigate,” “research,” or “explore.” When discovery is necessary, define the exact decision or artifact it must produce.
    
- Do not duplicate requirements across multiple tasks.
    
- Ensure every dependency is represented consistently in both `depends_on` and `blocks`.
    
- Do not reference a task filename that does not exist.
    
- Every part of the implementation plan must be covered by at least one task.
    
- Do not invent product requirements that are absent from the plan. Clearly state reasonable technical assumptions inside `Implementation Notes`.
    

## Output requirements

- Output only the Markdown files.
    
- Present each file in a separate fenced Markdown block.
    
- Place the filename immediately before its block.
    
- Do not include an introduction, summary, commentary, or closing text.
    
- Do not omit sections, even when a section contains `Not required`.
    
- Validate all filenames, dependencies, front matter values, and acceptance criteria before producing the final output.