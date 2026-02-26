import type { CommandDefinition } from "../../claude-code-command-loader";

export const NAME = "ghostwire:workflows:complete";
export const DESCRIPTION = "Finalize and archive completed workflow";
export const TEMPLATE = `<command-instruction>
# Workflows:Complete Command

Finalize and archive a completed workflow.

## Process

1. **Verify Completion** - Confirm all acceptance criteria met
2. **Collect Results** - Gather outputs and artifacts
3. **Document Learnings (MANDATORY)** - Trigger /ghostwire:workflows:learnings with workflow context
4. **Archive Plan** - Move to completed state
5. **Generate Summary** - Create completion report

## Enforcement

- MANDATORY: Trigger /ghostwire:workflows:learnings before final completion output.
- Do not mark workflow complete unless learnings capture has been attempted.
- If learnings capture fails, report failure explicitly and stop before archive step.

## Output

- Completion summary document
- Artifacts and references
- Institutional learning record (if applicable)
- Next steps or follow-up items
</command-instruction>

<workflow-reference>
$ARGUMENTS
</workflow-reference>`;
export const ARGUMENT_HINT = "[workflow-reference]";

export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
  handoffs: [
    {
      label: "Capture learnings",
      agent: "ghostwire:workflows:learnings",
      prompt:
        "Document the learnings for this just-completed workflow, including root cause, working solution, and prevention guidance.",
      send: true,
    },
  ],
};
