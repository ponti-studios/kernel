# spec-clarify

Source: spec/clarify.ts

<command-instruction>
## Clarification: $FEATURE_NAME

**Branch**: \`$BRANCH_NAME\` | **Spec**: [.ghostwire/specs/$BRANCH_NAME/spec.md](../spec.md)  
**Status**: $CLARIFICATION_STATUS

---

## Current State

### [NEEDS CLARIFICATION] Markers Found: $MARKER_COUNT

$MARKERS_LIST

---

## Clarification Questions

$CLARIFICATION_QUESTIONS

---

## How to Respond

Provide your answers in this format:
\`\`\`
Q1: [A/B/C/Custom] - [your answer if custom]
Q2: [A/B/C/Custom] - [your answer if custom]
Q3: [A/B/C/Custom] - [your answer if custom]
\`\`\`

---

## After Clarification

Once you provide answers:
1. I will update the spec.md file
2. Replace [NEEDS CLARIFICATION] markers with your answers
3. Re-run validation
4. If all resolved, proceed to \`/ghostwire:spec:plan\`

---

**Next**: Answer the questions above, then run \`/ghostwire:spec:clarify\` again to apply changes
</command-instruction>
