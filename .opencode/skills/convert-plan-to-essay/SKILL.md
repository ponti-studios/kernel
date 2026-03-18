---
name: convert-plan-to-essay
description: Convert a completed OpenSpec plan into a long-form essay for public documentation. Reads plan artifacts and synthesizes them into a narrative essay that emphasizes engineering principles and mental models, not just implementation details.
license: MIT
compatibility: Works with any plan in docs/plans/ that has spec.md
metadata:
  author: jinn
  version: "1.0"
---

Convert a completed plan into a long-form engineering essay for public documentation.

---

**Input**: A plan name from `docs/plans/` (e.g., "001-simplify-agent-framework" or just "001" or the full date-based name).

**Steps**

1. **Validate the plan exists**

   Find the plan directory in `docs/plans/`. Use glob to verify it exists and has a `spec.md` file.
   
   If not found, show available plans and ask the user to select one.

2. **Read all plan artifacts**

   Read these files from the plan directory:
   - `spec.md` - Feature specification with user scenarios and acceptance criteria
   - `plan.md` - Implementation plan with phases and timeline
   - `research.md` - Research findings on current state
   - `data-model.md` - Entity definitions and relationships
   - `quickstart.md` - Developer guide with common tasks
   - `tasks.md` - Implementation tasks with status (for understanding what was done)
   
   If files don't exist, note which are missing (some plans may not have all artifacts).

3. **Analyze for principles, not just details**

   The essay should communicate transferable engineering knowledge. Go beyond "what changed" to answer:

   - **Problem type**: What category of engineering problem is this? (e.g., "ambiguous discovery," "split-brain consistency," "naming as architecture," "composition complexity")
   
   - **Root cause**: Why did this problem emerge? (e.g., "organic growth without constraints," "multiple teams not sharing a mental model," "historical naming that outlived its context")
   
   - **Solution principles**: What mental models or engineering principles guided the fix? (e.g., "one source of truth," "explicit over implicit," "co-location reflects ownership")
   
   - **Structural patterns**: What software structures encode these principles? (e.g., "single entry point," "deterministic precedence," "contract-driven validation")

4. **Synthesize into essay format**

   Write to `docs/engineering/<plan-name>.md` with this structure:

   ```markdown
   # <Title>: A Technical Narrative

   **Branch**: `<branch-name>`  
   **Date**: <date>  
   **Author**: Engineering team  
   **Audience**: Anyone interested in how this engineering challenge was approached

   ---

   ## Why This Document Exists

   [1-2 sentences: what this essay offers that the code diff cannot]
   
   ---

   ## The Problem Space

   ### What Kind of Problem Is This?

   [Identify the category: discovery ambiguity, composition complexity, naming debt, split-brain systems, etc. Why does this category of problem matter?]

   ### How Did It Manifest?

   [Specific symptoms: What did developers experience? What broke? What was confusing? Use concrete examples from the artifacts.]

   ### Why Did It Emerge?

   [Root cause: What allowed this problem to exist? Organic growth? Multiple authorship? Historical context that changed?]

   ---

   ## The Solution

   ### Guiding Principles

   [What mental models or engineering principles guided the fix? These should be transferable to other contexts.]
   
   ### Architectural Choices

   [What specific software structures implement these principles? Explain the "what" and the "why" - why this structure rather than alternatives.]
   
   ### What Was Considered and Rejected

   [Alternatives that were rejected and why - this is often the most valuable part for readers facing similar decisions]

   ---

   ## The Implementation

   [Brief narrative of execution - not a step-by-step, but the shape of the work and any interesting challenges. Keep this lighter than the principles.]

   ---

   ## What Was Not Changed

   [Explicitly: what was left alone and why. This sets boundaries and shows scope discipline.]

   ---

   ## Transferable Insights

   [What from this experience applies beyond this codebase? What are the general principles that other engineering teams might face?]
   
   ---

   ## Closing

   [1-2 paragraphs: the core insight, expressed in terms of what it teaches about engineering practice]
   ```

   **Tone**: The essay should be readable by anyone who encounters similar problems, not just people familiar with this codebase. Write to explain the thinking, not just the outcome.

   **Length**: Target 1,000-1,800 words. Quality over quantity.

5. **Verify and confirm**

   - Read back the created essay
   - Confirm it emphasizes principles over implementation details
   - Check that "What Was Not Changed" and "Transferable Insights" sections are present
   - Flag any gaps

**Output**

```
## Essay Created

**Plan**: <plan-name>
**Location**: docs/engineering/<plan-name>.md
**Word count**: ~X words

The essay covers:
- Problem category: [what kind of engineering problem]
- Root cause: [why it emerged]
- Solution principles: [guiding mental models]
- Transferable insights: [what others can learn]
```

**Tips**

- Start with the problem category - give readers a frame for what kind of challenge this addresses
- Use specific examples sparingly; the essay should be about principles, not a catalog of changes
- "What was not changed" should be explicit - shows scope boundaries clearly
- The "Transferable Insights" section is what makes the essay valuable to a wider audience
- If the plan is simple, condense but keep the principle-focused sections
- Avoid: listing every file changed, step-by-step task descriptions, jargon without explanation