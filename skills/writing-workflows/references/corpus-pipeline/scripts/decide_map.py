#!/usr/bin/env python3
"""Apply Wyatt's decisions (Chase's delegation, 'you choose', Oct 16, 2026)
to the core-essays map: 2 splits, 1 thesis reassignment, drawer resolution.
Renumber, re-verify coverage (essays + parked + killed == 331 theses),
and regenerate files/core-essays-map.md + final-essays.json.
"""
import json, collections, os

HERE = os.path.expanduser(os.environ.get('CORPUS_DATA', '~/Documents/wiki/writing/pipeline/essay-map'))
BATCH = {b: json.load(open(os.path.join(HERE, f'batch-{b}.json'))) for b in 'ABCDE'}
TH = {t['name']: t for b in 'ABCDE' for t in BATCH[b]}
final = json.load(open(os.path.join(HERE, 'final-essays.json')))

def sums(names):
    return (sum(TH[n]['claims'] for n in names),
            sum(TH[n]['files'] for n in names),
            sum(TH[n]['keep_essays'] for n in names))

def anchors_for(names, topn=3):
    c = collections.Counter()
    for n in names:
        for f, k in TH[n]['top_files']:
            c[f] += k
    return [f for f, _ in c.most_common(topn)]

def recompute(e):
    e['claims'], e['files'], e['keep_essays'] = sums(e['theses'])
    e['anchors'] = anchors_for(e['theses'])
    return e

def by_title(t):
    return next(e for e in final if e['title'] == t)

def append_note(e, text):
    e['notes'] = (e['notes'].rstrip() + ' ' + text) if e['notes'] else text

DEC = " (Wyatt, on Chase's delegation, Oct 16, 2026)"

# --- 1. Reassignment: two Hollywood theses, Followers -> Streaming
fol = by_title('Followers Are Not Customers')
stm = by_title('The Math That Broke Streaming')
move = ['The streaming war never cleared household arithmetic', 'Nobody calls bullshit on Hollywood']
for m in move:
    fol['theses'].remove(m)
    stm['theses'].append(m)
recompute(fol); recompute(stm)
append_note(fol, f"REASSIGNMENT{DEC}: its two Hollywood theses moved to 'The Math That Broke Streaming', where they are core argument rather than case study. What remains is the pure creator-economics essay: pricing architecture, the ego business, the habitual customer.")
append_note(stm, f"REASSIGNMENT{DEC}: absorbed the two Hollywood theses from 'Followers Are Not Customers' (household arithmetic; nobody calls bullshit).")

# --- 2. Split: The Consumer Is the Final Boss -> + Audience Capture
con = by_title('The Consumer Is the Final Boss')
demand = ['Media consumers want validation', 'The consumer is the final boss',
          'Attention is the fixed pie', 'Stories let us accumulate experience without paying its price',
          'Reality TV is a selection pressure', 'Making what the audience is already asking for',
          'People say they want depth but their clicks say otherwise']
supply = ['The best content compounds', 'Audience capture',
          'Good advertising is rare, precise, and well-timed',
          'Cinema sells a verified person, not a placement', 'Attention arbitrage',
          'Do It Together, not Do It Yourself']
assert sorted(demand + supply) == sorted(con['theses'])
con['theses'] = demand
con['position'] = ("The consumer is the final boss: attention is a fixed pie, clicks reveal what statements deny, "
                   "and audiences buy validation and borrowed experience — creators, advertisers and studios survive "
                   "only by obeying that revealed demand.")
con['notes'] = (f"SPLIT{DEC}: the supply-side material moved to 'Audience Capture'. This essay is demand only — "
                "what audiences actually want, measured by what they do, not what they say.")
recompute(con)
aud = {'n': 0, 'family': con['family'], 'title': 'Audience Capture',
       'position': ("Makers don't serve audiences — they serve the feedback audiences leave behind. Audience capture "
                    "is the slow corrosion of making what the loop rewards; the escapes are work that compounds, "
                    "advertising that's rare and precise, and attention bought where the market misprices it."),
       'theses': supply, 'claims': 0, 'files': 0, 'keep_essays': 0, 'anchors': [],
       'notes': (f"SPLIT from 'The Consumer Is the Final Boss'{DEC}: that essay states what audiences reveal; this one "
                 "is what the feedback loop does to the people making things. 'Do It Together, not Do It Yourself' is "
                 "the weakest member (5 claims) and the first cut if the essay runs long."),
       'origin': 'B-split'}
recompute(aud)
final.insert(final.index(con) + 1, aud)

# --- 3. Split: Equality Is a Conditional Weapon -> + Minimum Viable Morality
eq = by_title('Equality Is a Conditional Weapon')
wing = ['Minimum Viable Morality', 'Malice and mental illness']
for w in wing:
    eq['theses'].remove(w)
eq['notes'] = (f"SPLIT{DEC}: the morality wing stands as its own essay, 'Minimum Viable Morality'. "
               "What remains here is the power argument pure.")
recompute(eq)
mvm = {'n': 0, 'family': eq['family'], 'title': 'Minimum Viable Morality',
       'position': ("There is a minimum viable morality — the smallest set of shared prohibitions strangers need in "
                    "order to cooperate — and confusing malice with mental illness breaks both justice and mercy, "
                    "because the two demand opposite responses."),
       'theses': wing, 'claims': 0, 'files': 0, 'keep_essays': 0, 'anchors': [],
       'notes': (f"SPLIT from 'Equality Is a Conditional Weapon'{DEC}, whose own notes flagged this wing as the natural "
                 "split candidate. 28 claims across two theses; the malice/mental-illness distinction is the "
                 "prescriptive movement."),
       'origin': 'C-split'}
recompute(mvm)
final.insert(final.index(eq) + 1, mvm)

# --- 4. Drawer resolution: Adaptation stands alone; fragments parked/killed
ad = by_title('Adaptation Mistaken for Progress')
ad['theses'] = ['Adaptation mistaken for progress']
ad['position'] = ("Much of modern economic life is adaptation mistaken for progress — households work more hours to "
                  "hold lifestyles earlier generations reached with less, and the adaptation gets narrated as advancement.")
ad['notes'] = (f"DRAWER RESOLVED{DEC}: stands on its title thesis alone. Thin on extracted claims (8) because claim "
               "extraction capped at 8 per file — single-file positions read thinner than they are. The drawer's other "
               "fragments were parked or killed; see the appendix.")
recompute(ad)
parked = [
    {'thesis': 'Too many near-identical plans produce fatigue', 'claims': TH['Too many near-identical plans produce fatigue']['claims'],
     'reason': 'A real observation (insurance choice fatigue) at 2 claims — a paragraph, not an essay. Parked, not deleted.'},
    {'thesis': 'Health works by maintainability and homeostasis', 'claims': TH['Health works by maintainability and homeostasis']['claims'],
     'reason': 'A principle at 2 claims with no developed argument in the vault. Parked.'},
]
killed = [
    {'thesis': 'Pick the rendering pattern for the job', 'claims': TH['Pick the rendering pattern for the job']['claims'],
     'reason': 'Pure reference material (0 keep-verdict files, none of it in Chase\'s own words) — imported guidance, not a position. Killed from the canon.'},
]

# --- Renumber within family order, verify
FAM_ORDER = ['The mind and the machine', 'The self', 'Belief, status and media',
             'Incentives, institutions and markets', 'Work, society and human nature',
             'Housing, money and taste']
ordered = []
for fam in FAM_ORDER:
    ordered += [e for e in final if e['family'] == fam]
assert len(ordered) == len(final)
for i, e in enumerate(ordered, 1):
    e['n'] = i
final = ordered

all_names = [t for e in final for t in e['theses']] + [p['thesis'] for p in parked] + [k['thesis'] for k in killed]
canon = [t['name'] for b in 'ABCDE' for t in BATCH[b]]
cnt = collections.Counter(all_names)
assert len(all_names) == len(canon) == 331 and all(v == 1 for v in cnt.values()) and set(all_names) == set(canon)
total = sum(e['claims'] for e in final) + sum(p['claims'] for p in parked) + sum(k['claims'] for k in killed)
assert total == 3419, total
print(f'VERIFIED: {len(final)} essays + {len(parked)} parked + {len(killed)} killed = 331 theses, {total} claims')

json.dump({'essays': final, 'parked': parked, 'killed': killed},
          open(os.path.join(HERE, 'final-essays.json'), 'w'), indent=1)
NUM = {e['title']: e['n'] for e in final}
def num(t): return NUM[t]
LOVE_N = next(e['n'] for e in final if e['title'].startswith('Love Burns Steady'))

L = []
L.append('# The Core Essays — a map of the vault, condensed')
L.append('')
L.append("**Status: DECIDED (Oct 16, 2026) — Chase delegated the open calls ('you choose'); Wyatt's decisions are logged below and stand unless vetoed.**")
L.append('')
L.append('The contention: hundreds of notes, the same ideas restated for years, some of them no longer believed. This map is the condensation target — the core essays the vault collapses into, each one a single position arguable in 3,000–4,000 words.')
L.append('')
L.append(f"How it was built: 850+ notes -> 4,887 extracted claims -> 331 clustered theses -> **{len(final)} essays**, plus 2 parked fragments and 1 killed reference item. Five grouping passes (one per territory cluster) merged theses that restate the same position; a cross-batch pass merged duplicates the territory split had separated; a decision pass (below) split two oversized essays and fixed one boundary. Coverage is machine-verified: all 331 theses appear exactly once across essays, parked, and killed; all 3,419 clustered claims are accounted for.")
L.append('')
L.append('## What happens next')
L.append('')
L.append("Veto or adjust any decision by essay number; anything unmentioned stands. Drafting then runs one essay at a time in Chase's voice from the source notes — and correcting a draft is the adjudication: the corrected essay becomes the record of what he believes. (Two rulings already made, Oct 16, are baked in: the generative-model essay carries the amended premise — same architecture, differences are lived experience, 'the RLHF' — and trauma is defined as overfitting, the clinical definition folded into it.)")
L.append('')
L.append("## Decision log (Wyatt, on Chase's delegation)")
L.append('')
L.append(f"1. **Merges stand**: 'Beliefs Are Costumes' + 'Opinions Are Uniforms' = essay {num('Beliefs Are Costumes')}; 'Cheap Credit Makes the Billionaires' + 'Capital With Nowhere to Go' = essay {num('Cheap Credit Makes the Billionaires')}. The same positions had been grouped twice in different territories.")
L.append(f"2. **All four flagged pairs kept separate** — they are cousins, not duplicates: {num('The Salmon Tax')} 'The Salmon Tax' (the concrete coinage: price as product, taste as taught obedience) vs {num('Luxury Is the Purchase of Meaning')} 'Luxury Is the Purchase of Meaning' (the abstract theory, with Chase's first-order refusal inside it); {num('The Brain Is a Forward-Moving Sentence')} (narrative as mechanism) vs {num('We Tell Ourselves Stories to Live')} (narrative as identity); {LOVE_N} (intimate scale) vs {num('Trust Is Built Through Behavior')} (social scale).")
L.append(f"3. **Boundary fixed instead of a merge**: 'Followers Are Not Customers' ({num('Followers Are Not Customers')}) kept its creator-economics core, but its two Hollywood theses moved to 'The Math That Broke Streaming' ({num('The Math That Broke Streaming')}), where they are core argument rather than case study.")
L.append(f"4. **Two splits**: 'The Consumer Is the Final Boss' ({num('The Consumer Is the Final Boss')}, was 118 claims) split into demand ({num('The Consumer Is the Final Boss')}) and supply — 'Audience Capture' ({num('Audience Capture')}), what the feedback loop does to makers. 'Equality Is a Conditional Weapon' ({num('Equality Is a Conditional Weapon')}, was 97 claims) shed its morality wing as 'Minimum Viable Morality' ({num('Minimum Viable Morality')}).")
L.append(f"5. **Not split**: 'Authenticity Is a Byproduct' ({num('Authenticity Is a Byproduct')}) — its two sub-arguments are joined by the claim that selfhood and value are both relational byproducts; that join IS the essay.")
L.append(f"6. **Fragments drawer resolved**: 'Adaptation Mistaken for Progress' ({num('Adaptation Mistaken for Progress')}) stands as an essay on its title thesis; two fragments parked and one reference item killed (appendix).")
L.append(f"7. **The count is {len(final)}, not ~50** — and it went UP by two net. The reason: two essays were each carrying two essays' worth of material (118 and 97 claims), while none of the four candidate pairs turned out to be the same position stated twice. Chase's ~50 was the right order of magnitude; forcing it exactly would have meant merging distinct arguments or splitting none of the oversized ones.")
L.append('')
L.append('## The canon')
for fam in FAM_ORDER:
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
L.append(f"**Coverage.** 331/331 theses accounted for exactly once: {sum(len(e['theses']) for e in final)} in the {len(final)} essays, 2 parked, 1 killed. 3,419 clustered claims totalled.")
L.append('')
L.append('**Parked fragments** (real material, below essay scale — not deleted, available if an essay ever wants them):')
for p in parked:
    L.append(f"- '{p['thesis']}' ({p['claims']} claims) — {p['reason']}")
L.append('')
L.append('**Killed**:')
for k in killed:
    L.append(f"- '{k['thesis']}' ({k['claims']} claims) — {k['reason']}")
L.append('')
L.append('**The residue.** 1,468 of the 4,887 claims were never clustered into theses. Their largest sources are technical working notes (API design, TypeScript performance, testing) and the tails of files that are otherwise clustered — not a hidden second canon. A few small documents sit entirely outside the theses (an identity-system note, a time-complexity note, a real-estate matching note); they read as working documents, not essays, and are deliberately not in the map.')
L.append('')
L.append('**Relation to NT01.** Essays 1–5 (the generative model, the context window, the hallucination engine, the forward-moving sentence, lossy compression) are the old NT01 core, in order. If Next Token issues happen, they assemble finished essays from this canon; nothing is drafted for the magazine ahead of the essays themselves.')
L.append('')
L.append(f"**Already written.** Several of these essays exist in near-finished form in Chase's existing corpus — the anchor files listed per essay are the strongest sources, and keep-verdict counts show how much finished material each essay already has (e.g. the agent-architecture essays behind #{num('The Model Is Only the Engine')}, the LLM-architecture essays behind #{next(e['n'] for e in final if e['title'].startswith('LLMs Won'))}). Drafting those is consolidation and updating, not writing from zero.")

out = os.path.join(HERE, 'core-essays-map.md')
open(out, 'w').write('\n'.join(L) + '\n')
print('map regenerated:', os.path.abspath(out))
print('numbers:', {t: NUM[t] for t in ['Beliefs Are Costumes', 'Cheap Credit Makes the Billionaires', 'Audience Capture', 'Minimum Viable Morality', 'Followers Are Not Customers', 'The Math That Broke Streaming', 'Adaptation Mistaken for Progress']})
