#!/usr/bin/env bun
/**
 * Fetch a Gemini share conversation and write it as a verbatim markdown file.
 *
 * Usage:
 *   bun pull_gemini_share.ts <share_url> [--out <path>] [--quiet]
 *
 * Gemini share pages are fully client-rendered: the transcript is NOT in the
 * static HTML. It is fetched by the Angular app via Google's internal
 * `batchexecute` RPC after the page boots, so a real browser is required.
 * This script uses Playwright to:
 *
 *   1. Load the share URL in headless Chromium and wait for the app to render.
 *   2. Extract every turn from the rendered DOM: each turn lives in a
 *      `.share-turn-viewer` container with a user query (`.query-text`) and a
 *      model response (`.message-content`).
 *   3. Write a markdown file with `## User` / `## Assistant` headings and the
 *      conversation title.
 *
 * Requires `playwright` (npm) with Chromium installed.
 */
import { chromium, type Browser, type Page } from "playwright";

interface Turn {
  q: string;
  r: string;
}

interface ShareView {
  title: string;
  turns: Turn[];
}

function arg(name: string, def: string | null): string | null {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

const quiet = process.argv.includes("--quiet");
const url = process.argv[2];
const outArg = arg("--out", null);

async function main(): Promise<void> {
  if (!url || !/share\.gemini\.google/.test(url)) {
    console.error(
      "usage: bun pull_gemini_share.ts <https://share.gemini.google/...> [--out path] [--quiet]",
    );
    process.exit(1);
  }
  if (!quiet) console.error(`Opening ${url} in headless Chromium ...`);

  let browser: Browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (e) {
    console.error(
      "ERROR: could not launch Chromium. Install playwright's browser: `npx playwright install chromium`",
    );
    process.exit(1);
  }

  const ctx = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  });
  const page: Page = await ctx.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForSelector(".share-turn-viewer", { timeout: 30000 });
  } catch (e) {
    console.error(
      "ERROR: share page did not render (network blocked or structure changed): " +
        (e as Error).message,
    );
    await browser.close();
    process.exit(1);
  }
  await page.waitForTimeout(1500);

  const data: ShareView = await page.evaluate(() => {
    const titleEl =
      document.querySelector<HTMLElement>('[data-test-id="share-title"]') ||
      document.querySelector<HTMLElement>("h1");
    const rawTitle = titleEl ? titleEl.innerText : "Gemini Conversation";
    const title = rawTitle.split("\n")[0].trim();
    const turns: Turn[] = [];
    document.querySelectorAll<HTMLElement>(".share-turn-viewer").forEach((tv) => {
      const qEl = tv.querySelector<HTMLElement>(".query-text");
      const rEl = tv.querySelector<HTMLElement>(".message-content");
      let q = qEl ? qEl.innerText : "";
      q = q.replace(/^\s*You said\s*/, "").trim();
      const r = rEl ? rEl.innerText.trim() : "";
      if (q || r) turns.push({ q, r });
    });
    return { title, turns };
  });

  await browser.close();

  if (data.turns.length === 0) {
    console.error("ERROR: no turns extracted from the rendered page");
    process.exit(1);
  }

  const safe =
    data.title.replace(/[^\w\- ]+/g, "").trim() || "Gemini Conversation";
  const outPath = outArg ?? `Gemini Share - ${safe}.md`;

  const lines = [
    `# ${data.title}`,
    "",
    `> Source: ${url}`,
    ">",
    "> Conversation transcript, verbatim.",
    "",
    "---",
    "",
  ];
  for (const t of data.turns) {
    lines.push("## User", "", t.q, "", "## Assistant", "", t.r, "");
  }
  Bun.write(outPath, lines.join("\n"));
  if (!quiet) console.error(`Wrote ${data.turns.length} turns -> ${outPath}`);
}

main();