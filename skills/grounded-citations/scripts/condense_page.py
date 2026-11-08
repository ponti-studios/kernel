#!/usr/bin/env python3
"""Fetch or read a page and print keyword-centred windows of its text.

Use when a page is too long to read whole, or when an extraction backend is
unavailable (a search-only backend cannot return page bodies). Prints the total
stripped length so you know what you are not seeing, plus a window around each
keyword hit. Save the full text before quoting from it verbatim.

Usage:
  condense_page.py <url> [--keyword K]... [--window 300] [--hits 4] [--save PATH]
  condense_page.py --file page.txt [--keyword K]...
  cat page.txt | condense_page.py --no-strip --keyword K

  url / --file     http(s) URL to fetch with urllib, or text already on disk
                   (for a JS-rendered page, read document.body.innerText through
                   the browser tool, write it out, then pass --file)
  --keyword        case-insensitive substring to centre windows on; repeatable
  --window         characters of context each side (default 300)
  --hits           max windows per keyword (default 4)
  --save           write the full stripped text here
  --no-strip       treat input as plain text instead of stripping HTML
"""
from __future__ import annotations

import argparse
import html
import re
import sys
import urllib.request

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Version/17.0 Safari/605.1.15"
)


def strip_html(text: str) -> str:
    text = re.sub(r"(?is)<(script|style|svg|nav|footer|noscript)[^>]*>.*?</\1>", " ", text)
    text = re.sub(r"(?s)<[^>]+>", " ", text)
    text = html.unescape(text)
    return re.sub(r"[ \t\xa0]+", " ", text)


def fetch(url: str, timeout: int = 30) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en"})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        return response.read().decode(charset, errors="ignore")


def windows(text: str, keyword: str, size: int, limit: int) -> list[str]:
    found: list[str] = []
    lowered = text.lower()
    start = 0
    while len(found) < limit:
        index = lowered.find(keyword.lower(), start)
        if index < 0:
            break
        snippet = text[max(0, index - size) : index + size]
        found.append(re.sub(r"\s+", " ", snippet).strip())
        start = index + len(keyword)
    return found


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("url", nargs="?")
    parser.add_argument("--file")
    parser.add_argument("--keyword", action="append", default=[])
    parser.add_argument("--window", type=int, default=300)
    parser.add_argument("--hits", type=int, default=4)
    parser.add_argument("--save")
    parser.add_argument("--no-strip", action="store_true")
    args = parser.parse_args()

    if args.file:
        with open(args.file, errors="ignore") as handle:
            raw = handle.read()
    elif args.url:
        try:
            raw = fetch(args.url)
        except Exception as exc:  # network, DNS, TLS, 4xx/5xx
            print(f"fetch failed: {exc}", file=sys.stderr)
            return 1
    else:
        raw = sys.stdin.read()

    text = raw if args.no_strip else strip_html(raw)
    label = args.url or args.file or "stdin"

    if args.save:
        with open(args.save, "w") as handle:
            handle.write(text)
        print(f"saved {len(text)} chars to {args.save}", file=sys.stderr)

    print(f"=== {label} | {len(text)} chars after stripping ===")

    if not args.keyword:
        print(re.sub(r"\s+", " ", text[:1200]).strip())
        return 0

    for keyword in args.keyword:
        hits = windows(text, keyword, args.window, args.hits)
        if not hits:
            print(f"\n-- no match: {keyword}")
            continue
        print(f"\n-- {keyword} ({len(hits)} window(s))")
        for hit in hits:
            print(f"  • {hit}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
