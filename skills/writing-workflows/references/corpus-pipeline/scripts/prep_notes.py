#!/usr/bin/env python3
"""Stage 1 prep: body-only metrics for root notes. Frontmatter STRIPPED (untrusted);
only the filename is identity. Detects transcript format and near-duplicate text pairs."""
import argparse, json, re, os, glob
from collections import defaultdict
ap=argparse.ArgumentParser(description=__doc__)
ap.add_argument('--manifest', required=True, help='notes manifest JSON (list of {id, name, _path})')
ap.add_argument('--mirror', required=True, help='directory holding the exported note files')
ap.add_argument('--out', required=True, help='pilot output directory (gets notes.jsonl and bodies/)')
args=ap.parse_args()
man=json.load(open(args.manifest))
root=[f for f in man if len(f['_path'].split('/'))==2]
mirror=args.mirror
def local(fid):
    g=glob.glob(os.path.join(mirror, fid+"__*"))
    if g: return g[0]
    # some mirror files have no id prefix (downloaded in first pass under plain name)
    return None
recs=[]
for f in root:
    p=local(f['id'])
    if not p:
        cand=os.path.join(mirror, f['name'])
        p=cand if os.path.exists(cand) else None
    if not p: print("MISSING", f['name']); continue
    raw=open(p,encoding='utf-8',errors='replace').read()
    m=re.match(r'^---\n.*?\n---\n', raw, re.S)
    body=raw[m.end():] if m else raw
    lines=[l for l in body.splitlines() if l.strip()]
    bullets=sum(1 for l in lines if l.strip().startswith(('- ','* ','• ')))
    heads=[l.strip().lstrip('# ').strip() for l in lines if l.startswith('#')]
    words=len(body.split())
    transcript = ('## User' in body and '## Assistant' in body)
    recs.append({'file':f['name'],'local_path':p,'words':words,'lines':len(lines),
                 'bullet_frac':round(bullets/max(len(lines),1),3),'headings':len(heads),
                 'first_heading':heads[0] if heads else None,'transcript':transcript,
                 'body':body})
# near-dup text pairs via 5-word shingles (same method as census)
def shingles(t): 
    w=re.findall(r"[a-z0-9']+", t.lower()); return set(tuple(w[i:i+5]) for i in range(max(0,len(w)-4)))
sh=[shingles(r['body']) for r in recs]
idx=defaultdict(list)
for i,s in enumerate(sh):
    for x in s: idx[x].append(i)
from collections import Counter
shared=Counter()
for x,lst in idx.items():
    if len(lst)>8: continue
    for a in range(len(lst)):
        for b in range(a+1,len(lst)): shared[(lst[a],lst[b])]+=1
dups=defaultdict(list)
for (i,j),n in shared.items():
    u=len(sh[i]|sh[j]); jac=n/u if u else 0
    if jac>=0.15:
        dups[recs[i]['file']].append({'file':recs[j]['file'],'jaccard':round(jac,2)})
        dups[recs[j]['file']].append({'file':recs[i]['file'],'jaccard':round(jac,2)})
out=[]
for r in recs:
    r=dict(r); body=r.pop('body')
    r['text_dup_links']=dups.get(r['file'],[])
    out.append(r)
os.makedirs(args.out, exist_ok=True)
with open(os.path.join(args.out,'notes.jsonl'),'w') as fh:
    for r in out: fh.write(json.dumps(r,ensure_ascii=False)+'\n')
# also write body-only copies for batch workers
bdir=os.path.join(args.out,'bodies'); os.makedirs(bdir, exist_ok=True)
for f,r in zip(root,recs): pass
for f in root:
    p=local(f['id']) or os.path.join(mirror,f['name'])
    raw=open(p,encoding='utf-8',errors='replace').read()
    m=re.match(r'^---\n.*?\n---\n', raw, re.S)
    open(os.path.join(bdir,f['name']),'w').write(raw[m.end():] if m else raw)
print(f"prepped {len(out)} notes; transcripts: {sum(1 for r in out if r['transcript'])}; dup-linked files: {sum(1 for r in out if r['text_dup_links'])}")
