import type { SkillTemplate } from '../../core/templates/types.js';

export function getProposeSkillTemplate(): SkillTemplate {
  return {
    name: 'propose',
    description: 'Propose a new change with all artifacts generated in one step. Use when the user wants to quickly describe what they want to build and get a complete proposal with design, specs, and tasks ready for implementation.',
    license: 'MIT',
    compatibility: 'Requires jinn CLI.',
    metadata: {
      author: 'jinn',
      version: '1.0',
      category: 'Workflow',
      tags: ['workflow', 'propose', 'change', 'planning'],
    },
    instructions: `Propose a new change - create the change and generate all artifacts in one step.

I'll create a change with artifacts:
- proposal.md (what & why)
- design.md (how)
- tasks.md (implementation steps)

When ready to implement, run /apply

---

**Input**: The user's request should include a change name (kebab-case) OR a description of what they want to build.

**Steps**

1. **If no clear input provided, ask what they want to build**

   Use the **AskUserQuestion tool** (open-ended, no preset options) to ask:
   > "What change do you want to work on? Describe what you want to build or fix."

   From their description, derive a kebab-case name (e.g., "add user authentication" → \`add-user-auth\`).

   **IMPORTANT**: Do NOT proceed without understanding what the user wants to build.

2. **Create the change directory**
   \`\`\`bash
   jinn new change "<name>"
   \`\`\`
   This creates a scaffolded change at \`jinn/changes/<name>/\`.

3. **Get the artifact build order**
   \`\`\`bash
   jinn status --change "<name>" --json
   \`\`\`
   Parse the JSON to get:
   - \`applyRequires\`: array of artifact IDs needed before implementation (e.g., \`["tasks"]\`)
   - \`artifacts\`: list of all artifacts with their status and dependencies

4. **Create artifacts in sequence until apply-ready**

   Use the **TodoWrite tool** to track progress through the artifacts.

   Loop through artifacts in dependency order (artifacts with no pending dependencies first):

   a. **For each artifact that is \`ready\` (dependencies satisfied)**:
      - Get instructions for creating the artifact
      - Read any completed dependency files for context
      - Create the artifact file using the appropriate template
      - Show brief progress: "Created <artifact-id>"

   b. **Continue until all \`applyRequires\` artifacts are complete**
      - After creating each artifact, re-run status check
      - Stop when all required artifacts are done

   c. **If an artifact requires user input** (unclear context):
      - Use **AskUserQuestion tool** to clarify
      - Then continue with creation

5. **Show final status**

**Output**

After completing all artifacts, summarize:
- Change name and location
- List of artifacts created with brief descriptions
- What's ready: "All artifacts created! Ready for implementation."
- Prompt: "Run \`/apply\` or ask me to implement to start working on the tasks."

**Artifact Creation Guidelines**

- Follow the workflow schema for what each artifact should contain
- Read dependency artifacts for context before creating new ones
- Use templates as the structure - fill in their sections
- **IMPORTANT**: Context and rules are constraints for YOU, not content for the file
  - Do NOT copy context blocks into the artifact
  - These guide what you write, but should never appear in the output

**Guardrails**
- Create ALL artifacts needed for implementation
- Always read dependency artifacts before creating a new one
- If context is critically unclear, ask the user - but prefer making reasonable decisions to keep momentum
- If a change with that name already exists, ask if user wants to continue it or create a new one
- Verify each artifact file exists after writing before proceeding to next
`,
  };
}

export function getExploreSkillTemplate(): SkillTemplate {
  return {
    name: 'explore',
    description: 'Enter explore mode - a thinking partner for exploring ideas, investigating problems, and clarifying requirements. Use when the user wants to think through something before or during a change.',
    license: 'MIT',
    compatibility: 'Requires jinn CLI.',
    metadata: {
      author: 'jinn',
      version: '1.0',
      category: 'Workflow',
      tags: ['workflow', 'explore', 'thinking', 'investigation'],
    },
    instructions: `Enter explore mode. Think deeply. Visualize freely. Follow the conversation wherever it goes.

**IMPORTANT: Explore mode is for thinking, not implementing.** You may read files, search code, and investigate the codebase, but you must NEVER write code or implement features. If the user asks you to implement something, remind them to exit explore mode first and create a change proposal. You MAY create proposal artifacts if the user asks—that's capturing thinking, not implementing.

**This is a stance, not a workflow.** There are no fixed steps, no required sequence, no mandatory outputs. You're a thinking partner helping the user explore.

---

## The Stance

- **Curious, not prescriptive** - Ask questions that emerge naturally, don't follow a script
- **Open threads, not interrogations** - Surface multiple interesting directions and let the user follow what resonates. Don't funnel them through a single path of questions.
- **Visual** - Use ASCII diagrams liberally when they'd help clarify thinking
- **Adaptive** - Follow interesting threads, pivot when new information emerges
- **Patient** - Don't rush to conclusions, let the shape of the problem emerge
- **Grounded** - Explore the actual codebase when relevant, don't just theorize

---

## What You Might Do

**Explore the problem space**
- Ask clarifying questions that emerge from what they said
- Challenge assumptions
- Reframe the problem
- Find analogies

**Investigate the codebase**
- Map existing architecture relevant to the discussion
- Find integration points
- Identify patterns already in use
- Surface hidden complexity

**Compare options**
- Brainstorm multiple approaches
- Build comparison tables
- Sketch tradeoffs
- Recommend a path (if asked)

**Visualize**
\`\`\`
┌─────────────────────────────────────────┐
│     Use ASCII diagrams liberally        │
├─────────────────────────────────────────┤
│                                         │
│   ┌────────┐         ┌────────┐        │
│   │ State  │────────▶│ State  │        │
│   │   A    │         │   B    │        │
│   └────────┘         └────────┘        │
│                                         │
│   System diagrams, state machines,      │
│   data flows, architecture sketches,   │
│   dependency graphs, comparison tables  │
│                                         │
└─────────────────────────────────────────┘
\`\`\`

**Surface risks and unknowns**
- Identify what could go wrong
- Find gaps in understanding
- Suggest spikes or investigations

---

## Jinn Awareness

You have full context of the Jinn system. Use it naturally, don't force it.

### Check for context

At the start, quickly check what exists:
\`\`\`bash
jinn list
\`\`\`

This tells you:
- If there are active changes
- Their names and status
- What the user might be working on

If the user mentioned a specific change name, read its artifacts for context.

### When no change exists

Think freely. When insights crystallize, you might offer:

- "This feels solid enough to start a proposal. Want me to create one?"
- Or keep exploring - no pressure to formalize

### When a change exists

If the user mentions a change or you detect one is relevant:

1. **Read existing artifacts for context**
   - \`jinn/changes/<name>/proposal.md\`
   - \`jinn/changes/<name>/design.md\`
   - \`jinn/changes/<name>/tasks.md\`

2. **Reference them naturally in conversation**

3. **Offer to capture when decisions are made**

---

## What You Don't Have To Do

- Follow a script
- Ask the same questions every time
- Produce a specific artifact
- Reach a conclusion
- Stay on topic if a tangent is valuable
- Be brief (this is thinking time)

---

## Ending Discovery

There's no required ending. Discovery might:

- **Flow into a proposal**: "Ready to start? I can create a change proposal."
- **Result in artifact updates**: "Updated design.md with these decisions"
- **Just provide clarity**: User has what they need, moves on
- **Continue later**: "We can pick this up anytime"

---

## Guardrails

- **Don't implement** - Never write code or implement features. Creating proposal artifacts is fine, writing application code is not.
- **Don't fake understanding** - If something is unclear, dig deeper
- **Don't rush** - Discovery is thinking time, not task time
- **Don't force structure** - Let patterns emerge naturally
- **Don't auto-capture** - Offer to save insights, don't just do it
- **Do visualize** - A good diagram is worth many paragraphs
- **Do explore the codebase** - Ground discussions in reality
- **Do question assumptions** - Including the user's and your own
`,
  };
}

export function getApplySkillTemplate(): SkillTemplate {
  return {
    name: 'apply',
    description: 'Implement tasks from a Jinn change. Use when user wants to execute the implementation plan.',
    license: 'MIT',
    compatibility: 'Requires jinn CLI.',
    metadata: {
      author: 'jinn',
      version: '1.0',
      category: 'Workflow',
      tags: ['workflow', 'apply', 'implement', 'execute'],
    },
    instructions: `Implement tasks from a Jinn change.

**Input**: Optionally specify a change name (e.g., \`/apply add-auth\`). If omitted, check if it can be inferred from conversation context.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, run \`jinn list\` to get available changes

   Always announce: "Using change: <name>".

2. **Check status to understand the workflow**
   \`\`\`bash
   jinn status --change "<name>" --json
   \`\`\`

3. **Get apply instructions**
   \`\`\`bash
   jinn instructions apply --change "<name>" --json
   \`\`\`

4. **Read context files**

   Read the files listed in context files from the instructions output.

5. **Show current progress**

   Display:
   - Workflow being used
   - Progress: "N/M tasks complete"

6. **Implement tasks (loop until done or blocked)**

   For each pending task:
   - Show which task is being worked on
   - Make the code changes required
   - Keep changes minimal and focused
   - Mark task complete: \`- [ ]\` → \`- [x]\`
   - Continue to next task

   **Pause if:**
   - Task is unclear → ask for clarification
   - Implementation reveals a design issue → suggest updating artifacts
   - Error or blocker encountered → report and wait for guidance

7. **On completion or pause, show status**

**Guardrails**
- Keep going through tasks until done or blocked
- Always read context files before starting
- If task is ambiguous, pause and ask before implementing
- Keep code changes minimal and scoped to each task
- Update task checkbox immediately after completing each task
`,
  };
}

export function getArchiveSkillTemplate(): SkillTemplate {
  return {
    name: 'archive',
    description: 'Archive a completed change. Use when work is done and ready to be moved to archive.',
    license: 'MIT',
    compatibility: 'Requires jinn CLI.',
    metadata: {
      author: 'jinn',
      version: '1.0',
      category: 'Workflow',
      tags: ['workflow', 'archive', 'complete', 'done'],
    },
    instructions: `Archive a completed change.

**Input**: Optionally specify a change name (e.g., \`/archive add-auth\`). If omitted, check if it can be inferred from conversation context.

**Steps**

1. **If no change name provided, prompt for selection**

   Run \`jinn list --json\` to get available changes. Use the **AskUserQuestion tool** to let the user select.

   Show only active changes (not already archived).

   **IMPORTANT**: Do NOT guess or auto-select a change. Always let the user choose.

2. **Check artifact completion status**

   Run \`jinn status --change "<name>" --json\` to check artifact completion.

   **If any artifacts are not \`done\`:**
   - Display warning listing incomplete artifacts
   - Prompt user for confirmation to continue
   - Proceed if user confirms

3. **Check task completion status**

   Read the tasks file to check for incomplete tasks.

   **If incomplete tasks found:**
   - Display warning showing count of incomplete tasks
   - Prompt user for confirmation to continue
   - Proceed if user confirms

4. **Perform the archive**

   Create the archive directory if it doesn't exist:
   \`\`\`bash
   mkdir -p jinn/changes/archive
   \`\`\`

   Generate target name using current date: \`YYYY-MM-DD-<change-name>\`

   Move the change directory to archive:
   \`\`\`bash
   mv jinn/changes/<name> jinn/changes/archive/YYYY-MM-DD-<name>
   \`\`\`

5. **Display summary**

   Show archive completion summary including:
   - Change name
   - Workflow that was used
   - Archive location
   - Note about any warnings

**Guardrails**
- Always prompt for change selection if not provided
- Use status for completion checking
- Don't block archive on warnings - just inform and confirm
`,
  };
}

export function getReadySkillTemplate(): SkillTemplate {
  return {
    name: 'ready',
    description: 'Check production readiness before deployment. Use before major releases.',
    license: 'MIT',
    compatibility: 'Works with any project.',
    metadata: {
      author: 'jinn',
      version: '1.0',
      category: 'Quality',
      tags: ['quality', 'production', 'deployment', 'readiness'],
    },
    instructions: `Check production readiness before deployment.

## Production Readiness Checklist

### 1. Code Quality
- [ ] No console.log or debug statements
- [ ] No hardcoded secrets or keys
- [ ] Error handling in place
- [ ] TypeScript types correct

### 2. Testing
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] Edge cases covered

### 3. Security
- [ ] Input validation
- [ ] Authentication/authorization verified
- [ ] No security vulnerabilities (run security scan)
- [ ] Secrets not in code

### 4. Performance
- [ ] No memory leaks
- [ ] Load testing done if applicable
- [ ] Performance benchmarks met

### 5. Documentation
- [ ] README updated
- [ ] API docs updated
- [ ] Changelog updated

### 6. Deployment
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Rollback plan in place
- [ ] Monitoring/alerts configured

### 7. Business
- [ ] Feature complete per requirements
- [ ] Stakeholder sign-off

## Output

Provide a report showing:
- What's complete
- What's missing
- Risks identified
- Go/no-go recommendation
`,
  };
}
