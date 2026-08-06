#!/usr/bin/env bun
// Generates an image via OpenRouter and saves it (+ a brief sidecar) to the Desktop.

const DEFAULT_MODEL = "google/gemini-3.1-flash-image-preview";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "artwork";
}

export function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export interface OpenRouterImageResponse {
  id?: string;
  model?: string;
  created?: number;
  usage?: unknown;
  provider?: unknown;
  choices?: Array<{
    message?: {
      content?: string;
      images?: Array<{ image_url?: { url?: string } }>;
    };
  }>;
}

export function extractImageDataUrl(response: OpenRouterImageResponse): string {
  const url = response.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!url) {
    throw new Error(
      `No image found in OpenRouter response: ${JSON.stringify(response).slice(0, 500)}`
    );
  }
  return url;
}

export function buildUsageRecord(
  response: OpenRouterImageResponse,
  model: string,
  prompt: string
): Record<string, unknown> {
  const sanitizedChoices = response.choices?.map((choice) => ({
    finishReason: (choice as Record<string, unknown>).finish_reason,
    hasImage: Boolean(choice.message?.images?.length),
    content: choice.message?.content,
  }));

  return {
    timestamp: new Date().toISOString(),
    model,
    prompt,
    id: response.id,
    created: response.created,
    usage: response.usage,
    provider: response.provider,
    choices: sanitizedChoices,
  };
}

export function decodeDataUrl(dataUrl: string): { buffer: Buffer; extension: string } {
  const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) {
    throw new Error("Image data URL was not in the expected data:image/<type>;base64,<data> form");
  }
  const extension = match[1] === "jpeg" ? "jpg" : match[1];
  return { buffer: Buffer.from(match[2], "base64"), extension };
}

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = argv[i + 1];
      args[key] = value;
      i++;
    }
  }
  return args;
}

async function logUsage(record: Record<string, unknown>): Promise<string> {
  const dir = `${process.env.HOME}/.hominem/ai_usage`;
  const path = `${dir}/${timestamp()}.json`;
  await Bun.write(path, JSON.stringify(record, null, 2));
  return path;
}

export async function requestImage(
  apiKey: string,
  model: string,
  prompt: string
): Promise<{ buffer: Buffer; extension: string }> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      modalities: ["image", "text"],
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenRouter request failed (${response.status}): ${body}`);
  }

  const json = (await response.json()) as OpenRouterImageResponse;

  try {
    const usagePath = await logUsage(buildUsageRecord(json, model, prompt));
    console.error(`Logged usage metadata to ${usagePath}`);
  } catch (err) {
    console.error(
      `Failed to log usage metadata (non-fatal): ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const dataUrl = extractImageDataUrl(json);
  return decodeDataUrl(dataUrl);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const prompt = args.prompt;
  if (!prompt) {
    console.error("Missing required --prompt \"<final image prompt>\"");
    process.exit(1);
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error(
      "OPENROUTER_API_KEY is not set. Set it in your environment before running this script."
    );
    process.exit(1);
  }

  const model = args.model || process.env.OPENROUTER_IMAGE_MODEL || DEFAULT_MODEL;
  const slug = slugify(args.name || prompt);
  const stamp = timestamp();

  let image: { buffer: Buffer; extension: string };
  try {
    image = await requestImage(apiKey, model, prompt);
  } catch (err) {
    // Retry once — OpenRouter occasionally returns a text-only response
    // with no image attached, unrelated to the prompt itself.
    console.error(
      `First attempt failed, retrying once: ${err instanceof Error ? err.message : String(err)}`
    );
    image = await requestImage(apiKey, model, prompt);
  }

  const outDir = `${process.env.HOME}/Desktop/${slug}-${stamp}`;
  const imagePath = `${outDir}/image.${image.extension}`;
  const briefPath = `${outDir}/brief.md`;

  await Bun.write(imagePath, image.buffer);

  let briefContent = `# Artwork brief\n\n**Model:** ${model}\n**Generated:** ${stamp}\n\n## Final prompt\n\n${prompt}\n`;
  if (args["brief-file"]) {
    const extra = await Bun.file(args["brief-file"]).text();
    briefContent += `\n## Intake summary\n\n${extra}\n`;
  }
  await Bun.write(briefPath, briefContent);

  console.log(imagePath);
  console.log(briefPath);
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
