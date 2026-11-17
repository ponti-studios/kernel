#!/usr/bin/env node
// One utterance, one audio file, one ledger event. The speech entrypoint for every
// studio tool, including tower-bridge, which calls it once per turn.
//
// stdin:  {"text": "...", "out": "/path/file.mp3", "voice": "Despina", "model": "...", "responseFormat": "pcm"}
//         model, voice and responseFormat are optional; they default to the
//         configured speech model and DEFAULT_VOICE_ID.
// stdout: {"out", "format", "voice", "model", "bytes", "characters", "ledger", "sha256"}
// stderr: {"error": {"code", "message"}} and exit 1 on any failure.
import { apiKey, loadEnv } from "./lib/config.mjs";
import { speak } from "./lib/speak.mjs";

main().catch((error) => {
  const code = error?.code ?? "unexpected";
  process.stderr.write(JSON.stringify({ error: { code, message: error?.message ?? String(error) } }) + "\n");
  process.exitCode = 1;
});

async function main() {
  const payload = JSON.parse(await readStdin());
  const env = loadEnv();
  let key;
  try {
    key = apiKey();
  } catch (cause) {
    throw Object.assign(new Error(cause.message), { code: "config" });
  }
  const result = await speak(payload, {
    apiKey: key,
    defaults: { model: env.OPENROUTER_SPEECH_MODEL, voice: env.DEFAULT_VOICE_ID },
  });
  process.stdout.write(JSON.stringify(result) + "\n");
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
