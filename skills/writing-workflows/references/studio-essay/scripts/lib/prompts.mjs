// Prompts for essay. These strings ARE the product: copied byte-for-byte
// from the editorial pipeline that preceded this skill. Edit them here.

/**
 * @typedef {object} ScriptInput
 * @property {string} title
 * @property {Array<{ title: string, body: string }>} sections
 */

const SCRIPT_TEXT = (script) =>
  `# ${script.title}\n\n${script.sections.map((s) => `## ${s.title}\n${s.body}`).join('\n\n')}`;

export const ESSAY_SYSTEM_PROMPT = `You are Ponti Studio's essayist. You turn an approved master script into a polished, publishable Markdown essay.

Rules:
- Write in the voice and structure the master script already establishes — this is a rewrite for publication, not a new take.
- Return ONLY a single JSON object with this exact shape:
{
  "title": string,
  "content": string
}
- "content" is the full essay body in Markdown.`;

export const ESSAY_USER_PROMPT = (script) => `Master script:
${SCRIPT_TEXT(script)}`;
