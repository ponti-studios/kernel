// Shared draft plumbing for the studio writing skills: pull JSON out of a model
// response, validate it against a schema, resolve the text model lazily (so a
// --dry-run needs neither the provider module nor a key), and define the master
// script shape every fan-out skill reads.
//
// Ported from packages/editorial/src/{json,generate}.ts. No dependencies.

import { array, object, string } from './validate.mjs';

export function extractJson(content) {
  let text = content.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced?.[1]) {
    text = fenced[1].trim();
  }
  // Objects and top-level arrays (shot lists) alike.
  const objStart = text.indexOf('{');
  const arrStart = text.indexOf('[');
  const start =
    objStart === -1 ? arrStart : arrStart === -1 ? objStart : Math.min(objStart, arrStart);
  const end = start === arrStart && arrStart !== -1 ? text.lastIndexOf(']') : text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    text = text.slice(start, end + 1);
  }
  return JSON.parse(text);
}

export const scriptDraftSchema = object({
  title: string({ min: 1 }),
  sections: array(
    object({
      title: string({ min: 1 }),
      body: string({ min: 1 }),
    }),
    { min: 1 },
  ),
});

function assertModel(text) {
  if (!text || typeof text.generate !== 'function') {
    throw new Error(
      'no text model: pass one in (a model with generate()), or let the CLI load ' +
        'studio-core/scripts/lib/text.mjs',
    );
  }
}

export async function generateJson(text, schema, input) {
  assertModel(text);
  const result = await text.generate({
    system: input.system,
    user: input.user,
    jsonMode: input.options?.jsonMode ?? true,
    ...(input.options?.model ? { model: input.options.model } : {}),
    ...(input.options?.idempotencyKey ? { idempotencyKey: input.options.idempotencyKey } : {}),
  });

  let parsed;
  try {
    parsed = schema.safeParse(extractJson(result.content));
  } catch (cause) {
    throw new Error(
      `model returned invalid JSON: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
  }
  if (!parsed.success) {
    throw new Error(`model returned invalid JSON for schema: ${parsed.error.message}`);
  }
  return {
    draft: parsed.data,
    providerRequestId: result.providerRequestId ?? undefined,
    ...(result.usage ? { usage: result.usage } : {}),
  };
}

export const DEFAULT_TEXT_MODEL = 'deepseek/deepseek-chat-v3-0324';

/** Candidate locations for studio-core's text model, first existing wins. */
export function textModelEntryCandidates() {
  if (process.env.STUDIO_CORE_TEXT_ENTRY) return [process.env.STUDIO_CORE_TEXT_ENTRY];
  return [
    // lib/ -> scripts/ -> skill/ -> skills/studio-core/...
    new URL('../../../studio-core/scripts/lib/text.mjs', import.meta.url).pathname,
    // The documented relative path from the skill root.
    new URL('../../studio-core/scripts/lib/text.mjs', import.meta.url).pathname,
  ];
}

/**
 * Load studio-core's OpenRouterTextModel. Throws a pointed error when the
 * sibling skill is missing — callers that pass their own model never get here.
 */
export async function loadTextModelModule() {
  const tried = textModelEntryCandidates();
  const { existsSync } = await import('node:fs');
  for (const entry of tried) {
    if (!existsSync(entry)) continue;
    const mod = await import(entry);
    if (typeof mod.OpenRouterTextModel !== 'function') {
      throw new Error(`${entry} does not export OpenRouterTextModel`);
    }
    return mod;
  }
  throw new Error(
    `studio-core text model not found. Looked in:\n  ${tried.join('\n  ')}\n` +
      'Install the studio-core skill, set STUDIO_CORE_TEXT_ENTRY, or pass a model in.',
  );
}

/** A model that resolves studio-core on first `generate()` — so a --dry-run
 * never needs the module (or an API key) to exist.
 * @param {{model?: string, apiKey?: string}} [config]
 */
export function createLazyTextModel(config = {}) {
  let inner;
  const resolve = async () => {
    if (inner) return inner;
    const mod = await loadTextModelModule();
    const apiKey = config.apiKey ?? process.env.OPENROUTER_API_KEY;
    const model = config.model ?? process.env.OPENROUTER_TEXT_MODEL ?? DEFAULT_TEXT_MODEL;
    // studio-core exports the same class the studio providers package did:
    // new OpenRouterTextModel(apiKey, model).
    inner =
      typeof mod.createTextModel === 'function'
        ? mod.createTextModel({ apiKey, model })
        : new mod.OpenRouterTextModel(apiKey, model);
    return inner;
  };
  return {
    async generate(input) {
      const model = await resolve();
      return model.generate(input);
    },
  };
}
