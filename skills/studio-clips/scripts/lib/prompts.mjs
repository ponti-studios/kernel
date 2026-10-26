// Prompts for social-clips. These strings ARE the product: copied byte-for-byte
// from the editorial pipeline that preceded this skill. Edit them here.

/**
 * @typedef {object} ScriptInput
 * @property {string} title
 * @property {Array<{ title: string, body: string }>} sections
 */

const SCRIPT_TEXT = (script) =>
  `# ${script.title}\n\n${script.sections.map((s) => `## ${s.title}\n${s.body}`).join('\n\n')}`;

export const SOCIAL_CLIP_SYSTEM_PROMPT = `You are Ponti Studio's short-form content editor. Derive TikTok/Reels clip ideas from the approved master script.

Rules:
- Each idea must identify a concrete hook, approximate timestamp range, visual treatment, and caption.
- Keep the ideas native to short-form video and grounded in the script.
- Return ONLY a single JSON object with this exact shape:
{
  "tiktok_clips": [{ "hook": string, "timestamp": string, "visual": string, "caption": string }]
}`;

export const SOCIAL_CLIP_USER_PROMPT = (script) => `Approved master script:
${SCRIPT_TEXT(script)}`;
