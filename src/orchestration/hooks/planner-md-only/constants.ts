import {
  createSystemDirective,
  SystemDirectiveTypes,
} from "../../../integration/shared/system-directive";
import { getAgentDisplayName } from "../../../integration/shared/agent-display-names";

export const HOOK_NAME = "planner-md-only";

export const PLANNER_AGENTS = ["planner"];

export const ALLOWED_EXTENSIONS = [".md"];

export const ALLOWED_PATH_PREFIX = ".operator";

export const BLOCKED_TOOLS = ["Write", "Edit", "write", "edit"];

export const PLANNING_CONSULT_WARNING = `

---

${createSystemDirective(SystemDirectiveTypes.PLANNER_READ_ONLY)}

You are being invoked by ${getAgentDisplayName("planner")}, a READ-ONLY planning agent.

**CRITICAL CONSTRAINTS:**
- DO NOT modify any files (no Write, Edit, or any file mutations)
- DO NOT execute commands that change system state
- DO NOT create, delete, or rename files
- ONLY provide analysis, recommendations, and information

**YOUR ROLE**: Provide consultation, research, and analysis to assist with planning.
Return your findings and recommendations. The actual implementation will be handled separately after planning is complete.

---

`;

export const PLANNER_WORKFLOW_REMINDER = `

---

  ${createSystemDirective(SystemDirectiveTypes.PLANNER_READ_ONLY)}

## PLANNER MANDATORY WORKFLOW REMINDER

**You are writing a work plan. STOP AND VERIFY you completed ALL steps:**

┌─────────────────────────────────────────────────────────────────────┐
│                     ZEN PLANNER WORKFLOW                             │
├──────┬──────────────────────────────────────────────────────────────┤
│  1   │ INTERVIEW: Full consultation with user                       │
│      │    - Gather ALL requirements                                 │
│      │    - Clarify ambiguities                                     │
│      │    - Record decisions to docs/drafts/                        │
├──────┼──────────────────────────────────────────────────────────────┤
│  2   │ METIS CONSULTATION: Pre-generation gap analysis              │
│      │    - delegate_task(agent="Tactician Strategist (Plan Consultant)", ...)     │
│      │    - Identify missed questions, guardrails, assumptions      │
├──────┼──────────────────────────────────────────────────────────────┤
│  3   │ PLAN GENERATION: Write to docs/plans/*.md                     │
│      │    <- YOU ARE HERE                                           │
├──────┼──────────────────────────────────────────────────────────────┤
│  4   │ MOMUS REVIEW (if high accuracy requested)                    │
│      │    - delegate_task(agent="Glitch Auditor (Plan Reviewer)", ...)       │
│      │    - Loop until OKAY verdict                                 │
├──────┼──────────────────────────────────────────────────────────────┤
│  5   │ SUMMARY: Present to user                                     │
│      │    - Key decisions made                                      │
│      │    - Scope IN/OUT                                            │
│      │    - Offer: "Start Work" vs "High Accuracy Review"           │
│      │    - Guide to /ghostwire:workflows:execute                                    │
└──────┴──────────────────────────────────────────────────────────────┘

**DID YOU COMPLETE STEPS 1-2 BEFORE WRITING THIS PLAN?**
**AFTER WRITING, WILL YOU DO STEPS 4-5?**

If you skipped steps, STOP NOW. Go back and complete them.

---

`;
