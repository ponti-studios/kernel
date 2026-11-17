#!/usr/bin/env node
// One utterance, one audio file. The single speech entrypoint for every studio
// tool, including tower-bridge, which calls it once per turn.
//
// stdin:  {"text": "...", "out": "/path/file.mp3", "voice": "Despina", "model": "...", "responseFormat": "pcm"}
//         model, voice and responseFormat are optional; they default to the
//         configured speech model and DEFAULT_VOICE_ID.
// stdout: {"out", "format", "voice", "model", "bytes", "characters"}
import { writeFileSync } from "node:fs";
import { apiKey, loadEnv } from "./lib/config.mjs";
import { OpenRouterSpeechModel } from "./lib/speech.mjs";

const payload = JSON.parse(await readStdin());
const env = loadEnv();
const model = payload.model ?? env.OPENROUTER_SPEECH_MODEL;
const voice = payload.voice ?? env.DEFAULT_VOICE_ID;
const result = await new OpenRouterSpeechModel(apiKey()).synthesize({
  model,
  voice,
  text: payload.text,
  responseFormat: payload.responseFormat,
});
writeFileSync(payload.out, result.audio);
process.stdout.write(
  JSON.stringify({
    out: payload.out,
    format: result.format,
    voice,
    model,
    bytes: result.byteLength,
    characters: result.characters,
  }) + "\n",
);

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}
