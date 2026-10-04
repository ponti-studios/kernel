#!/usr/bin/env bun
/**
 * Fetch a ChatGPT share conversation and write it as a verbatim markdown file.
 *
 * Usage:
 *   bun pull_chatgpt_share.ts <share_url> [--out <path>] [--quiet]
 *
 * The share page is a React Server Components (RSC) page. The conversation is
 * embedded in a streamed payload delivered through
 * `window.__reactRouterContext.streamController.enqueue(...)` calls. The payload
 * is React's "flight" model format: a flat array of reference-encoded values.
 * This script:
 *
 *   1. Fetches the share URL HTML.
 *   2. Extracts every `streamController.enqueue(...)` argument.
 *   3. Unescapes and concatenates them into one JSON array.
 *   4. Resolves the reference-encoded models (each `"_<key>": <idx>` entry maps
 *      a property name at index <key> to a property value at index <idx>).
 *   5. Walks `serverResponse.data.linear_conversation` in order and extracts the
 *      visible user/assistant text turns.
 *   6. Writes a markdown file with `## User` / `## Assistant` headings.
 *
 * Output defaults to `<vault>/ChatGPT Share - <title>.md` (title sanitized).
 * Only text content parts are included; hidden/system/tool/reasoning nodes are
 * skipped. The transcript is written verbatim (no paraphrasing).
 */

const ENQUEUE_RE = /streamController\.enqueue\(/g;

interface Turn {
  role: "user" | "assistant";
  text: string;
}

interface ShareData {
  title?: string;
  linear_conversation: unknown[];
}

async function fetchHtml(url: string): Promise<string> {
  const resp = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  return resp.text();
}

/**
 * Return the largest fully-formed flight-model chunk passed to enqueue().
 *
 * A share page may contain several streamController.enqueue(...) calls (the
 * main flight payload plus small trailing RSC fragments). Each raw argument is
 * a JSON string literal holding a JSON array of reference-encoded models. We
 * unescape every chunk and keep the largest array that contains valid models
 * (it holds the full conversation).
 */
function extractPayload(html: string): string {
  let best: { len: number; arr: unknown[] } | null = null;
  let m: RegExpExecArray | null;
  let lastIdx = 0;
  while ((m = ENQUEUE_RE.exec(html)) !== null) {
    const start = m.index + m[0].length;
    let depth = 1;
    let j = start;
    let inStr = false;
    let esc = false;
    while (j < html.length) {
      const c = html[j];
      if (inStr) {
        if (esc) esc = false;
        else if (c === "\\") esc = true;
        else if (c === '"') inStr = false;
      } else {
        if (c === '"') inStr = true;
        else if (c === "(") depth++;
        else if (c === ")") {
          depth--;
          if (depth === 0) break;
        }
      }
      j++;
    }
    lastIdx = j;
    const raw = html.slice(start, j);
    try {
      const arr = JSON.parse(JSON.parse(raw)) as unknown;
      if (Array.isArray(arr) && (best === null || arr.length > best.len)) {
        best = { len: arr.length, arr };
      }
    } catch {
      // malformed chunk — skip it
    }
  }
  if (best === null) {
    throw new Error(
      "no valid flight payload chunk found in streamController.enqueue calls",
    );
  }
  return JSON.stringify(best.arr);
}

/** Decode the RSC flight model array (reference-encoded). */
function resolveModels(payload: string): unknown {
  const data = JSON.parse(payload) as unknown[];
  const placeholder = Symbol("placeholder");
  const memo = new Map<number, unknown>();

  function resolve(x: unknown): unknown {
    if (typeof x === "number") {
      if (memo.has(x)) {
        const v = memo.get(x);
        return v === placeholder ? undefined : v;
      }
      if (x < 0) {
        memo.set(x, undefined);
        return undefined;
      }
      memo.set(x, placeholder);
      const res = _res(data[x]);
      memo.set(x, res);
      return res;
    }
    return _res(x);
  }

  function _res(x: unknown): unknown {
    if (Array.isArray(x)) return x.map(resolve);
    if (x !== null && typeof x === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(x as Record<string, unknown>)) {
        if (k.startsWith("_")) {
          const name = resolve(Number(k.slice(1)));
          if (name === undefined || name === null || name === "") continue;
          out[String(name)] = resolve(v);
        } else {
          out[k] = v;
        }
      }
      return out;
    }
    return x;
  }

  return resolve(0);
}

function getShareData(root: unknown): ShareData {
  const r = root as {
    loaderData: { "routes/share.$shareId.($action)": { serverResponse: { data: ShareData } } };
  };
  return r.loaderData["routes/share.$shareId.($action)"].serverResponse.data;
}

/** Return ordered (role, text) turns from linear_conversation. */
function extractTurns(share: ShareData): Turn[] {
  const turns: Turn[] = [];
  for (const node of share.linear_conversation) {
    const n = node as {
      message?: {
        author?: { role?: string };
        metadata?: { is_visually_hidden_from_conversation?: boolean };
        content?: { parts?: unknown[] };
      };
    };
    const msg = n.message;
    if (!msg) continue;
    const role = msg.author?.role;
    if (role !== "user" && role !== "assistant") continue;
    if (msg.metadata?.is_visually_hidden_from_conversation) continue;
    const parts = msg.content?.parts ?? [];
    let text = "";
    for (const part of parts) {
      if (typeof part === "string") text += part;
      else if (part !== null && typeof part === "object") {
        text += (part as { text?: string }).text ?? "";
      }
    }
    if (text.trim()) turns.push({ role, text });
  }
  return turns;
}

function sanitize(title: string): string {
  return title.replace(/[^\w\- ]+/g, "").trim();
}

function writeMarkdown(turns: Turn[], title: string, shareUrl: string, outPath: string): void {
  const lines = [
    `# ${title}`,
    "",
    `> Source: ${shareUrl}`,
    ">",
    "> Full conversation transcript, verbatim.",
    "",
    "---",
    "",
  ];
  for (const t of turns) {
    lines.push(t.role === "user" ? "## User" : "## Assistant");
    lines.push("");
    lines.push(t.text);
    lines.push("");
  }
  Bun.write(outPath, lines.join("\n"));
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const url = args[0];
  const outIdx = args.indexOf("--out");
  const outArg = outIdx >= 0 ? args[outIdx + 1] : undefined;
  const quiet = args.includes("--quiet");

  if (!url) {
    console.error(
      "usage: bun pull_chatgpt_share.ts <share_url> [--out path] [--quiet]",
    );
    process.exit(1);
  }

  if (!quiet) console.error(`Fetching ${url} ...`);
  const html = await fetchHtml(url);

  let payload: string;
  try {
    payload = extractPayload(html);
  } catch (e) {
    console.error(`ERROR: ${(e as Error).message}`);
    process.exit(1);
  }

  const root = resolveModels(payload);
  const share = getShareData(root);
  const title = share.title ?? "ChatGPT Conversation";
  const turns = extractTurns(share);
  if (turns.length === 0) {
    console.error("ERROR: no user/assistant text turns found");
    process.exit(1);
  }

  const outPath = outArg ?? `ChatGPT Share - ${sanitize(title)}.md`;
  writeMarkdown(turns, title, url, outPath);
  if (!quiet) console.error(`Wrote ${turns.length} turns -> ${outPath}`);
}

main();