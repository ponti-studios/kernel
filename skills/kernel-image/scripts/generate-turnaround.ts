#!/usr/bin/env bun
// Generates a plain-background turnaround sheet for a named character, to
// visually sanity-check their identity file in isolation from any scene,
// material, or lighting mode. Diagnostic/test tool, not a final artwork.

import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  slugify,
  timestamp,
  requestImage,
} from "./generate-image.ts";

const VALID_CHARACTERS = ["wyatt", "benny", "lucy", "void"] as const;
type CharacterName = (typeof VALID_CHARACTERS)[number];

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const CHARACTERS_DIR = join(SCRIPT_DIR, "..", "references", "characters");
const STYLE_GUIDE_PATH = join(SCRIPT_DIR, "..", "references", "anime", "style-guide.md");

export function buildTurnaroundPrompt(
  character: CharacterName,
  characterFile: string,
  styleGuide: string
): string {
  const outfitNote =
    character === "void"
      ? "Void has no outfit — render only the fixed silhouette described above."
      : "Render the character's fixed default outfit exactly as described above.";

  return [
    `Generate a character turnaround/reference sheet for consistency testing —`,
    `not a finished artwork. Four views of the same character, side by side in`,
    `one image: front view, 3/4 view, side view, and back view, all in an`,
    `identical relaxed neutral standing pose (not a T-pose), identical`,
    `proportions and identical colors across every view. ${outfitNote}`,
    `Plain flat white/neutral seamless studio background with no props, no`,
    `scenery, no environmental lighting drama, no shadows beyond simple flat`,
    `contact shadow under the feet — the only goal is to isolate and verify`,
    `the character design itself.`,
    ``,
    `Render per this fixed style contract:`,
    styleGuide,
    ``,
    `Character identity (fixed, do not deviate):`,
    characterFile,
  ].join("\n");
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

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const character = args.character as CharacterName | undefined;
  if (!character || !VALID_CHARACTERS.includes(character)) {
    console.error(
      `Missing or invalid --character. Must be one of: ${VALID_CHARACTERS.join(", ")}`
    );
    process.exit(1);
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error(
      "OPENROUTER_API_KEY is not set. Set it in your environment before running this script."
    );
    process.exit(1);
  }

  const characterFile = await Bun.file(join(CHARACTERS_DIR, `${character}.md`)).text();
  const styleGuide = await Bun.file(STYLE_GUIDE_PATH).text();
  const prompt = buildTurnaroundPrompt(character, characterFile, styleGuide);

  const model = process.env.OPENROUTER_IMAGE_MODEL || "google/gemini-3.1-flash-image-preview";

  console.error(
    `Generating a diagnostic turnaround sheet for ${character} (single paid API call, not a final artwork)...`
  );

  const image = await requestImage(apiKey, model, prompt);

  const slug = slugify(`${character}-turnaround`);
  const stamp = timestamp();
  const outDir = `${process.env.HOME}/Desktop/${slug}-${stamp}`;
  const imagePath = `${outDir}/image.${image.extension}`;
  const briefPath = `${outDir}/brief.md`;

  await Bun.write(imagePath, image.buffer);
  await Bun.write(
    briefPath,
    `# Turnaround sheet brief\n\n**Character:** ${character}\n**Model:** ${model}\n**Generated:** ${stamp}\n\n## Final prompt\n\n${prompt}\n`
  );

  console.log(imagePath);
  console.log(briefPath);
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
