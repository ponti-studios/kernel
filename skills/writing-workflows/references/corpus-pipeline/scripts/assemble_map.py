#!/usr/bin/env python3
"""Assemble the core-essays map from the five batch cluster files.
Applies the two cross-batch merges, assigns families + final numbering,
verifies coverage against the 331 theses, and writes:
  - final-essays.json (machine-readable canon proposal)
  - ../../files/core-essays-map.md (the document the owner approves)
Essay numbers in the prose are computed from the final ordering, never hardcoded.
"""
import json, collections, os

if not os.environ.get('CORPUS_DATA'):
    raise SystemExit('error: set CORPUS_DATA to the essay-map data directory')
HERE = os.path.expanduser(os.environ['CORPUS_DATA'])
BATCH = {b: json.load(open(os.path.join(HERE, f'batch-{b}.json'))) for b in 'ABCDE'}
CLUST = {b: json.load(open(os.path.join(HERE, f'clusters-{b}.json'))) for b in 'ABCDE'}
THESIS_BY_NAME = {t['name']: t for b in 'ABCDE' for t in BATCH[b]}

def anchors_for(thesis_names, topn=3):
    c = collections.Counter()
    for n in thesis_names:
        for f, k in THESIS_BY_NAME[n]['top_files']:
            c[f] += k
    return [f for f, _ in c.most_common(topn)]

def find(batch, title):
    for e in CLUST[batch]:
        if e['title'] == title:
            return e
    raise KeyError(title)

def merged(base, other, title, position, note):
    theses = base['theses'] + other['theses']
    return {
        'title': title, 'position': position, 'theses': theses,
        'claims': base['claims'] + other['claims'],
        'files': base['files'] + other['files'],
        'keep_essays': base['keep_essays'] + other['keep_essays'],
        'anchors': anchors_for(theses), 'notes': note,
        'origin': f"{base['_origin']}+{other['_origin']}",
    }

for b in 'ABCDE':
    for e in CLUST[b]:
        e['_origin'] = b

m1 = merged(
    find('B', 'Beliefs Are Costumes'), find('D', 'Opinions Are Uniforms'),
    'Beliefs Are Costumes',
    "Beliefs and morals are tribal equipment — costumes worn to signal membership, buy belonging, and hold the group together — and argument is only the tail the wiring wags afterward; minds change when the social cost of the outfit changes, not when the argument improves.",
    "CROSS-BATCH MERGE (the editor, Oct 16): batch B's 'Beliefs Are Costumes' and batch D's 'Opinions Are Uniforms' were the same position grouped twice — costumes/uniforms/status-repair (B) and cohesion/currency/in-out-group/belonging-over-truth (D) are the signal and the machinery of one claim, sharing anchor files. Largest claim pool in the canon; the draft will have to select hard. Natural seam if the owner wants two: 'the costume' (signal, defence, rhetoric) vs 'the wiring' (mechanism, cohesion). Its prescriptive counterpart stays separate: 'Beliefs Are Tools, Not Identities'.",
)
m2 = merged(
    find('E', 'Cheap Credit Makes the Billionaires'), find('C', 'Capital With Nowhere to Go'),
    'Cheap Credit Makes the Billionaires',
    "The economy doesn't lack money, it lacks productive places to put it: cheap credit inflates paper fortunes while capital curdles into rent and gambling, so taxing billionaires attacks the shadow while the dam keeps rising — real wealth is the ability to create, and living standards wait on productivity.",
    "CROSS-BATCH MERGE (the editor, Oct 16): batch E's credit-conditions chain (cheap credit -> valuations -> paper fortunes -> misdirected tax politics, closed by the ZIRP reversal) and batch C's saturation cluster (idle capital, trapped system, structural saturation, crypto as terminal case) are one monetary argument at two altitudes. 'Structural saturation' is the darkest member claim and could anchor its own essay later if the owner wants it split back out.",
)

A = CLUST['A']
B = [m1] + [e for e in CLUST['B'] if e['title'] != 'Beliefs Are Costumes']
C = [e for e in CLUST['C'] if e['title'] != 'Capital With Nowhere to Go']
ci = [e['title'] for e in C].index('Scarcity Migrates')
C = C[:ci + 1] + [m2] + C[ci + 1:]
D = [e for e in CLUST['D'] if e['title'] != 'Opinions Are Uniforms']
E = [e for e in CLUST['E'] if e['title'] != 'Cheap Credit Makes the Billionaires']

FAMILIES = [
    ('The mind and the machine', A[:10]),
    ('The self', A[10:]),
    ('Belief, status and media', B),
    ('Incentives, institutions and markets', C),
    ('Work, society and human nature', D),
    ('Housing, money and taste', E),
]

final = []
n = 0
for fam, essays in FAMILIES:
    for e in essays:
        n += 1
        final.append({
            'n': n, 'family': fam, 'title': e['title'], 'position': e['position'],
            'theses': e['theses'], 'claims': e['claims'], 'files': e['files'],
            'keep_essays': e['keep_essays'], 'anchors': e['anchors'],
            'notes': e['notes'], 'origin': e.get('_origin', e.get('origin', '')),
        })

all_names = [t for e in final for t in e['theses']]
canon = [t['name'] for b in 'ABCDE' for t in BATCH[b]]
cnt = collections.Counter(all_names)
assert len(all_names) == len(canon) == 331, (len(all_names), len(canon))
assert all(v == 1 for v in cnt.values()), [k for k, v in cnt.items() if v != 1]
assert set(all_names) == set(canon)
total_claims = sum(e['claims'] for e in final)
assert total_claims == 3419, total_claims
print(f'VERIFIED: {len(final)} essays, 331/331 theses exactly once, {total_claims} claims')

json.dump(final, open(os.path.join(HERE, 'final-essays.json'), 'w'), indent=1)

NUM = {e['title']: e['n'] for e in final}
def num(title):
    return NUM[title]
LOVE_N = next(e['n'] for e in final if e['title'].startswith('Love Burns Steady'))
AGI_N = next(e['n'] for e in final if e['title'].startswith('LLMs Won'))

L = []
L.append('# The Core Essays — a map of the vault, condensed')
L.append('')
L.append("**Status: PROPOSAL, awaiting the owner's approval (Oct 16, 2026).**")
L.append('')
L.append('The contention: hundreds of notes, the same ideas restated for years, some of them no longer believed. This map is the condensation target — the core essays the vault collapses into, each one a single position arguable in 3,000–4,000 words.')
L.append('')
L.append('How it was built: 850+ notes -> 4,887 extracted claims -> 331 clustered theses -> **57 proposed essays**. Five grouping passes (one per territory cluster) merged theses that restate the same position; a final cross-batch pass merged the pairs the territory split had separated. Coverage is machine-verified: all 331 theses appear exactly once; all 3,419 clustered claims are accounted for.')
L.append('')
L.append('## How to approve')
L.append('')
L.append("Reply by number: merge 12+30, split 41, kill 57, retitle 8. Anything unmentioned is approved as drawn. After approval, drafting runs one essay at a time in the owner's voice from the source notes — and correcting a draft is the adjudication: the corrected essay becomes the record of what he believes. (Two rulings already made, Oct 16, are baked in: the generative-model essay carries the amended premise — same architecture, differences are lived experience, 'the RLHF' — and trauma is defined as overfitting, the clinical definition folded into it.)")
L.append('')
L.append('## Decisions already made in this pass (veto any of them)')
L.append('')
L.append(f"1. **'Beliefs Are Costumes' + 'Opinions Are Uniforms' merged** into essay {num('Beliefs Are Costumes')}. Two territory passes had grouped the same position twice — beliefs/morals as tribal uniform, signal and cohesion machinery, argument as post-hoc tail. Its prescriptive flip side, 'Beliefs Are Tools, Not Identities' ({num('Beliefs Are Tools, Not Identities')}), stays separate.")
L.append(f"2. **'Cheap Credit Makes the Billionaires' + 'Capital With Nowhere to Go' merged** into essay {num('Cheap Credit Makes the Billionaires')}. One monetary argument at two altitudes: cheap credit manufacturing paper fortunes, and saturated capital with no productive home.")
L.append('')
L.append('## Calls left open for the owner')
L.append('')
L.append(f"- **Pairs not merged** (merge any, and the count drops): {num('Followers Are Not Customers')} 'Followers Are Not Customers' shares its Hollywood material with {num('The Math That Broke Streaming')} 'The Math That Broke Streaming' — a boundary question, not a duplicate; {num('The Salmon Tax')} 'The Salmon Tax' (luxury as status signal) vs {num('Luxury Is the Purchase of Meaning')} 'Luxury Is the Purchase of Meaning' (luxury as meaning) — cousins, kept apart; {num('The Brain Is a Forward-Moving Sentence')} 'The Brain Is a Forward-Moving Sentence' (narrative mechanism) vs {num('We Tell Ourselves Stories to Live')} 'We Tell Ourselves Stories to Live' (narrative identity) — same family, different scale; {LOVE_N} 'Love Burns Steady' vs {num('Trust Is Built Through Behavior')} 'Trust Is Built Through Behavior' — relationships at two scales.")
L.append(f"- **Splits on the table**: {num('The Consumer Is the Final Boss')} 'The Consumer Is the Final Boss' (the largest media essay — its audience-capture material splits out cleanly); {num('Equality Is a Conditional Weapon')} 'Equality Is a Conditional Weapon' (its morality wing — Minimum Viable Morality, malice/mental illness — could stand alone); {num('Authenticity Is a Byproduct')} 'Authenticity Is a Byproduct' (two sub-arguments joined by a relational claim).")
L.append(f"- **Essay {num('Adaptation Mistaken for Progress')} is a fragments drawer**, not a full position — one real essay ('Adaptation Mistaken for Progress') plus parked fragments, including one pure-reference item. Kill it outright if the fragments aren't worth keeping.")
L.append("- **The count**: the owner estimated ~50. The honest count is 57. The gap is exactly the calls above — merging the four flagged pairs and killing the drawer lands at 52; the splits push the other way. No padding was added to hit a number.")
L.append('')
L.append('## The canon')
for fam, _ in FAMILIES:
    essays = [e for e in final if e['family'] == fam]
    L.append('')
    L.append(f'### {fam} ({len(essays)})')
    for e in essays:
        L.append('')
        L.append(f"**{e['n']}. {e['title']}**")
        L.append(f"{e['position']}")
        L.append(f"- {len(e['theses'])} theses · {e['claims']} claims · {e['files']} source-file refs · {e['keep_essays']} keep-verdict files · anchors: {', '.join(e['anchors'])}")
        L.append(f"- Theses: {'; '.join(e['theses'])}")
        if e['notes']:
            L.append(f"- Note: {e['notes']}")
L.append('')
L.append('## Appendix')
L.append('')
L.append('**Coverage.** 331/331 theses assigned exactly once; 3,419 clustered claims totalled across the 57 essays. Per-batch passes each self-verified before the cross-batch pass ran.')
L.append('')
L.append('**The residue.** 1,468 of the 4,887 claims were never clustered into theses. Their largest sources are technical working notes (API design, TypeScript performance, testing) and the tails of files that are otherwise clustered — not a hidden second canon. A few small documents sit entirely outside the theses (an identity-system note, a time-complexity note, a real-estate matching note); they read as working documents, not essays, and are deliberately not in the map.')
L.append('')
L.append('**Relation to NT01.** Essays 1–5 (the generative model, the context window, the hallucination engine, the forward-moving sentence, lossy compression) are the old NT01 core, in order. If Next Token issues happen, they assemble finished essays from this canon; nothing is drafted for the magazine ahead of the essays themselves.')
L.append('')
L.append(f"**Already written.** Several of these essays exist in near-finished form in the owner's existing corpus — the anchor files listed per essay are the strongest sources, and keep-verdict counts show how much finished material each essay already has (e.g. the agent-architecture essays behind #{num('The Model Is Only the Engine')}, the LLM-architecture essays behind #{AGI_N}). Drafting those is consolidation and updating, not writing from zero.")

out = os.path.join(HERE, 'core-essays-map.md')
open(out, 'w').write('\n'.join(L) + '\n')
print('map written:', os.path.abspath(out), f'({len(final)} essays)')
print('key numbers:', {t: NUM[t] for t in ['Beliefs Are Costumes', 'Cheap Credit Makes the Billionaires', 'The Consumer Is the Final Boss', 'Adaptation Mistaken for Progress']})
