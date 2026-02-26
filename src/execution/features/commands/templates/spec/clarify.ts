/**
 * Template for ghostwire:workflows:plan command
 *
 * Interactive Q&A to reduce ambiguity in specifications.
 * Replaces: speckit.clarify.md logic
 */

export const SPEC_CLARIFY_TEMPLATE = `<command-instruction>
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
4. If all resolved, proceed to \`/ghostwire:workflows:plan\`

---

**Next**: Answer the questions above, then run \`/ghostwire:workflows:plan\` again to apply changes
</command-instruction>
`;

/**
 * Clarification question format
 */
export interface ClarificationQuestion {
  number: number;
  topic: string;
  context: string;
  question: string;
  options: {
    a: { answer: string; implications: string };
    b: { answer: string; implications: string };
    c: { answer: string; implications: string };
  };
}

/**
 * Generate clarification question markdown
 */
export function generateClarificationQuestion(q: ClarificationQuestion): string {
  return `### Question ${q.number}: ${q.topic}

**Context**: ${q.context}

**What we need to know**: ${q.question}

**Suggested Answers**:

| Option | Answer | Implications |
|--------|--------|--------------|
| A | ${q.options.a.answer} | ${q.options.a.implications} |
| B | ${q.options.b.answer} | ${q.options.b.implications} |
| C | ${q.options.c.answer} | ${q.options.c.implications} |
| Custom | Provide your own answer | Explain how this affects the feature |

**Your choice**: _[Wait for user response]_
`;
}

/**
 * Extract [NEEDS CLARIFICATION] markers from spec
 */
export function extractClarificationMarkers(
  specContent: string,
): { marker: string; context: string }[] {
  const markers: { marker: string; context: string }[] = [];
  const pattern = /\[NEEDS CLARIFICATION:\s*([^\]]+)\]/g;
  let match;

  while ((match = pattern.exec(specContent)) !== null) {
    // Get surrounding context (100 chars before and after)
    const start = Math.max(0, match.index - 100);
    const end = Math.min(specContent.length, match.index + match[0].length + 100);
    const context = specContent.substring(start, end);

    markers.push({
      marker: match[1].trim(),
      context: context.replace(/\[NEEDS CLARIFICATION:[^\]]+\]/g, "[...]"),
    });
  }

  return markers;
}

/**
 * Limit markers to most critical 3
 */
export function prioritizeMarkers(
  markers: { marker: string; context: string }[],
): { marker: string; context: string }[] {
  // Priority: scope > security/privacy > user experience > technical details
  const priorityOrder = [
    "scope",
    "security",
    "privacy",
    "user",
    "ux",
    "technical",
    "implementation",
  ];

  return markers
    .map((m) => ({
      ...m,
      priority: priorityOrder.findIndex((p) => m.marker.toLowerCase().includes(p)),
    }))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3)
    .map(({ marker, context }) => ({ marker, context }));
}

/**
 * Apply clarifications to spec
 */
export function applyClarifications(
  specContent: string,
  answers: { question: number; answer: string; isCustom: boolean }[],
): string {
  let updated = specContent;

  for (const ans of answers) {
    // Find and replace the marker
    const pattern = /\[NEEDS CLARIFICATION:[^\]]+\]/;
    updated = updated.replace(pattern, ans.answer);
  }

  return updated;
}
