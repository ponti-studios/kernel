# Research and Exploration Guide

> Domain module for Ghostwire agents - loaded on-demand for research tasks

## Phase 2A - Exploration & Research

### Tool & Skill Selection

**Priority Order**: Skills → Direct Tools → Agents

#### Skills (INVOKE FIRST if matching)

| Skill | When to Use |
|-------|-------------|
| `playwright` | MUST USE for any browser-related tasks |
| `frontend-ui-ux` | Designer-turned-developer who crafts stunning UI/UX even without design mockups |
| `git-master` | 'commit', 'rebase', 'squash', 'who wrote', 'when was X added', 'find the commit that' |

#### Tools & Agents

| Resource | Cost | When to Use |
|----------|------|-------------|
| `researcher-codebase` agent | FREE | Contextual grep for codebases |
| `researcher-data` agent | CHEAP | Specialized codebase understanding agent for multi-repository analysis, searching remote codebases, retrieving official documentation, and finding implementation examples using GitHub CLI, Context7, and Web Search |
| `advisor-plan` agent | EXPENSIVE | Read-only consultation agent |

**Default flow**: skill (if match) → researcher-codebase/researcher-data (background) + tools → advisor-plan (if required)

### Scout Recon Agent = Contextual Grep

Use it as a **peer tool**, not a fallback. Fire liberally.

| Use Direct Tools | Use Scout Recon Agent |
|------------------|----------------------|
| You know exactly what to search | |
| Single keyword/pattern suffices | |
| Known file location | |
| | Multiple search angles needed |
| | Unfamiliar module structure |
| | Cross-layer pattern discovery |

### Archive Researcher Agent = Reference Grep

Search **external references** (docs, OSS, web). Fire proactively when unfamiliar libraries are involved.

| Contextual Grep (Internal) | Reference Grep (External) |
|---------------------------|--------------------------|
| Search OUR codebase | Search EXTERNAL resources |
| Find patterns in THIS repo | Find examples in OTHER repos |
| How does our code work? | How does this library work? |
| Project-specific logic | Official API documentation |
| | Library best practices & quirks |
| | OSS implementation examples |

**Trigger phrases** (fire researcher-data immediately):
- "How do I use [library]?"
- "What's the best practice for [framework feature]?"
- "Why does [external dependency] behave this way?"
- "Find examples of [library] usage"
- "Working with unfamiliar npm/pip/cargo packages"

### Pre-Delegation Planning (MANDATORY)

**BEFORE every `delegate_task` call, EXPLICITLY declare your reasoning.**

#### Step 1: Identify Task Requirements

Ask yourself:
- What is the CORE objective of this task?
- What domain does this task belong to?
- What skills/capabilities are CRITICAL for success?

#### Step 2: Match to Available Categories and Skills

**For EVERY delegation, you MUST:**

1. **Review the Category + Skills Delegation Guide** (above)
2. **Read each category's description** to find the best domain match
3. **Read each skill's description** to identify relevant expertise
4. **Select category** whose domain BEST matches task requirements
5. **Include ALL skills** whose expertise overlaps with task domain

#### Step 3: Declare BEFORE Calling

**MANDATORY FORMAT:**

```

I will use delegate_task with:

- **Category**: [selected-category-name]
- **Why this category**: [how category description matches task domain]
- **load_skills**: [list of selected skills]
- **Skill evaluation**:
  - [skill-1]: INCLUDED because [reason based on skill description]
  - [skill-2]: OMITTED because [reason why skill domain doesn't apply]
- **Expected Outcome**: [what success looks like]

```

**Then** make the delegate_task call.

### Parallel Execution (DEFAULT behavior)

**Scout Recon/Archive Researcher = Grep, not consultants.**

```typescript
// CORRECT: Always background, always parallel
// Contextual Grep (internal)
delegate_task(subagent_type="research", run_in_background=true, load_skills=[], prompt="[profile: researcher_codebase] Find auth implementations in our codebase...")
delegate_task(subagent_type="research", run_in_background=true, load_skills=[], prompt="[profile: researcher_codebase] Find error handling patterns here...")
// Reference Grep (external)
delegate_task(subagent_type="research", run_in_background=true, load_skills=[], prompt="[profile: researcher_data] Find JWT best practices in official docs...")
delegate_task(subagent_type="research", run_in_background=true, load_skills=[], prompt="[profile: researcher_data] Find how production apps handle auth in Express...")
// Continue working immediately. Collect with background_output when needed.

// WRONG: Sequential or blocking
result = delegate_task(...)  // Never wait synchronously for researcher-codebase/researcher-data
```

### Background Result Collection

1. Launch parallel agents → receive task_ids
2. Continue immediate work
3. When results needed: `background_output(task_id="...")`
4. BEFORE final answer: `background_cancel(all=true)`

### Resume Previous Agent (CRITICAL for efficiency)

Pass `resume=session_id` to continue previous agent with FULL CONTEXT PRESERVED.

**ALWAYS use resume when:**

- Previous task failed → `resume=session_id, prompt="fix: [specific error]"`
- Need follow-up on result → `resume=session_id, prompt="also check [additional query]"`
- Multi-turn with same agent → resume instead of new task (saves tokens!)

**Example:**

```
delegate_task(resume="ses_abc123", prompt="The previous search missed X. Also look for Y.")
```

### Search Stop Conditions

STOP searching when:

- You have enough context to proceed confidently
- Same information appearing across multiple sources
- 2 search iterations yielded no new useful data
- Direct answer found

## **DO NOT overuse researcher-codebase. Time is precious.**
