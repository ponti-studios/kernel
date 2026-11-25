#!/usr/bin/env python3
"""Parse chatgpt-share*.md transcripts into turns.jsonl (deterministic, no LLM).
Strips: YAML frontmatter (kept as metadata), source boilerplate, ChatGPT citation
junk tokens. Keeps every turn verbatim otherwise.
Flags per turn: word_count, likely_pasted (user turn >300 words = imported draft,
not a spontaneous prompt)."""
import argparse, json, os, re

CITE = re.compile(r'\ue200cite\ue202[^\ue201]*\ue201')  # cite...
TURN = re.compile(r'\n## (User|Assistant)\n')

def parse(path):
    raw = open(path, encoding='utf-8', errors='replace').read()
    meta = {}
    m = re.match(r'^---\n(.*?)\n---\n', raw, re.S)
    if m:
        for line in m.group(1).splitlines():
            if ': ' in line:
                k, v = line.split(': ', 1); meta[k.strip()] = v.strip()
        raw = raw[m.end():]
    src = re.search(r'Source: (https://chatgpt\.com/share/\S+)', raw)
    title = re.search(r'^# (.+)$', raw, re.M)
    parts = TURN.split(raw)
    turns, idx = [], 0
    for i in range(1, len(parts), 2):
        role, body = parts[i], (parts[i+1] if i+1 < len(parts) else '')
        body = CITE.sub('', body).strip()
        body = re.sub(r'\n---\s*$', '', body).strip()
        if not body: continue
        idx += 1
        wc = len(body.split())
        turns.append({
            'turn': idx, 'role': role.lower(), 'words': wc,
            'likely_pasted': bool(role == 'User' and wc > 300),
            'text': body,
        })
    return {
        'file': os.path.basename(path).split('__', 1)[-1],
        'title': title.group(1) if title else meta.get('title', ''),
        'source': src.group(1) if src else None,
        'slug': meta.get('slug'), 'updated': meta.get('updated'),
        'turns': turns,
    }

ap = argparse.ArgumentParser(description=__doc__)
ap.add_argument('files', nargs='+', help='chatgpt-share markdown exports')
ap.add_argument('--out', required=True, help='output directory for turns.jsonl and user-turns-only.md')
args = ap.parse_args()
files = sorted(args.files)
outdir = args.out; os.makedirs(outdir, exist_ok=True)
all_turns, user_md = [], []
for f in files:
    d = parse(f)
    all_turns += [{**{k: d[k] for k in ('file','title','source')}, **t} for t in d['turns']]
    user_md.append(f"# {d['title']}  ({d['file']})")
    user_md += [t['text'] for t in d['turns'] if t['role'] == 'user']
    u = sum(t['words'] for t in d['turns'] if t['role'] == 'user')
    a = sum(t['words'] for t in d['turns'] if t['role'] == 'assistant')
    p = sum(1 for t in d['turns'] if t['likely_pasted'])
    print(f"{d['file']}: {len(d['turns'])} turns | user {u:,}w assistant {a:,}w | pasted user turns: {p}")

with open(f'{outdir}/turns.jsonl', 'w') as fh:
    for t in all_turns: fh.write(json.dumps(t, ensure_ascii=False) + '\n')
open(f'{outdir}/user-turns-only.md', 'w').write('\n\n---\n\n'.join(user_md))
print(f"\nWrote {len(all_turns)} turns -> {outdir}/turns.jsonl")
