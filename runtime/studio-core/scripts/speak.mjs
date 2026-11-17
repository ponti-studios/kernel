#!/usr/bin/env node
// One utterance, one audio file. The single speech entrypoint for every studio
// tool, including tower-bridge, which calls it once per turn.
//
// stdin:  {"text": "...", "out": "/path/file.mp3", "voice": "Despina", "model": "...", "responseFormat": "pcm"}
//         model, voice and responseFormat are optional; they default to the
//         configured speech model and DEFAULT_VOICE_ID.
// stdout: {"out", "format", "voice", "model", "bytes", "characters"}
// stderr: {"error": {"code", "message"}} and exit 1 on any failure.
import { writeFileSync } from "node:fs";
import { apiKey, loadEnv } from "./lib/config.mjs";
import { OpenRouterSpeechModel, checkVoice } from "./lib/speech.mjs";

main().catch((error) => {
  const code = error?.code ?? "unexpected";
  process.stderr.write(JSON.stringify({ error: { code, message: error?.message ?? String(error) } }) + "\n");
  process.exitCode = 1;
});

async function main() {
  const payload = JSON.parse(await readStdin());
  if (!payload.out) throw usage("out is required");
  if (payload.responseFormat === "pcm" && !/\.pcm$/i.test(payload.out)) {
    throw usage("responseFormat pcm writes raw PCM; give it a .pcm path");
  }
  const env = loadEnv();
  const model = payload.model ?? env.OPENROUTER_SPEECH_MODEL;
  const voice = payload.voice ?? env.DEFAULT_VOICE_ID;
  checkVoice(model, voice);
  let key;
  try {
    key = apiKey();
  } catch (cause) {
    throw Object.assign(new Error(cause.message), { code: "config" });
  }
  const result = await new OpenRouterSpeechModel(key).synthesize({
    model,
    voice,
    text: payload.text ?? "",
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
}

function usage(message) {
  const error = new Error(message);
  error.code = "usage";
  return error;
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}
