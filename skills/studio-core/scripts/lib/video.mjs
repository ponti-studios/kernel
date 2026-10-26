// OpenRouter async video API (POST /api/v1/videos, then poll).
//
// Raw fetch: the shape is documented and proven live, with no SDK dependency.
// The important asymmetry — cost arrives on the POLL, not on the submit — is
// preserved: submit may report nothing, the completed poll reports the price,
// and generateClipWithUsage merges the two keeping the first reported value.
//
// Ported from studio packages/providers/src/openrouter-video.ts.
import { mergeUsage, normalizeUsage } from './usage.mjs';

const BASE_URL = 'https://openrouter.ai/api/v1';

export class OpenRouterVideoError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'OpenRouterVideoError';
    this.code = code;
  }
}

// Prompt-text character lock. Kept for text-to-video fallback; a keyframe makes it
// redundant, because the picture carries the character instead of the prose.
export const CHARACTER_LOCK = `Character lock — match exactly:
3D chibi cartoon boy, soft Pixar-like render.
- Hair: voluminous black curly hair, medium length, covers forehead and ears.
- Mask: matte black OVAL mask covering the full face. Two ROUND symmetric eye
  holes. Small dark strap buckles at both sides and one at top center.
  No mouth, no nose detail. NEVER change the mask shape.
  Real eyes NEVER visible; eye holes are dark empty voids.
- Neck tattoos: TWO portraits, always this pairing — a crowned KING (bearded
  man in profile) on one side of the neck, a crowned QUEEN (woman in profile)
  on the other side. Never two kings, never two queens.
- Outfit: black knit button cardigan (patch pockets) over plain white crew
  t-shirt; black cargo pants with side flap pockets; black Adidas Samba
  sneakers (white side stripes, gum-brown soles, small blue heel tab).
- Feet point forward, never splayed outward.`;

export class OpenRouterVideoModel {
  #apiKey;
  #fetchImpl;

  constructor(apiKey, fetchImpl = globalThis.fetch) {
    this.#apiKey = apiKey;
    this.#fetchImpl = fetchImpl;
  }

  get #headers() {
    return {
      Authorization: `Bearer ${this.#apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async submit(input) {
    let response;
    try {
      response = await this.#fetchImpl(`${BASE_URL}/videos`, {
        method: 'POST',
        headers: this.#headers,
        body: JSON.stringify({
          model: input.model,
          prompt: input.prompt,
          duration: input.duration,
          aspect_ratio: input.aspectRatio,
          resolution: input.resolution,
          generate_audio: input.generateAudio ?? false,
          ...(input.seed !== undefined ? { seed: input.seed } : {}),
          // Image-to-video: an approved keyframe anchors the first frame, so the
          // shot inherits a locked look instead of re-inventing it from text.
          // Accepts [{ type: 'first_frame' | 'last_frame', url }] — the provider
          // needs a public https URL, never a local path.
          // The API's frame_images shape is {type:'image_url', image_url:{url}, frame_type},
          // not the {type:'first_frame', url} the cookbook prose implies — verified
          // against a live 400 and then a live submit.
          ...(input.frameImages?.length
            ? {
                frame_images: input.frameImages.map((f) => ({
                  type: 'image_url',
                  image_url: { url: f.url },
                  frame_type: f.type ?? 'first_frame',
                })),
              }
            : {}),
          ...(input.inputReferences?.length ? { input_references: input.inputReferences } : {}),
        }),
      });
    } catch (cause) {
      throw new OpenRouterVideoError(
        'network',
        cause instanceof Error ? cause.message : 'video submit failed',
      );
    }
    if (response.status === 402) {
      throw new OpenRouterVideoError('credits', 'openrouter credits insufficient');
    }
    if (response.status !== 202) {
      // Carry the provider's own message: a bare status turns every schema mismatch
      // into an afternoon of guessing.
      const detail = await response.text().catch(() => '');
      throw new OpenRouterVideoError('http', `video submit ${response.status}: ${detail.slice(0, 400)}`);
    }
    let body;
    try {
      body = await response.json();
    } catch {
      throw new OpenRouterVideoError('shape', 'video submit was not JSON');
    }
    if (!body?.id || !body?.polling_url) {
      throw new OpenRouterVideoError('shape', 'video submit missing id or polling_url');
    }
    const usage = normalizeUsage(body.usage);
    return { id: body.id, pollingUrl: body.polling_url, ...(usage ? { usage } : {}) };
  }

  async poll(pollingUrl) {
    const url = pollingUrl.startsWith('/') ? `${BASE_URL}${pollingUrl}` : pollingUrl;
    let response;
    try {
      response = await this.#fetchImpl(url, { headers: this.#headers });
    } catch (cause) {
      throw new OpenRouterVideoError(
        'network',
        cause instanceof Error ? cause.message : 'video poll failed',
      );
    }
    if (!response.ok) {
      throw new OpenRouterVideoError('http', `video poll ${response.status}`);
    }
    let body;
    try {
      body = await response.json();
    } catch {
      throw new OpenRouterVideoError('shape', 'video poll was not JSON');
    }
    if (!body?.status) throw new OpenRouterVideoError('shape', 'video poll missing status');
    const usage = normalizeUsage(body.usage);
    return {
      status: body.status,
      unsignedUrls: body.unsigned_urls ?? [],
      ...(body.error ? { error: body.error } : {}),
      ...(usage ? { usage } : {}),
    };
  }

  async download(url) {
    let response;
    try {
      response = await this.#fetchImpl(url, { headers: this.#headers });
    } catch (cause) {
      throw new OpenRouterVideoError(
        'network',
        cause instanceof Error ? cause.message : 'video download failed',
      );
    }
    if (!response.ok) {
      throw new OpenRouterVideoError('http', `video download ${response.status}`);
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.length === 0) throw new OpenRouterVideoError('empty', 'video download empty');
    return bytes;
  }

  /**
   * The whole job: submit, poll to completion, download. Returns the bytes plus
   * whatever the provider said it cost. `generateClip` keeps the bytes-only
   * signature for existing callers.
   */
  async generateClipWithUsage(input, options = {}) {
    const submitted = await this.submit(input);
    const interval = options.pollIntervalMs ?? 15000;
    const deadline = Date.now() + (options.timeoutMs ?? 10 * 60 * 1000);
    let usage = submitted.usage;
    for (;;) {
      const job = await this.poll(submitted.pollingUrl);
      usage = mergeUsage(usage, job.usage);
      if (job.status === 'completed') {
        const url = job.unsignedUrls[0];
        if (!url) throw new OpenRouterVideoError('shape', 'completed job has no output url');
        const bytes = await this.download(url);
        return { bytes, ...(usage ? { usage } : {}), jobId: submitted.id };
      }
      if (job.status === 'failed' || job.status === 'cancelled' || job.status === 'expired') {
        throw new OpenRouterVideoError(job.status, job.error ?? `video job ${job.status}`);
      }
      if (Date.now() > deadline) {
        throw new OpenRouterVideoError('timeout', `still ${job.status} after timeout`);
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  async generateClip(input, options = {}) {
    const { bytes } = await this.generateClipWithUsage(input, options);
    return bytes;
  }
}
