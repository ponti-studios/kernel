#!/usr/bin/env python3
"""Merge all claims* files in vault-parse/out into a single claims.jsonl.
Dedup by normalized statement (claims-all wins). ID collisions: the claims-all
row keeps the bare ID; side-pass rows are renamed '<id>--sd' etc. and tagged
with merged_from. Verifies: row count, unique IDs, unique statements, every
source statement survives, thesis claim_id -> statement integrity.
Usage: merge_claims.py <claims-dir>. Reads and writes inside that directory;
writes claims.merged.jsonl (caller moves it).
"""
import json, os, re, collections, sys

if len(sys.argv) != 2:
    sys.exit('usage: merge_claims.py <claims-dir>')
os.chdir(sys.argv[1])

def norm(s): return re.sub(r'\s+', ' ', s.strip().lower())

PRIO = {'claims-all.jsonl': 0, 'claims-status-disruption.jsonl': 1,
        'claims-orphan-6a7a2ef1.jsonl': 2, 'claims.jsonl': 3}
FILES = list(PRIO)

groups, order, src_stmts = {}, [], {}
for f in FILES:
    rows = [json.loads(l) for l in open(f) if l.strip()]
    src_stmts[f] = set(norm(r['statement']) for r in rows)
    for r in rows:
        k = norm(r['statement'])
        if k not in groups:
            groups[k] = (PRIO[f], r, f); order.append(k)
        elif PRIO[f] < groups[k][0]:
            groups[k] = (PRIO[f], r, f)

base = src_stmts['claims-all.jsonl']
survivors = []
for k in order:
    prio, row, src = groups[k]
    row = dict(row)
    if k not in base:
        row['merged_from'] = src
    survivors.append(row)

# Resolve ID collisions: claims-all-origin rows keep bare IDs (they carry no
# merged_from or merged_from == claims-all); rename later copies.
seen = {}
for row in survivors:
    rid = row['id']
    if rid not in seen:
        seen[rid] = row
    else:
        suffix = '--sd' if 'status-disruption' in row.get('merged_from', '') else '--x'
        new = rid + suffix
        assert new not in seen, new
        print(f'RENAME {rid} -> {new} :: {row["statement"][:80]}')
        row['id'] = new
        seen[new] = row

out_rows = survivors
# Order: claims-all original order first, then additions in merge order.
all_rows = [json.loads(l) for l in open('claims-all.jsonl') if l.strip()]
all_ids_in_order = [r['id'] for r in all_rows]
by_id = {r['id']: r for r in out_rows}
ordered = [by_id[i] for i in all_ids_in_order] + [r for r in out_rows if r.get('merged_from')]
assert len(ordered) == len(out_rows)

with open('claims.merged.jsonl', 'w') as fh:
    for r in ordered:
        fh.write(json.dumps(r, ensure_ascii=False) + '\n')

# ---- Verification on the written file
rows = [json.loads(l) for l in open('claims.merged.jsonl') if l.strip()]
ids = [r['id'] for r in rows]
stmts = set(norm(r['statement']) for r in rows)
assert len(rows) == len(set(ids)), 'duplicate IDs'
assert len(stmts) == len(rows), 'duplicate statements'
for f, ss in src_stmts.items():
    assert ss <= stmts, f'{f} lost statements'
theses = [json.loads(l) for l in open('theses.jsonl')]
all_by_id = {r['id']: r for r in all_rows}
checked = 0
for t in theses:
    for cid in t['claim_ids']:
        assert cid in by_id, f'thesis claim id missing: {cid}'
        assert norm(by_id[cid]['statement']) == norm(all_by_id[cid]['statement']), f'statement changed for {cid}'
        checked += 1
adds = [r for r in rows if r.get('merged_from')]
print(f'VERIFIED: {len(rows)} rows, IDs unique, statements unique')
print(f'  additions beyond claims-all: {len(adds)} (from: {collections.Counter(r["merged_from"] for r in adds)})')
print(f'  thesis claim_id integrity: {checked} references OK')
