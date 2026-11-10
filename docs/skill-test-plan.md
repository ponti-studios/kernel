# Skill test plan — per-element breakdown

Source: read of every unchecked skill's `SKILL.md` + `references/` + `scripts/` on 2026-11-09.
Companion: `docs/skill-test-status.md` (checklist). Check off there as each item passes here.

Tiers: **H** = hermetic/local/$0 · **L** = live account/network · **$** = spends money · **J** = judgment-only.
`recipes/`, `references/`, `scripts/` paths are relative to `skills/<name>/`.

## Workflows

### design-workflows [H]
- Entrypoints: `references/kernel-design/WORKFLOW.md`, `references/kernel-animate/WORKFLOW.md`, `references/brand-asset-sourcing/WORKFLOW.md`.
- Test: `scripts/contrast.py`, `validate_contrast.py`, `validate_tokens.py`, `lint_hardcodes.py`, `design_systems.py` against `tokens/` fixtures (positive + negative hardcoded-hex fixture); brand-asset 8-step: inventory strings → resolve → download → `logos.json` manifest → `xml.dom.minidom` parse SVGs + raster ≥64px check.
- Prereqs: `python3` only (+ `git/curl` + network for brand-asset).
- Pass: validators exit 0 on good fixtures, non-zero on bad; `logos.json` covers 100% raw strings; all SVGs parse.
- Blockers: animate/design taste is human judgment; brand-asset needs network + real brand source.

### engineering-workflows [H+L]
- Entrypoints: 23 `WORKFLOW.md` (`kernel-dev-*`, `kernel-audit-*`, `project-quality-gates`, `dependabot-batch`, `pr-comments`, `native-ios-builder`, `kernel-ops-ship`, `agent-knowledge-loops`, …).
- Test: quality-gates tiers (`tsc --noEmit`, `oxlint`, `oxfmt`, `vitest`, `knip`, `shellcheck`, `ruff`, `gitleaks`, `osv-scanner`, `semgrep`, `lychee`, `playwright`) with planted-violation probe (fake `ghp_` token must go red→green); `references/kernel-dev-database/scripts/pull-hominem-schema.sh` dry-run; `native-ios-builder`: `xcodebuild test -destination simulator`.
- Prereqs: `node/pnpm`, `python3`, `docker`, `git/gh`, quality-gate CLIs; iOS needs Xcode + simulator; DB needs staging creds (never prod).
- Pass: gates green locally, CI mirrors local order, planted violation caught; DB types regenerate with no diff; simulator tests exit 0.
- Blockers: needs real target repos; device-only claims unverifiable without hardware; most procedures are audit checklists.

### security-workflows [J]
- Entrypoints: `references/kernel-audit-security/WORKFLOW.md` (11 review modes + `audit-methodology/`: Recon→Hunt→Validate→Report→`findings.json`→reconcile), `references/kernel-audit-integration-security/WORKFLOW.md`.
- Test: zero bundled scripts — checklist audit on a seeded-vuln fixture repo: every finding has `file:line` + concrete exploit ("send X, get Y") + likelihood×impact; `findings.json` validates against `templates/` schema; integration fixture (`@latest` CDN + wildcard CSP) must fail, pinned+SRI must pass.
- Prereqs: target codebase; optional `gitleaks`, `osv-scanner`/`npm audit`, semgrep.
- Pass: ≥N known seeded findings with valid refs + repro steps; schema validates exit 0; zero LOW-padding.
- Blockers: entirely LLM-judgment, no oracle; full exploit validation needs auth scope.

### studio-workflows [$+H]
- Entrypoints: 12 `WORKFLOW.md` (`studio-universe`, `studio-imagegen`, `studio-upscale`, `image-transparent`, `studio-mediagen`, `studio-podcastgen`, `studio-ledger`, `film-production`, `image-model-craft`, `programmatic-video`, `kernel-ops-production`, `project-operations`).
- Test (free, hermetic first): `studio-universe/scripts/check-fixtures.sh` → "9 byte-exact, 0 failed"; `test.sh` exit 0; `compile-frame.sh <spec> --out /tmp/x.prompt.txt` byte-identical to `test/fixtures/expected/`; refusal exits 1/2 with named field. Ledger: `cli.mjs emit|asset|index|report|verify|backfill|gc|reprice` round-trip (delete + rebuild identical). Imagegen/podcastgen/mediagen: `--dry-run` / `check-*.sh` exit 0 with $0 spend. `image-transparent`: `pytest tests/test_remove_background.py`; corners alpha 0 / centre 255, overwrite refused. `upscale.py`: output dims = `--outscale 2`.
- Prereqs: Node 24; `OPENROUTER_API_KEY`, `STUDIO_UNIVERSE_ROOT`, `STUDIO_INBOX`, `STUDIO_USAGE_DIR`; `ffmpeg/ffprobe`; rembg venv + model weights; upscale external venv + `weights/*.pth`.
- Pass: universe byte-exact; ledger `verify` pure function of JSONL; dry-runs print prompt hash + cost upper bound with no spend; episode mp3 duration = Σsegments + gap×(n−1).
- Blockers: any non-dry-run image/speech/video spends real money (~$0.018/image 2K, ~$0.084/s video); weights are GBs; quality assertions are dimensional/file-based only.

### writing-workflows [H partial — `llm-structured-extraction` tested]
- Entrypoints: 18 `WORKFLOW.md` (`write-docs`, `essay`, `write-video-script`, `write-brief`, `write-incident-report`, `phrase-audit`, `plan-to-tasks`, `workshop-design`, `studio-script|scenes|clips|social|video|documents`, `interface-copy`, …).
- Test: `phrase-audit/scripts/phrase-audit/` — `uv run --group dev pytest` exit 0; CLI on fixture corpus emits top n-grams/openers/rollups, `--json` parses; `write-docs/scripts/check_frontmatter.py` exit 0 on valid docs, non-zero on bad keys/enums/links. Studio generators: schema validation dry-run exit 0.
- Prereqs: `uv` + `uv sync --group dev`; Node + `OPENROUTER_API_KEY` for generators.
- Pass: pytest green; JSON outputs parse; frontmatter gate rejects correctly.
- Blockers: essay/brief/incident/workshop are taste checklists (human-judged); generators cost small $ and are non-deterministic.

## Project tools

### ai-video-production [H+$]
- Test: `ffprobe` duration math (`ceil((measured+0.5)*2)/2`); `ffmpeg -af apad` pad + concat; `silencedetect=noise=-35dB:d=0.25` alignment check; `curl openrouter.ai/api/v1/videos/models` schema (`supported_durations`, `supported_frame_images`, `pricing_skus`); SigV4 presign vs `aws s3 presign` differential; frame-0/last-frame RMSE anchoring.
- Prereqs: `ffmpeg/ffprobe`, `OPENROUTER_API_KEY`, R2 creds, `aws` CLI.
- Pass: numeric duration; models JSON has listed fields; signatures match; cost printed before submit.
- Blockers: no key → provider check untestable; full e2e ~$3–9; `frame_images` needs public HTTPS URL.

### apple-notes [L]
- Test: `memo notes`, `-f`, `-s` (seeded note found), `-ex`, `-a`, `-e`, `-d`, `-m`; export produces HTML/Markdown.
- Prereqs: macOS + Notes.app, `antoniorodr/memo` tap, Automation grant, `$EDITOR`.
- Pass: list/search exit 0 with expected note; export file parses.
- Blockers: Linux/CI untestable; interactive flags hang without pty; attachments not editable.

### apple-reminders [L]
- Test: `remindctl status|list|today --json|week --json|overdue`; write round-trip in disposable list: create → `--json` shows correct `dueDate`+`alarmDate` → edit → complete → delete list.
- Prereqs: macOS + Reminders.app, `steipete/tap/remindctl`, `remindctl authorize`.
- Pass: `status` exit 0; JSON date formats (`today`, `YYYY-MM-DD HH:mm`, ISO8601) parse.
- Blockers: macOS-only; permission dialog blocks CI; mutates real iCloud lists — use disposable list + cleanup.

### architecture-diagram [H]
- Test: `templates/template.html` parses; generated file: single `.html`, inline CSS/SVG, `grep -c "<script"` == 0; palette hexes (`#22d3ee` `#34d399` `#a78bfa` `#fbbf24` `#fb7185` `#fb9238` `#94a3b8`); masking-pair dedupe; text-in-box (`getBBox`); legend-y > max-boundary+20; arrows before rects in document order.
- Prereqs: none (browser for visual; python/node for assertions; Google Fonts needs network).
- Pass: opens offline and renders; geometry assertions hold.
- Blockers: spacing aesthetics manual; text-overflow needs browser `getBBox`; no bundled validator.

### arxiv [L]
- Test: `python3 scripts/search_arxiv.py "GRPO reinforcement learning" --max 5`; `--author`, `--category cs.AI --sort date`, `--id 2402.03300`; raw `curl export.arxiv.org/api/query?...`; Semantic Scholar `curl …/paper/arXiv:2402.03300`, `/citations`, `/references`.
- Prereqs: Python 3 stdlib + network to `export.arxiv.org`, `api.semanticscholar.org`.
- Pass: `Found N results`, `ID: … | Published: YYYY-MM-DD`, `Authors:`, `Links: https://arxiv.org/abs/…`; invalid query → `No results found.`
- Blockers: rate limits (~1 req/3s arXiv, 1 req/s S2); live data drifts — assert shape, not titles.

### ascii-video [H]
- Test: `tonemap()` percentile + gamma + `screen` blend; `canvas.mean()>8`; `ema()` smoothing; fixture: 5–10 synthetic frames → ffmpeg pipe → MP4 exists, `ffprobe` shows frames/duration; failure-mode guards (`font.getmetrics` cell height, no `stderr=PIPE` on long ffmpeg, palette blank-check).
- Prereqs: Python 3.10+, `numpy`, `scipy`, `Pillow`, `ffmpeg`; optional `opencv-python`, ElevenLabs key.
- Pass: single test frame renders; output MP4 non-zero + playable; one invented palette/effect/transition present.
- Blockers: no bundled runner — harness must be authored; full renders slow (80–150ms/frame); "cinematic" is subjective.

### asset-and-cost-ledger [H]
- Test: schema — `cost.source ∈ {reported,estimated,unknown}`, `usd=null` counted not summed, retries as separate attempts, `run_id:null` unattributed; SQL probes (spend-by-tool, per-unit cost, provenance join); normaliser rules (`mergeUsage` first-wins, no `??0`); cut-over proof (count old store → cheapest call → count unchanged + `report` shows event).
- Prereqs: Node.js (`node:sqlite`), sibling `studio-ledger` + `ledger-bridge.mjs`, `~/.studio` writable, `$STUDIO_USAGE_DIR`.
- Pass: `emit` appends one JSONL line; `report --json` sums match SQL; `verify` proves index is pure function of JSONL (delete + rebuild identical).
- Blockers: not executable standalone — `studio-ledger` CLI not vendored here; cross-skill relative import breaks in isolated installs.

### baoyu-infographic [$+J]
- Test: all 21 layouts + 21 styles exist; `base-prompt.md` placeholders (`{{LAYOUT}} {{STYLE}} {{ASPECT_RATIO}} {{LANGUAGE}} …`) fully substituted; aspect map (16:9→landscape, 9:16→portrait, 1:1→square); backup rules (`source-backup-*`, `analysis-backup-*`); secret-strip (no API keys in outputs); keyword shortcuts (`高密度信息大图`→dense-modules+portrait).
- Prereqs: `write_file` + `clarify` + `image_generate` tools; network.
- Pass: `prompts/infographic.md` assembles with layout+style text; tree `infographic/<slug>/` matches spec; slug `2-4-word kebab`.
- Blockers: e2e needs paid `image_generate` + human `clarify` answers (mock both); CJK rendering needs human/OCR judgment.

### blocked-page-recovery [L]
- Test: `python3 scripts/recover_page.py "https://example.com/…" --json` → 0 recovered / 1 nothing / 2 bad URL; `--out`, `--timeout`; unit `validate()` rejects `body_too_small`, interstitial titles, redirect-stub-to-origin; route order wayback → archive.today rotation → Jina (skipped without key) → API-first → browser last; never returns Google Cache/AMP stub as success.
- Prereqs: Python 3 + network to `archive.org`, `web.archive.org`, `archive.ph/.md/.li/.is`; optional `JINA_API_KEY`.
- Pass: known-archived URL recovers with `provenance=snapshot` + timestamp; stub fixtures rejected.
- Blockers: archive.today 429s + domain rotation flaky; never-crawled/robots/JS-SPA legitimately unrecoverable (expect exit 1).

### box [L]
- Test: `command -v box`; `node --version` (≥18); `box users:get me --json --fields id,name,login`; `box folders:items 0`; write-verify: smoke folder create → list parent → ID+name match → delete (only if authorized); metadata write → read back field-for-field; report links `https://app.box.com/file|<id>`.
- Prereqs: Node 18+, `@box/cli`, Box account + interactive browser OAuth, Box AI units for AI verbs.
- Pass: `users:get me` returns `{id,name,login}`; fixture round-trips by ID; `--json` parses.
- Blockers: no headless auth (browser sign-in + topology question); destructive ops need approval; PowerShell vs bash quoting.

### ccusage-data-export [L]
- Test: `npx -y ccusage@latest --help`; `daily --json --by-agent`, `monthly --json`, `session --json` → derive `daily.json` (drop `agents`), aggregate `agents.json` (sum `totalCost/totalTokens/...` + session counts); grand totals agree across 4 files; cross-check `ccusage claude daily --json`.
- Prereqs: `npx` + npm network; `ccusage` logs present; Python3; `~/ccusage-export` writable.
- Pass: 4 files exist; `jq` grand totals identical; `agents.json` dates cover `daily[].period`.
- Blockers: no local usage data → empty reports; per-agent schema variance; npx stderr noise unless redirected.

### claude-code [$]
- Test: `claude --version` (v2.x); `claude auth status [--text]` JSON; `claude doctor`; `claude -p 'echo hi' --output-format json --max-turns 1` → `subtype:success`, `num_turns<=max-turns`, `total_cost_usd` present; tmux Mode 2 shows `❯` prompt.
- Prereqs: `npm i -g @anthropic-ai/claude-code`; browser OAuth or `ANTHROPIC_API_KEY` (mandatory for `--bare`); `tmux`; git repo for worktree flags.
- Pass: auth JSON logged-in; print-mode task completes; file edit lands in workdir.
- Blockers: no auth/credits → all exec tests fail (costs money); interactive needs PTY; `--dangerously-skip-permissions` unsafe outside throwaway worktree.

### claude-design [H+J]
- Test: generate `landing-page.html`; `js("document.querySelectorAll('.card').length")`; `getComputedStyle(el).backgroundColor !== transparent` count==0; click `[data-set][data-value]` mutates `document.body.className`; headless Chrome `--screenshot`; `magick identify`, `magick -format mean/stddev` (stddev>~0); `getBoundingClientRect` overlap==0.
- Prereqs: file write + `open`/browser tool; headless Chrome; ImageMagick `magick`; `vision_analyze`.
- Pass: renders with zero console errors; no blank screenshot; no overlaps.
- Blockers: taste/surface choice/slop score are human/vision-model judgments; `rAF/setInterval` throttled headless → false blanks.

### codebase-inspection [H]
- Test: `pygount --format=summary --folders-to-skip=".git,node_modules,venv,..." .`; `--suffix=py`; `--format=json` parses; `rg` export-use counts; `git status --porcelain | grep '^??'`; clone-repro `git archive HEAD | tar -x -C /tmp/fresh`; dead-weight audit: `git ls-files | awk` inventory, `pnpm dlx knip --reporter compact`, remove+`install→typecheck→build→test`.
- Prereqs: `pip` + `pygount`; `rg`, `git`; Node toolchain for build proof.
- Pass: summary lists expected languages; `__empty__/__binary__` rows present; run <30s with skips; JSON valid.
- Blockers: without skips hangs on `node_modules/.git`; knip false positives (route files, Tailwind, CSS `@import`).

### codex [$]
- Test: `codex exec '<prompt>' --sandbox workspace-write` in temp `git init` dir exits 0; `process log` shows progress; `git diff` shows change confined to workdir; background task pollable/killable.
- Prereqs: `npm i -g @openai/codex`; `OPENAI_API_KEY` or `~/.codex/auth.json`; must run inside git repo; `pty=true`; `gh` for PR flows.
- Pass: one-shot exec completes without hang; review outputs findings.
- Blockers: no auth/credits or non-git dir → immediate refusal; hangs without PTY; sandbox `uid map/loopback` failures in gateway contexts.

### competitor-news-monitor [L+J]
- Test: freeze watchlist → `${HOMINEM_HOME:-~/.hominem}/competitor-watches/<slug>.json` has `watchlist/categories/threshold/last cutoff`; tick: collect incrementally, dedupe by event, materiality score, digest-or-silence, cutoff advances only on success; verification checklist (primary-source citation per event, source failures logged as gaps, cutoff advances, replayable scores).
- Prereqs: `web_search/web_extract` (+ optional `rss-feeds`/`blogwatcher`/`reddit-reading`); `cronjob` tool; filesystem state.
- Pass: state JSON valid; each event has citation + appears once.
- Blockers: materiality/dedupe/novelty are judgment — no oracle; needs live web + time; silent-coverage loss if cutoff mishandled.

### computer-use [L]
- Test: `hermes computer-use status/doctor/install`; `computer_use(action="capture" mode=ax app="…")` returns element list; `click(element=N)` returns `{effect:confirmed|unverifiable|suspected_noop, code, verified}`; stale-index refusal after re-capture; `key cmd+s`.
- Prereqs: `cua-driver` pinned under `${HERMES_HOME:-~/.hermes}/tools/cua-driver-*`, socket `~/Library/Caches/cua-driver/cua-driver.sock`, OS AX permissions; real desktop session.
- Pass: `doctor` all-green; capture non-empty; click `confirmed` or verified via fresh capture; no focus steal.
- Blockers: needs live GUI + approvals (password/2FA/payment hard-blocked); headless/SSH → "no on-screen window"; driver version/socket conflicts; Qt/KTextEditor synthetic-key issues.

### design-md [H]
- Test: `npx -y @google/design.md lint templates/starter.md` → exit 0; planted `{{colors.missing}}` ref → `broken-ref` exit 1; low-contrast component → `contrast-ratio` warning; `export --format dtcg|json-tailwind|css-tailwind` valid; `diff DESIGN.md DESIGN-v2.md` exit 1 on regression.
- Prereqs: Node `npx` + npm network (`@google/design.md` CLI 0.3.0).
- Pass: lint exit codes as above; exports parse.
- Blockers: npm fetch latency/version drift; Windows needs `designmd` alias; silent drops (typo'd tokens, unquoted `#` hex).

### docs-curation [H]
- Test: `node scripts/check-doc-links.mjs [root]` → clean tree exit 0 (`all relative markdown links resolve`), broken tree exit 1 with `file:line` + `did you mean …?`; inventory (`wc -l` + `grep '^#'`); `grep -rn deleted-file.md` zero hits post-delete.
- Prereqs: `node`; sample docs tree.
- Pass: sweep exit codes + hint correctness.
- Blockers: classification/relocation judgments manual; regex only matches `](...*.md)` (misses bare URLs).

### document-to-action-items [J+L]
- Test: fixture doc (contract/report/scanned form) with known deadlines: every fact cites `file+page/section`; modality (`may/should/must`) + OCR uncertainty preserved; cross-check totals/terms; proposed actions (`outcome/owner/due/dependency/acceptance/risk/citation`, unknown=`unresolved`); no external write without approval + read-back.
- Prereqs: `pdf`/`docx` (+ OCR for scans), `read_file`/`web_extract`, destination tracker (`notion`/calendar/`xlsx`) creds for step 7.
- Pass: response split facts/proposed/assumptions/blockers; read-back matches.
- Blockers: human approval gate blocks full automation; no ground-truth scorer; legal/medical/tax needs professional review.

### docx [H]
- Test: `python -m pytest tests/ -q`; CLIs `docx_create.py`, `docx_read.py (--text|--structure|--styles|--images|--revisions)`, `docx_edit.py`, `docx_revisions.py (list|accept|reject)`, `docx_comments.py`, `docx_template.py (--strict, unfilled_tokens==[])`, `docx_validate.py` (exit 0/1 + `"ok":true`); round-trips: create→read, replace formatting preserved, normalize fragmented runs.
- Prereqs: Python 3.10+, `python-docx`; optional `soffice` for PDF.
- Pass: read contains expected strings / lacks replaced strings; `--structure` shows headings/tables; `LC_ALL=C PYTHONIOENCODING=utf-8` run clean.
- Blockers: TOC/page-numbers only computed by Word/LibreOffice; style names must exist; numbered-list continuation quirks.

### dogfood [L+J]
- Test: 5-phase on a target URL: plan (output dir + sitemap) → explore (`browser_navigate/snapshot/console/vision/click/type/press/scroll`) → collect (screenshot + repro + severity/category) → categorize (Critical→Low) → report fills `templates/dogfood-report-template.md` with zero unfilled `{placeholders}`, counts sum, issues sorted, screenshot paths resolve, dead-link sweep done.
- Prereqs: browser toolset; target URL + scope; writable output dir.
- Pass: taxonomy conformance (Functional/Visual/Accessibility/Console/UX/Content); console checked after every nav.
- Blockers: live web target flaky; no automation scripts — LLM navigation judgment; responsive coverage subjective.

### email-inbox-triage [J+L]
- Test: fixture threads (JSON/mbox): every thread gets disposition (`urgent reply|reply|action without reply|waiting|reference|noise`) + reason; calibration from 20–50 Sent samples (greeting/signoff/length/formality) or fallback stated; drafts answer all questions, match voice, no invented commitments; approval map unambiguous; provider-confirmed IDs after send/label/archive.
- Prereqs: connector (`himalaya` or `google-workspace`) + mailbox creds/OAuth; Sent access.
- Pass: 6 verification boxes checked; coverage stated; no out-of-batch mutation.
- Blockers: fully judgment-dependent; destructive actions need human approval; `Sent`-naming variants cause false fallback.

### git-history-purge [H]
- Test: throwaway fixture clone with planted secret: 4-surface sweep (tracked/untracked/`log -p --all`/ever-named filenames); rewrite via `filter-repo --invert-paths --path`; verify: `diff <(ls-tree old)|(ls-tree new)` only removed paths, `git log --all -- '*target*'` empty, `git rev-list --objects --all | grep -ci target`=0, `git fsck` clean after `reflog expire+gc`; ref parity (`ls-remote --heads --tags`) matches; worktree `shasum` preserved (local-only path).
- Prereqs: `git`, `git-filter-repo`, `gh`; remote write + force-push rights on fixture only.
- Pass: purge-confirmation trio holds; tag survival; no accidental deletions.
- Blockers: `refs/pull/*` immutable — old objects stay fetchable by SHA (needs GitHub Support GC); branch protection blocks `--force`; foreign worktrees pin old objects.

### google-workspace [L]
- Test: `setup.py --check` (`AUTHENTICATED` vs `NOT_AUTHENTICATED`); `gws_bridge.py` verbs: `gmail search|get|send|reply|labels|modify`, `calendar list|create|delete`, `drive search|get|upload|download|create-folder|share|delete`, `contacts list`, `sheets create|get|update|append`, `docs get|create|append`; JSON contracts (`gmail search→[{id,subject,…}]`, `send→{status:sent,…}`); `--format json` auth flow; `HttpError 403` → re-auth mapping.
- Prereqs: Python + `google-auth-oauthlib google-api-python-client`; Google Cloud OAuth Desktop client + enabled APIs + test user; interactive browser OAuth; token `0600`.
- Pass: `--check` prints `AUTHENTICATED`; reads schema-valid; writes only after confirm + read-back shows Google ID/link; `drive delete` defaults to trash.
- Blockers: no valid test without real Google account + manual OAuth paste; token scope drift needs `--revoke` + full re-auth; quota/rate limits.

### grounded-citations [H]
- Test: `reset→add|ingest→list→render [--style markdown|plain|footnotes|bibtex|evidence]→verify [--strict|--min-coverage|--evidence]` round-trip; id stability / URL normalization; `ingest` JSON extraction; `quote --text --from` rejects paraphrase; `verify` catches unknown IDs / `Sources`-block drift / `>3` cites / coverage threshold; `condense_page.py --keyword --window --hits --save`.
- Prereqs: Python 3 stdlib; ledger `${HOMINEM_HOME:-~/.hominem}/cache/citations/ledger.json` (override `--ledger`); retrieval backend for live URLs.
- Pass: `verify --strict --min-coverage 0.5` exit 0; `--cited-in` lists exactly cited IDs; `--evidence` fails when any cited source lacks quote.
- Blockers: snippet-vs-page confusion; raw/mirror URL vs canonical page; `[unverified]` overuse; parallel subagents colliding IDs without shared `--ledger`.

### himalaya [L]
- Test: `himalaya --version`, per-subcommand `--help`; `folder list`, `envelope list [--folder --page --page-size --output json]`, search query, `message read|export --full`, `template reply|forward|send` (piped non-interactive), `message write -H`, `move|copy|delete`, `flag add|remove`, `attachment download`, `--account`; output JSON parses; MML per `references/message-composition.md`; `RUST_LOG=debug` diagnostics.
- Prereqs: `himalaya` binary (`brew|cargo install`); `~/.config/himalaya/config.toml` (IMAP/SMTP + `auth: raw|cmd|keyring`); Gmail needs App Password + `[Gmail]/Sent Mail` alias mapping.
- Pass: envelope list returns expected IDs; read/export matches server; piped `template send` delivers + saves to Sent; no pre-v1.2.0 singular `folder.alias` form.
- Blockers: live IMAP/SMTP + secrets required; v1.2.0 alias syntax silently ignored → duplicate sends; message IDs folder-relative; interactive paths need pty.

### humanizer [J]
- Test: fixture before/after pairs asserting removal of all 34 flagged tells (em-dashes, `serves as`, `delve/tapestry/landscape`, rule-of-three, `It's not X; it's Y`, bold-header lists, emojis, `Let's dive in`, reassurance kickers, …); voice-calibration adherence (sentence length/diction/punctuation from sample); meaning preservation; anti-AI self-audit emitted (`What makes this obviously AI?` → revise).
- Prereqs: none (optional voice sample inline/file).
- Pass: final rewrite contains zero watchlist instances; reads aloud naturally; tone matches sample.
- Blockers: entirely subjective — no exit codes/schemas; detectors disagree; over-stripping can degrade real prose.

### imessage [L]
- Test: `imsg chats --limit --json`, `imsg history --chat-id --limit --attachments --json`; `imsg send --to --text [--file --service imessage|sms|auto]` after confirm; export: `sqlite3 "file:$HOME/Library/Messages/chat.db?mode=ro" "select count(*) from message;"` → `imsg-export all|export|verify <dir> [--db --no-contacts]`; bidirectional ROWID set-diff (every `message.ROWID` in `messages.jsonl` and back); `manifest.csv` rows = `message_attachment_join` rows; `attributedBody` decode where `text IS NULL`.
- Prereqs: macOS + signed-in Messages.app, `steipete/tap/imsg`, Full Disk Access + Automation, `sqlite3`, `imsg-export`.
- Pass: ID set-diff (not count); text matches DB incl. `attributedBody`; deleted-conversation sends bucketed unattributed; purged blobs disclosed as filename+timestamp-only.
- Blockers: Linux/Windows untestable; FDA denial → silent empty results; no real `chat.db` in CI (use copied `--db` fixture); bulk sends need explicit confirm.

### inspecting-hermes-desktop-dom [L]
- Test: `curl -s --max-time 3 http://127.0.0.1:${HERMES_DESKTOP_CDP_PORT:-9222}/json/version` non-empty; `node scripts/eval.mjs "document.querySelectorAll('[data-slot]').length"`; `CDP.connect({port,match})→cdp.eval→cdp.close()` with `SELECTORS` data-slot hooks (`apps/desktop/scripts/perf/lib/cdp.mjs`); winning-rule read (`className/computedStyle/parent chain`); isolated probe (`HERMES_HOME=…/scratch/cdp-probe-home … npx electron . --user-data-dir=…`).
- Prereqs: Hermes desktop repo checkout (`apps/desktop`); running dev server (`hgui`/`npm run dev`); CDP port open; Node + `npx electron`; separate `HERMES_HOME`/`--user-data-dir`/non-9222 port for probes.
- Pass: version JSON present; eval returns small projected JSON (never whole-DOM dump); winning rule identified before any edit; probe killed after use.
- Blockers: no port in packaged builds; probe with throwaway home has no backend (`ECONNREFUSED hermes:api`); aesthetics explicitly out of scope.

### linear-tickets [L]
- Test: `grep -oE '[A-Za-z_]*linear[A-Za-z_]*=' ~/.localrc` finds key name; GraphQL `teams{nodes{id name key}}` → `issueCreate(input)` → read-back `issues(filter:{number:{eq:N}})` checking `state/priority/project/labels/description`; parked-ticket template (`why/constraint/established/open/not-build/deliverable/links` + `docs/tickets/<slug>.md`); defect 8-section template.
- Prereqs: `LINEAR_API_KEY` (bare `Authorization: <key>`), Linear workspace + `teamId`, network to `api.linear.app`.
- Pass: ticket lands in stated team; unlabelled by default; read-back description length/first-section/last-line identical; labels/project correct.
- Blockers: every test creates real workspace clutter; `agents` label spends money / dispatches workers; no sandbox; never echo key.

### local-services-tailnet [L]
- Test: start daemon via Hermes `terminal(command="…" >/tmp/<name>.log 2>&1, background=true, persist_on_release=true)` + poll; `lsof -nP -iTCP:<port> -sTCP:LISTEN` shows `127.0.0.1:<port>` (not `[::1]`); `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:<port>/<path>` ≠ `000`; `tailscale serve status` → `serve --bg --https=<port> http://127.0.0.1:<port>` → `status` contains mapping (add-only, never `reset`, never Funnel); `curl -sk https://<host>:<port>/` 200-class; 4-item Verification checklist.
- Prereqs: Hermes `terminal` semantics, `tailscale` CLI logged into tailnet, free port, backend service, `lsof/curl`.
- Pass: direct + proxied curl 200-class; `serve status` diff shows add; IPv4 bind confirmed.
- Blockers: plain `nohup/setsid` rejected; IPv6-only default on macOS Node/Python; Host 400 looks like down server; env vars not inherited across terminal calls.

### macos-app-distribution [L+$]
- Test: `scripts/check-signature.sh <app> [team]` exit 0 + `team-anchored: yes`; `scripts/verify-distribution.sh dist/<N>-<v>.dmg` 5 checks (image signed, `source=Notarized Developer ID`, staple on dmg, quarantined-copy `accepted`, staple+`spctl`+OU requirement inside mount); `codesign --verify --strict`, `spctl -a -t open`, `stapler validate`; `gh release download`, live product-page + cache-buster, `PlistBuddy/lipo/spctl/stapler`; Sparkle appcast `CFBundleVersion` stamping.
- Prereqs: macOS + Xcode CLI, paid Apple Developer + `Developer ID Application` cert, `TEAMID`, `notarytool --keychain-profile`, network, `gh`.
- Pass: both scripts exit 0; `spctl` literally `source=Notarized Developer ID` on quarantined dmg; `stapler validate … worked` for dmg + mounted app.
- Blockers: cannot fully test without paid cert + notarization; ad-hoc sigs fool `codesign -dv` but fail grants; `dist/` staleness; private-repo assets 404 for buyers.

### macos-menubar-swift-app [H+L]
- Test: pure unit tests (`action(mode:state:event)`, `StatusIcon`, chord display/rejection, `Retake.candidate`, settings defaults); CLI oracles `--selftest/--transcribe/--devices/--bench/--window/--status-image/--icon`; `swift scripts/window-id.swift <frag>` → `screencapture -l <id>`; `osascript keystroke` hotkey→record→transcribe→clipboard e2e; log greps (`hotkey: key-up received …`, `Failed to match … kTCCService` =0); `afinfo/ffprobe volumedetect` on kept WAV (1ch 16000Hz Int16, not empty-room −67dB nor clipped 0dB).
- Prereqs: macOS + Swift toolchain, mic hardware, TCC Mic/Accessibility grants, Apple Silicon for ANE figures, `whisper-cpp` (dev), FluidAudio model fetch (~100s MB), `say`, `screencapture`.
- Pass: status frame `y≈screenH-24`; WAV spec holds; `--status-image` every state `template=true` centred; window-count `0→1→0` for ⌘,/⌘W; same-identity rebuild keeps grant.
- Blockers: `LSUIElement` invisible to System Events/AX; single-instance bundle routes CLI to running copy; Bluetooth headset steals default input; icon aesthetics need human eye.

### manim-video [H+$]
- Test: `bash scripts/setup.sh` → `All prerequisites satisfied`; `manim -ql script.py Scene1` in 5–15s/scene → `media/videos/script/480p15/*.mp4`; `manim -ql --format=png -s` stills; `ffmpeg -y -f concat -safe 0 -i concat.txt -c copy final.mp4` non-empty; `ffprobe` duration/resolution.
- Prereqs: Python 3.10+, Manim CE ≥0.20, LaTeX (`texlive-full`/`mactex-no-gui`, `pdflatex`), `ffmpeg`; optional ElevenLabs/Qwen3-TTS keys.
- Pass: setup exit 0 all `+`; draft + stitched `final.mp4` playable; stills exist; no LaTeX/Pango errors.
- Blockers: TeXLive GBs often missing; `-qh` 30–120s/scene timeout risk; monospace-only (Pango kerning bug); TTS needs paid keys.

### maps [L]
- Test: `python scripts/maps_client.py search "Statue of Liberty"` → `lat≈40.689 lon≈-74.044`; `nearby --near "Times Square" --category restaurant --limit 3` → `count>0`, `distance_m` sorted, `maps_url/directions_url` present; `distance/directions ORIGIN --to DEST --mode {driving|walking|cycling}` → `code Ok`, `distance_km/duration_minutes`, `steps[].instruction/maneuver`; `reverse`, `timezone`, `area`, `bbox`; all JSON has `data_source`.
- Prereqs: Python 3.8+ stdlib; network to `nominatim.openstreetmap.org`, `overpass-api.de`/`overpass.kumi.systems`, `router.project-osrm.org`, `timeapi.io`.
- Pass: exit 0 JSON, coords in range, `count>0` for known landmarks, OSRM route `Ok`.
- Blockers: network-flaky; Nominatim 1 req/s (script sleeps); Overpass slow at peak; zip-only queries ambiguous.

### meeting-action-items [J+L]
- Test: fixture transcript + mock `notion`/`github-issues`: evidence inventory (title/date/participants/completeness); decisions/proposals/commitments/questions/risks/facts separated with quote/timestamp refs; normalize table (outcome/owner|unresolved/due|unresolved/dependency/acceptance/source); reconcile via connector search (creates vs updates); draft minutes + proposed tickets + follow-up (no publish); apply approved + read-back with provenance marker.
- Prereqs: notes/transcript file; tracker creds for steps 4/6 (else dry-run).
- Pass: 5-item Verification checklist; minutes with decisions + action table + unresolved + checkpoint; assignees/dates/links read back match.
- Blockers: no scripts/fixtures; brainstorm-vs-decision is judgment; approval gate blocks e2e automation; transcript is untrusted data (prompt injection).

### node-service-observability [H]
- Test: boot log has `otel.started/tracer_ready` + `process.version`; `curl 127.0.0.1:PORT/` → 200, no `"level":"error"`; `grep -oE '"event":"otel\.[a-z]+"'`; benchmark JSONL p50/p95/p99 + `store_size`; JSONL `jq` by `event`; Kysely migration ledger row; batch `job_start/step_complete/job_complete` via `appendFileSync`; FTS5 sanitize (`?*"()` → no `fts5: syntax error`).
- Prereqs: Node.js (exact binary on `PATH`), SvelteKit or Node service fixture; optional OTLP key/region; `node:sqlite` (avoid `better-sqlite3` ABI).
- Pass: logs parse as JSONL; warn/error on stderr; one real request proves export-without-error; baseline deltas computed.
- Blockers: no runnable scripts — must scaffold `otel.mjs`/service/benchmark; vendor agent `diagnostics_channel` can abort boot; dual SDK init → double spans.

### notion [L]
- Test: `ntn api v1/users`; `…/search query=…`; read `/markdown` contains heading; create page → GET shows `title`/`Status`; `data_sources/{id}/query` filter returns rows; `ntn files create < png` → id; `workers exec <key> -d '{"name":"world"}'` → `Hello, world!`; curl equivalents with `| jq`.
- Prereqs: `NOTION_API_KEY` (`ntn_`/`secret_`) + `NOTION_API_TOKEN`, `NOTION_KEYRING=0`; pages/DBs shared to integration; `ntn` via `curl ntn.dev|bash` or `npm i -g ntn` (Node22+, macOS/Linux; Windows → curl/WSL2); Workers need Business/Enterprise + credits.
- Pass: HTTP 200 JSON with stable `id`; markdown round-trip byte-identical; `filter Status=Active` correct; `runs logs` shows invocation.
- Blockers: real token + workspace required (writes pollute — use scratch parent); 3 req/s limit; DB view filters UI-only; `ntn` absent on Windows.

### on-device-inference-cost [H]
- Test: `swift build -c release` → `ffmpeg -stream_loop -i real-take.wav -t 60 … take-60.wav` → `<tool> --transcribe` at 60/180/360/600s, linear slope (s per min audio); `live:` lines per pass/absorb + session summary (tick-lateness/snapshot/engine/main-hop/`behind`/absorb/reveal/first-word) + `--replay <file>` at 32000 B/s; A/B mic-record vs file-replay equality; silence-trim before pricing (per `references/audio-silence-trim.md`).
- Prereqs: macOS + Swift release build, `ffmpeg`, real-speech fixture (synthetic underprices ~4.8×), on-device engine (Parakeet/CoreML, ideally ANE), host binary with `--transcribe/--replay`.
- Pass: slope quoted with method (e.g. ~1.4 s/min linear, range not single cell); `behind` reported; attribution matches table.
- Blockers: no scripts/binary in skill — needs external app harness; debug builds (`-Onone`) invalidate numbers; headless replay excludes display path.

### online-shopping [L]
- Test: 7-step on Amazon.co.uk default: search → `browser_exec(js)` extract result cards (`div[data-asin]` loop, ≤15 ASIN/title/price/rating) → open 2–3 shortlist, read buy-box (`desktop_buybox`: price + `In stock` + delivery) → add-to-basket (STOP — never pay/type card) → cart re-read (`[data-name="Active Items"] [data-asin]`, `Basket Subtotal` regex = Σ lines) → report ends "nothing ordered".
- Prereqs: real user browser session; `browser_exec`/`js()` + `goto_url`.
- Pass: shortlist JSON parses; cart lists added ASIN; subtotal arithmetic holds.
- Blockers: live network + logged-in session; bot-wall on manufacturer sites; layout drift; purchase path forbidden.

### openrouter-image-generation [$]
- Test: scripts `or_image_gen.py <out.png> "<prompt>" [model] [aspect] [resolution]` (or `@file.txt`); `GET /api/v1/images/models` enum check; `--dry-run` spends $0; output naming `<YYYYMMDD-HHMMSS>_<model>_<what>.<ext>` + `_index.md`; `sips -g pixelWidth` real-size; negation audit `grep -oiE '\b(no|never|not|none|without|…)\b'`; log line in `~/.hominem/ai_usage/<ts>.json` (model/prompt-sha/elapsed/status/cost/path); edit flow pins→annotated→composite diff; `render_sweep.sh` resume-safe.
- Prereqs: `OPENROUTER_API_KEY`; network; `~/Pictures/imagegen/_inbox` writable; Python stdlib.
- Pass: file exists at quoted path (read back off disk); JSON log with `usage.cost`; pixels match request; cost line reported.
- Blockers: paid + latency (18–178s); provider 400 content-filters (don't bisect, switch model); no-model-judges-image — only params/cost/paths assertable; `google/gemini-3-pro-image` banned.

### p5js [H]
- Test: `node scripts/export-frames.js sketch.html --width 3840 --height 2160 --frames 1` exits 0 + PNG non-empty (needs `noLoop()`+`window._p5Ready`); `bash scripts/render.sh sketch.html out.mp4 --duration 2 --fps 30` produces MP4; `python -m http.server` serves + CDN p5 1.11.3 loads; bindings `keyPressed` s/g/r/space; `p5.disableFriendlyErrors=true` + `pixelDensity(1)` + seeded `randomSeed/noiseSeed`.
- Prereqs: Node + Puppeteer/Chromium, ffmpeg, headless Chrome; CDN network.
- Pass: 60fps interactive / 30fps animated; headless 1:1 frame correspondence (`redraw()` per capture); deterministic re-render same output.
- Blockers: visual excellence subjective; WebGL/font/CORS/mic flake; 2.x vs 1.x API incompatibilities.

### pdf [H]
- Test: `python -m pytest tests/ -q`; every script `--help` + JSON stdout: `pdf_create.py` → `pdf_read.py --meta` page_count; `pdf_read --text/--tables/--fields`; `pdf_merge/split/rotate/compress/watermark/stamp`; `pdf_form_layout.py` exit 0 + `--render-overlay boxes.png`; `pdf_fill_form` → `--fields` exact match; `pdf_secure` → `--meta "encrypted":true`; attachments byte-compare; `xlsx`-style restructure report.
- Prereqs: Python 3.10+, `pypdf reportlab pdfplumber`; optional `pypdfium2`/`pdftoppm` (graceful `{"rendered":false}`), `marker-pdf`/`nano-pdf`.
- Pass: `--help` examples run clean; JSON non-empty with known string/cell; overlay PNG aligned.
- Blockers: scanned PDFs need OCR; borderless-table heuristics; rotated-stamp scramble (use pypdf); compression 0–20% on image PDFs.

### ponti-principles [J]
- Test: review runner on a fixture diff: read full diff → repo checks → open only touched refs → violations as `file:line:rule:fix`; Final checklist 10 boxes (schema validation, ternary lint, unused scan, formatter/lint/typecheck clean, no secrets via grep, tests run with skipped-named); 25 laws spot-check (plan-first/YAGNI/blast-radius, API-owns-logic, mock-before-integrate, price-before-pick).
- Prereqs: repo with `AGENT.md`/lint/type/test tooling; none external.
- Pass: cites real violations only, no praise filler; behavior preserved; report states verified vs unverified.
- Blockers: almost entirely judgment (naming, YAGNI, reuse); no harness; "Charles in the moment wins" on conflicts.

### design-workflows: web-designs procedure [H+J]
- Test: 54 `templates/<site>.md`: each has palette/typography/components/shadows + font `<link>` + Hermes Implementation Notes; generate single HTML (`write_file`) with `:root` custom props + font stack; serve via `generative-widgets` cloudflared tunnel → HTTP 200; `browser_vision` screenshot without missing-font boxes; dashboard uses sidebar/stat-cards not hero.
- Prereqs: browser; Google Fonts CDN; `generative-widgets` + cloudflared; `browser_vision`.
- Pass: rendered page matches template tokens (colors/type/spacing); no AI-slop markers.
- Blockers: proprietary-font substitution loss; verification is human vision; 54 templates can't all be exercised.

### powerpoint [H]
- Test: `python -m pytest tests/ -q`; CLIs JSON round-trips: create → `pptx_read --outline` slide-count/texts/tables/chart values; `--images DIR` sizes; `--replace-text/--move-slide/--set-footer/--set-notes` then re-read; `--render-overlay`/render JSON lists PNGs or `{"rendered":false,"missing":[...]}` exit 0; template `{{token}}` fill — all replaced; duplicate deep-copies rels.
- Prereqs: Python 3.10+ `python-pptx` + pytest; optional `soffice` + `pdftoppm`/`pdftocairo` (graceful degrade).
- Pass: outline matches spec; chart values exact; PNGs show no overlap/truncation.
- Blockers: `.ppt` legacy needs conversion; chart-slide duplication refused by design; footer/hyperlink placeholder limits.

### python-package-release [H]
- Test: `python3 scripts/check_no_pii.py [--denylist]` on fixture with planted phone/email/uuid (exit codes); `curl …/pypi/<name>/json` 404=free; gate trio (`ruff check`, `ruff format --check`, `pytest`); `uv build` + `unzip -l dist/*.whl` non-empty + `uv tool install --force .` + console-script + `python -m <pkg>` both run; `twine check`; hypothesis `decode(encode(x))==x`; `mypy --strict`; coverage `fail_under` 3×; `templates/ci.yml` + `templates/release.yml` shapes (version==tag, `uv publish --trusted-publishing`).
- Prereqs: `uv`, Python matrix, `gh`, `gitleaks` binary, network; PyPI trusted-publisher config is human step; never `pip install`/bare venv.
- Pass: wheel contains package; installed CLI runs outside source tree; scans clean; version==tag.
- Blockers: publishing irreversible + human-gated (agent must not publish); public-leak history still leaves GitHub-dangled objects.

### reference-image-library [H+$]
- Test: `shasum -a 256 a.png b.png`; `compare -metric RMSE a.png b.png null:` (0.00–0.02 same/retouch, ≥0.25 different); `sips -g pixelWidth -g pixelHeight` equality after `magick -strip -quality 92`; existence/resolution sweeps over registry + every spec `references` list (split `+` compounds); `plan.json`/`results.json` per-render append; shuffle-balance `abs(left-n/2)<=1`; WebP ~92% smaller, dims identical.
- Prereqs: macOS `sips`, ImageMagick (`magick`, `compare`), grep/shasum; registry/bibles/specs access; A/B needs image backend + user judge; `git bundle`+rsync backup before bulk moves.
- Pass: duplicate verdict backed by native RMSE + dims (not thumbnails/dHash); existence suite green; A/B reports model/size/cost/sealed mapping, never quality scores; verdict via chat.
- Blockers: no scripts — shell one-liners; paid renders (~$0.26/14-render pass); agent must never pick winner.

### requesting-code-review [H]
- Test: synthetic diffs with planted secret/injection/`eval`: static grep scan (`os.system|shell=True`, `eval|exec`, `pickle.loads`, format-SELECT) exit codes; baseline tests+lint (stash→run→pop; 3–5× for flakes; `gh run list/view`); reviewer JSON `{passed,security_concerns,logic_errors,suggestions,summary}` parses + fail-closed (non-empty concerns→`passed:false`); fix-loop ≤2 cycles with re-verify → commit `[verified]`.
- Prereqs: git repo with staged changes; language toolchain; `delegate_task` (skip Steps 5/7 in one-shot); `gh`.
- Pass: clean baseline + no new failures + `passed:true` → `[verified]`; failures bucketed Security/Logic/Regressions/Lint.
- Blockers: reviewer quality depends on subagent; non-JSON verdict = fail; large diffs need per-file splits.

### sdlc-review [J]
- Test: mocked `kanban_show` (ACs + diff + prior `changes_requested` count): agent selects correct lens/round (R1 cold-read, R2 run+test via `terminal`, R3+ strict audit) and emits exactly one terminal call with `file:line` evidence; 9-box Verification checklist; verdict payload (`review_outcome`, `reviewer_checks`).
- Prereqs: Kanban worker context (`task+run IDs`); `kanban_show/comment/complete/request_changes/block`; `read_file/search_files/terminal`.
- Pass: exactly-one verdict (`complete` / `comment`+`request_changes` / `block`); role separation (no reviewer edits).
- Blockers: untestable standalone — needs Hermes `kanban` toolset/dispatcher; verdict correctness is judgmental.

### seme-development [L+$]
- Test: evals — `node dist/evals/system-eval.js` (26/26), `memory-types-eval.js` (71/71), `kg-eval.js` (21/21), `kg-quality-eval.js` (20/20), `extraction-eval.js` (31/31), `hard-test.js` (15/15), `super-hard-test.js` (17/17), `document-mode-eval.js` (22/4), `npm run test:mcp` (8/8); `curl -w %{http_code} https://seme-api.fly.dev/health`→200, `/entities` no-auth→401, `Authorization: Bearer $(cat ~/.seme-gate-password)`→200; `SCHEMA_VERSION`+checksum consistent.
- Prereqs: separate Seme checkout; Node+`tsx`, `better-sqlite3`, `pdftotext`, `yt-dlp`; Ollama `qwen3-embedding:0.6b`; OpenRouter key (paid); `SEME_STORAGE_DIR`/`~/.hominem/memory.db`; `flyctl`+`gh`; ports 3000/5173/8888.
- Pass: exact eval counts; 401/200 gate matrix holds.
- Blockers: heavy/external — paid LLM, 20–45s async waits, Ollama/GPU, Fly secrets; unrelated Astro/soapbox paths.

### ship-ios [H+L]
- Test: `scripts/test-sourcemap-upload.sh --tools-dir <dsym-upload-tools>` (real `upload-react-native-sourcemap.swift` vs loopback stub; 0 pass / 1 fail / 3 skip); `ship_ios --no-upload` dry run; `ship_newrelic_user_key` rejects non-`NRAK-`/rejects `NRAL`; `doctor_ios`, `booted_sim`, `port_free`; `gh pr view --json state,mergeable,mergeStateStatus,statusCheckRollup`; `shellcheck` on `lib.sh`/`ship-ios.sh`; dirty-tree refusal.
- Prereqs: macOS + Xcode (`xcodebuild/xcrun swift`), repo harness (`scripts/ship.sh`), `gh`, `just`, EAS/Xcode signing, ASC creds, `NRAK-*` in `~/.localrc`.
- Pass: stub saw `Api-Key: NRAK-…`; `--no-upload` produces `SHIP_VERSION/BUILD/ARTIFACT`.
- Blockers: macOS-only; Apple Developer + TestFlight (irreversible upload); builds take minutes–hours; CI Linux only runs `shellcheck`.

### simplify-code [J]
- Test: fixture diff with planted dup util + dead import + N+1: P1 identify (`git diff` variants, >2000-line warn) → P2 fan-out 4 reviewers via `delegate_task` (Reuse/Quality/Efficiency/Altitude + `git blame`) → P3 merge/dedupe (correctness>focus>readability>micro-perf) → apply SAFE→CAREFUL (per-file test)→flag RISKY → verify → summarize; findings as `file:line → problem → cost → fix | confidence | risk`; dry-run mode applies nothing.
- Prereqs: git repo with diff; `delegate_task` batch (else declared inline fallback); target test/lint toolchain.
- Pass: ≥3 findings with evidence + existing-util pointer; SAFE auto-applied; targeted tests green; RISKY only flagged.
- Blockers: no scripts/fixtures; needs 4 subagents (costly, truncates on large diffs); false positives on public-contract renames.

### skill-library-maintenance [H]
- Test: `node scripts/skills_audit.mjs` (+ `--quiet`) → counters `unprovenanced 0, stale 0, collisions 0, drift 0`; seed synthetic drift/collision/stale-lock → audit non-zero with correct bucket → repair → zero; `diff -rq <repo>/skills/<name> ~/.agents/skills/<name>` clean; `python3 scripts/validate_skills.py`; `grep -E 'law [0-9]+|rule [0-9]+'` targets resolve; merge-two-skills renumber map + `npx skills remove/add -g`.
- Prereqs: kernel checkout; `~/.agents/skills/`, `${HOMINEM_HOME:-~/.hominem}/skills`, `~/.agents/.skill-lock.json`; `npx skills`; `node`, `python3`.
- Pass: audit zero + `diff -rq` clean + validator pass post-repair.
- Blockers: mutates user-global library; `-s a,b` `skills remove` bug (must loop); reinstall leaves `extra:` files/symlinks.

### songsee [H]
- Test: `songsee track.mp3 [-o out.png]`; `--viz spectrogram,mel,chroma,hpss,selfsim,loudness,tempogram,mfcc,flux` grid; `--start/--duration` slice; `--style/--width/--height/--window/--hop/--min-freq/--max-freq/--format`; stdin `cat f.mp3 | songsee - --format png -o out.png`; `vision_analyze` inspect.
- Prereqs: `songsee` binary (`go install …/songsee/cmd/songsee@latest`); `ffmpeg` for non-WAV/MP3; fixture audio.
- Pass: exit 0 + output exists/non-empty (all viz values + slice <30s).
- Blockers: binary not vendored; no bundled fixture; image-correctness needs human/`vision_analyze`.

### songwriting-and-ai-music [$+J]
- Test: given brief, output has declared structure (ABABCB/AABA/…), syllable count ±1–2, rhyme scheme labeled, Style formula (Genre+Mood+Era+Instruments+Vocal+Production+Dynamics, journey, ≤1000 chars, zero artist names, BPM/key, Exclude) + metatags (`[Verse]/[Belted]/[Building Energy]/…`, 5–8/section, no contradictions) + Custom Mode lyrics ≤3000 chars + phonetic respell (thru/Noose, `A-I`, numbers spelled out); sing-aloud check.
- Prereqs: none for lyrics; Suno account (paid) for generation; optional `heartmula`/audiocraft GPU path.
- Pass: all textual checklists hold; human sings without stumble.
- Blockers: purely subjective craft — no oracle; e2e needs paid Suno + listening (3–5 gens per keeper).

### spec-conformance-alignment [H+J]
- Test: clean-copy gate `git archive HEAD | tar -x -C /tmp/check && (cd /tmp/check && npx tsc -b)`; `grep -c "Could not acquire\|ECONNREFUSED\|FATAL\|level=ERROR" logs/*.err.log`; consumer count `rg` loop; CI includes test file; `curl … | wc -c` + `curl -w '%{time_total}'` before/after; hot-reload `lsof -t` same-PID + `<title>` change; worktree byte-equality `git worktree add /tmp/prev HEAD~1` + `assert.equal(render)`; `node --test --experimental-test-coverage`; YAML edge files (trailing-comment coercion, `>` vs `|`, quoted commas, comment-first blocks, `!` tags, BOM/CRLF, mtime cache); deliverable `docs/<framework>-alignment.md` spec-ordered with path+`SPEC §x.y` quote per row.
- Prereqs: target git repo + Node/`npx tsc`; `rg`, `curl`, `lsof`; spec primary URL (never blogs).
- Pass: Conforming rows link to executing test; P0 overlay proven by `/tmp/prev` byte-diff over minimal/full/empty inputs.
- Blockers: research deliverable, no single pass/fail; needs real external spec; multi-phase needs user fork decisions.

### spike [H]
- Test: 2–5 Given/When/Then questions table (standard vs `002a/002b`, risk-ordered) approved by user → per spike `spikes/NNN-name/{README.md,main.py|parse.js}` (runnable CLI > HTML > server > unit test; unbuffered stdout, print-before-risky-line) → README Verdict (`VALIDATED|PARTIAL|INVALIDATED` + What worked/didn't/Surprises/Recommendation; head-to-head table for comparisons) → Frontier mode.
- Prereqs: host repo; per-spike toolchain; `terminal/write_file/read_file`, `web_search/web_extract`, optional `gsd-spike`/Context7.
- Pass: each spike dir builds+runs with edge-case notes; verdict matches observed output; comparison ends with winner + dimension table.
- Blockers: intentionally throwaway — no durable assertions; open topic means no fixed oracle; over-engineering defeats purpose.

### studio-dashboard [H]
- Test: tombstone compliance — dashboard request routes to `studio-editorial/studio-imagegen/studio-mediagen/studio-podcastgen`, deletions to `subsystem-removal`; refuses to re-introduce `apps/web`, `packages/database`, `@studio/contracts`, `pnpm dev:web`; cites `web-app-final`. Archival only (needs `studio` repo at tag): `cd apps/web && pnpm build`; `PORT=4408 ORIGIN=… node --import ./otel.mjs build/index.js`; `curl -w %{http_code} /`→200 + `/usage`→200; logs contain `otel.started`+`otel.tracer_ready`, no `level:error`; href/tab sweep.
- Prereqs: none for tombstone; archival needs old checkout + Node/pnpm pin.
- Pass: no app edits; if archival present, two-route 200 + log assertions hold; 200≠correct warning honored.
- Blockers: app deleted — live dashboard untestable; `observability.md` describes removed `apps/web/otel.mjs`.

### studio-dev [H]
- Test: `just --list` verbs (`setup|doctor|run|sim|e2e|testflight`, `studio-version|studio-update|studio-check`); `just studio-check` exits 0 / fails when lockfile missing; parse `scripts/ports.env` (Thames 8083, Still 8084, Omiro-e2e 8082, API 4040, never 8081); `scripts/VERSION` == `0.3.0` matches `SKILL.md`; `STUDIO.md` preflight checklist.
- Prereqs: `just`, git, studio repo with `justfile` + `skills-lock.json`; macOS+Xcode+sim for `sim/e2e`; ASC creds for `testflight`.
- Pass: unsupported verbs print `not applicable here` exit 0; no 8081; `studio-check` green on fixture.
- Blockers: no executable harness in skill; full check needs real studio repo + Apple hardware/account.

### subsystem-removal [H]
- Test: fixture monorepo: importer `grep -rln <pkg>` → keep/kill list written pre-delete; `git tag <name>-final`; `git rm -r` + `rm -rf dist/build`; config sweep (workspace/`globalEnv`/root scripts/CI/catalogs); reinstall + `grep -c <pkg> <lockfile>`; two-sided config-key deletion; survivors `build + test + dry-run` exit 0; post-delete `grep -rln <pkg>` = 0; `find dist -name <removed>` empty.
- Prereqs: git fixture monorepo; language build toolchain; none external.
- Pass: tag named in removal commit; zero tracked references; all survivors green.
- Blockers: destructive by design — disposable fixture only; platform-conditional code needs multi-platform runners.

### swift-package-multiplatform-verification [H]
- Test: fixture dual-platform package with `#if os(iOS)` file: macOS `swift build` (expected green, proves nothing) vs `xcodebuild -scheme <Target> -destination generic/platform=iOS -derivedDataPath /tmp/ios-build build CODE_SIGNING_ALLOWED=NO` → `BUILD SUCCEEDED` + `find … -name PhoneMicrophone.o -o -name VoiceOrb.o` exists; link-error repro for missing test-target product; rename coordination; `git merge-base --is-ancestor <tag> main`.
- Prereqs: macOS only, Xcode, SwiftPM, iOS SDK; sample package.
- Pass: `BUILD SUCCEEDED` + ≥1 `.o` per iOS-only source; `swift build` green alone = fail.
- Blockers: macOS-gated, heavy (derived data); no bundled fixture; minutes per build.

### systematic-debugging [H+J]
- Test: seeded-bug fixture: Phase 1 loop command exists, run ≥1, red-capable, deterministic/repro rate; Phase 2 minimal repro; Phase 3 3–5 ranked falsifiable hypotheses (`if X then Y`); Phase 4 RED test → single fix → verify, Rule of Three; `pytest tests/ -q` no regressions; write-up `docs/<topic>.md`.
- Prereqs: repo with failing test/bug + runner; `git log/diff`; none external.
- Pass: loop fails pre-fix on exact symptom, passes post-fix; checklist all checked.
- Blockers: process skill — behavioral compliance, not script-assertable; flaky bugs need 100× runs.

### design-workflows: tailwind-cdn-static-page procedure [H]
- Test: `python3 -m http.server 8080` + `google-chrome --headless=new --virtual-time-budget=15000 --dump-dom http://127.0.0.1:8080/` shows rendered `<canvas>`/component; importmap JSON-valid (no trailing comma); `?deps=react@18.3.1` present; `window.onerror` empty; no version-mismatch `useSyncExternalStore` error.
- Prereqs: `python3`, headless Chrome, network to `cdn.tailwindcss.com` + `esm.sh`; static HTML fixture.
- Pass: DOM dump contains expected component; console zero errors.
- Blockers: external CDN network; binary name varies (`google-chrome` vs `chromium`); dark-theme aesthetics subjective.

### tanstack-start-shadcn [H]
- Test: `npx @tanstack/cli create` + `npm install tailwindcss @tailwindcss/vite` + `vite.config.ts` plugin + `@import "tailwindcss"`; shadcn (`cva/clsx/twMerge/lucide/@radix-ui/react-slot`, `cn()`, `button.tsx`); `npm run dev -- --port 5173`; `tsc -b` with `routeTree.gen.ts` moved aside fails, regenerates on dev; visible-string change + rebuild served from same PID; POST body reaches route; unknown path returns JSON `{error}` + no log flood.
- Prereqs: Node/npm, network; ports 3000/5173 free.
- Pass: fresh clone typechecks with committed `routeTree.gen.ts`; SSR reload without restart; API round-trip works.
- Blockers: heavy scaffold (`npm ci`, Vite); no bundled template/spec; external docs drift.

### teams-meeting-pipeline [L]
- Test: `hermes teams-pipeline validate|token-health|list|show|subscriptions`; `run <job-id>|fetch --meeting-id|--join-web-url`; `subscribe|renew-subscription|delete-subscription|maintain-subscriptions [--dry-run]`; `token-health [--force-refresh]`; `maintain-subscriptions --dry-run` lists renewals; `fetch` dry-run (no persist); 72h-expiry + `hermes cron add` renewal.
- Prereqs: `hermes` CLI; `${HOMINEM_HOME:-~/.hominem}/.env` with `MSGRAPH_TENANT_ID/CLIENT_ID/CLIENT_SECRET`; Azure AD app + admin consent; public webhook URL; Teams channel/cron session.
- Pass: `validate+token-health+subscriptions` green; `list` shows fresh row after test meeting; dry-run returns transcript JSON.
- Blockers: live Entra/Graph + paid Teams required; secrets-gated; webhook expiry makes tests time-sensitive; channel-gated (hidden from normal sessions).

### test-driven-development [H+J]
- Test: fixture task: test file exists before impl; RED `pytest tests/test_feature.py::test_name -v` exits ≠0 with expected message; GREEN minimal → passes; full `pytest tests/ -q` pristine; no mocks for system-under-test; edge cases covered; vertical tracer bullets; scope discipline.
- Prereqs: language test runner (`pytest`); fixture task.
- Pass: observed RED→GREEN in logs; every new function has test; Verification Checklist all checked.
- Blockers: behavioral compliance (pre-written code deletion unobservable post-hoc); "watched it fail" needs terminal log evidence.

### tower-bridge [H+L]
- Test: `tb new → script(+approve) → audio → align → specs(+fixture|command) → stills(+approve) → render`; `tb status <slug> --root <episodes>` shows `specs=pass,manifest=pass,contact-sheet=pass,duration=pass,outputs=pass`; `scripts/demo.sh` smoke fixture; cue/grounding failure messages; MP4 1920×1080/30fps with audio (not `anullsrc`).
- Prereqs: `~/Developer/tower-bridge` checkout, `pip install -e .` (`tb` on PATH), `ffmpeg`, fixture providers; render needs minutes + background.
- Pass: all five gates `pass`; MP4 has real audio.
- Blockers: external repo not in kernel; no scripts bundled; render exceeds foreground timeout; fixture `specs.json` cues known-stale.

### tower-bridge-tb [H+$]
- Test: `tb new <slug> --mode idea|essay|episode` + `tb run` + `tb approve script|stills` + `tb status`; unit suite `python3 -m unittest discover -s tests` (65 tests ~2min); `npx tsc --noEmit` in `remotion/`; `bash scripts/demo.sh` 0.25-scale smoke → MP4; choreography eval (example-match ≥80%, beat recall ≥80%, 0 grounding violations, demotes ≤10%); planner eval (baseline 33/35 no regress); TTS `scripts/openrouter_tts.py` (per `references/openrouter-tts.md`).
- Prereqs: tower-bridge repo, Node 20+, Python 3.11+, `ffmpeg/ffprobe`, `pip install -e .`, `cd remotion && npm ci && npx remotion browser ensure`; `OPENROUTER_API_KEY` + `TB_*_CMD`; Parakeet model (~1.2GB); `parakeet-cli`, `hf` CLI.
- Pass: numeric thresholds above; MP4 has real audio + captions + chapters.
- Blockers: heaviest skill — external repo + large models + paid API; gitignored media must regenerate; history repair dangerous.

### typescript-sqlite [H]
- Test: scratch TS project: insert-order repro (FK fail vs pass); `?`-count error repro; `JSON.stringify` round-trip; `PRAGMA foreign_keys=ON` per connection; FTS5 sanitize (`?*"()` → no `fts5: syntax error`); MCP `initialize→tools/list→tools/call` JSON-RPC over stdio; latency loop `curl …/api/state` under writer load; migration checksum-mismatch abort; `npx tsc` clean.
- Prereqs: Node 22.5+ (`node:sqlite`) or ABI-matched `better-sqlite3` (Node 24 ok, Node 26 ABI 137 incompatible — `npm rebuild`); TypeScript/Kysely.
- Pass: observable SQL behaviors above; MCP echo returns valid JSON-RPC; no `database is locked` kill.
- Blockers: no bundled scripts/fixtures; native-module ABI fragility; async-extraction timing (20–45s) makes evals slow.

### weekly-review-planning [J+L]
- Test: 7 steps on live week data — systems/window → calendar evidence → clear inboxes → reconcile projects → waiting/commitments → capacity-aware plan → apply approved updates; output 7 sections (wins/overdue/waiting/stalled/plan/proposed-updates/gaps); Verification checklist (both weeks covered or gaps stated; every flag traces to record/event/thread; no unapproved mutation + approved writes read back; deferred work named).
- Prereqs: connectors (`google-workspace`, `notion`, `email-inbox-triage`); timezone + declared source-of-truth; cron for scheduled run.
- Pass: each claim cites an ID/URL; assignees/dates/links read back match.
- Blockers: no scripts; needs live user data + OAuth; quality is judgment-based.

### xlsx [H]
- Test: `xlsx_create.py` → `xlsx_read.py --sheets --json --formulas --notes --names` round-trip matches spec (names/dims/merges/chart counts); `xlsx_edit.py --set/--append/--copy-sheet/--add-table/--protect`; `xlsx_restructure.py --insert-rows 3:2` shifts refs on ALL sheets (report + re-dump, empty `not_shifted` or documented exceptions); `xlsx_recalc` prints `{"recalculated": true/false}`; `csv_to_xlsx.py` type inference (int/float/bool/ISO-date); `xlsx_to_csv.py --sheet`; per `references/restructuring.md`.
- Prereqs: Python 3.10+, `openpyxl`; optional `soffice` for recalc/PDF (graceful `recalculated:false` exit 0).
- Pass: dumped JSON equals source; `--formulas` lists written formulas; restructure report as expected.
- Blockers: cheapest to test — fully offline except `soffice`; honest limits (no calc, charts/images dropped on re-save, protection ≠ security).


### youtube-content [L]
- Test: Hermes isolated env (`source ./activate`, `pm.sync_venv(['youtube'])`); `fetch_transcript.py "<url>"` → `{video_id, language, segments[{text,start,duration}], full_text, timestamped_text}`; `--text-only` pipeable; `--timestamps` `MM:SS`; `--language tr,en` fallback; chunk if >~50K chars (40K+2K overlap); transforms per `references/output-formats.md` (thread posts <280 chars numbered); disabled/private/no-language → prescribed user message (not traceback).
- Prereqs: Hermes source checkout + `pm` + `youtube` extra (`youtube_transcript_api`); network; video must have captions enabled/public.
- Pass: JSON has non-empty `segments` in expected language; timestamps valid.
- Blockers: third-party captions (private/disabled untestable); chunked summarization needs LLM judgment; must not raw `pip install` into Hermes env.
