---
title: projects
knowledge_type: process
domain: ponti-studios/projects
scope: running-projects
status: active
updated: 2026-08-25
slug: projects
applies_to:
  - "ponti-studios/projects/**"
---
# Projects

Consolidated from `projects.yml`, `APP_INVENTORY.md`, `ponti-studios-strategy.md`, `backlog.md`, and `reference.project-names.md`.

Last updated: 2026-07-29

---

## Operating Model

Ponti Studios runs on a four-lane model: **Studio Platform** (compounding internal assets), **Flagship Product** (durable user-facing surface), **Venture / Incubation** (time-boxed bets), and **Brand / Public Presence** (reputation, narrative).

## Repo Inventory

| Repo | Language | Lane | Purpose |
|---|---|---|---|
| `hominem` | TypeScript | Flagship | Omiro, Career, Finance, shared packages, and Hono API |
| `foundation` | Compose/Just | Platform | PostgreSQL, Redis, MinIO, shared images, CI/CD |
| `kernel` | Markdown | Platform | Shared AI-agent skills library distributed through skills.sh |
| `ponti-studios-ui` | TypeScript | Platform | Published shared UI and design-system package |
| `labs` | TypeScript | Venture | Labyrinth experiments and prototypes |
| `commune` | TypeScript | Venture | Standalone community application |
| `earth` | TypeScript | Venture | Standalone Earth Intelligence application |
| `health` | TypeScript | Venture | Symptom-guidance case-study application |
| `toolbox` | Rust/Go/Swift/Python/TS | Supporting | Polyglot CLI and local-app monorepo |
| `public-data` | TypeScript | Supporting | Public reference-data build and publishing pipeline |
| `pipeline` | Python | Experimental | Architecture-first content-production scaffold |
| `charlesponti` | — | Brand | Public brand/profile site |

---

## Active Projects

### Platform

- **Kernel** — shared AI-agent skills library used by Claude, Codex, and other agent runtimes. Components: reusable skills, agent guidance, and publishing conventions.
- **Foundation** — infrastructure layer for runtime services, storage, deployment, and operations.
- **Ponti Studios UI** — published shared UI and design-system package.
- **Ponti CLI** — CLI with `verba` component. Active.
- **Nexus** — ML experimentation platform for high-intelligence 3-4B models. Active.
- **Data** — Data tools and datasets. Active.

### AI Products

- **Hominem** — personal product monorepo. Omiro, Career, and Finance use the Hominem API for identity, data access, workers, queues, and integrations. Active.
- **Terminal** — Privacy-first agentic system (macOS/iOS). Planned.
- **Universal Task Router** — Route intents to optimal tools by task type. Planned.
- **Kuma** — Long-form AI writing/thinking environment. Planned.
- **Ledger** — Financial intelligence for freelancers/small teams. Planned.
- **Legal AI** — One specialized lawyer model per jurisdiction. Planned.

### Consumer Apps

- **Meridian** — Personalized extensible map platform. Active. Data sources: Corona (COVID-19 cases), TFL Cameras.
- **Wardrobe** — Construct outfits from your clothing. Planned.
- **Tag Music** — Replace playlists with multi-attribute tagging. Planned.

### Content & Media

- **Monotone** — Creative technology art brand. Sub-projects: Form (structure), Matter (artifacts/merchandise with Artwork and Goods sub-projects), Short-Form Video (TikTok/YT Shorts), Dope Shit Studio (media brand/production), Support Local (podcast, planned). Active.
- **Monotone World** — Art content. Active.
- **Writing** — Content. Sub-project: Little Sheila. Active.
- **Bideo** — Lab/media/video. Active.
- **Storyboard** — AI-assisted film/video pre-production. Planned.
- **Pixelle** — Visual/pixel art platform. Planned.

### Career & Education

- **Guild** — Career platform (professional identity, job search, peer vouching). Components: Vouch (professional references), Crafd (job search tracking), job-scrape (LLM extraction). Active.
- **School** — Educational curriculum platform, Montessori for adults. Sub-projects: Adaptive Learning, School Email Automation (both planned). Active.

### Social & Community

- **Social** — Products cluster: Komi (community platform, planned), Knit (relationship management), Dating, Community. Active.

### Commerce & Retail

- **Common Goods** — Physical goods: clothing, accessories, home goods. Active.
- **Support Local** — Physical retail space / marketplace (supportlocal.world). Planned.
- **Altar** — Collaborative real estate discovery platform. Planned (needs lane review).

### Developer Tools

- **Natural Language Cron** — Schedule recurring tasks in plain English. Planned.
- **Revrock Tours** — Tour planning/management for indie artists. Planned.

### Creative & Conceptual

- **Proof of Life** — Personality/art project inspiring aspiration. Planned.
- **Society** — Political platform treating society elements as products. Planned.
- **Experiments** — Early-stage ideas, prototypes, canceled ventures. Active.

### Misc Active

- **The Toy Store** — Monthly invite-only drops. Active.
- **Dump Him** — Active.
- **Health** — Active.
- **Labs** — Assorted web dev experiments. Active.

### Personal Projects

- **REALITEA** — Active.
- **token-input** — Component development. Active.
- **the modern man** — Newsletter of thoughts. Active.
- **hakumi** — Personal note-taking/capture system concept. "Jot at the speed of thought." Concepts: Personal Agent (analyze inbox, auto-generate tags, agent asks questions, model edits files directly), stop organizing approach.
- **Search Studio** — Tasks: migrate to query TMDB (tsvector, similarity search), port labyrinth health features to health.ponti.io.
- **What I've Been Up To** — Standardizing commands behind `just`, `kernel` skills library, markdown link check.

---

## Clients (Completed)

| Client | Industry | Proof |
|---|---|---|
| Glow Digital | Social advertising | Automation saved hours weekly; API strategy cut third-party costs 90% |
| Thomson Reuters | Enterprise/legal | Secure deployment for regulatory compliance; dashboards for high-stakes decisions |
| Mimecast | Email security | Global security platform; i18n across markets |
| Humana | Healthcare | Mobile research increased senior engagement; personalized healthcare matching |
| Kensho | Data engineering | Cloud migration reduced cost/complexity; accelerated ETL |
| StreamYard | Video/streaming | AI recommendations drove 300% YoY creator collaboration growth |
| Lumina | Education | Semantic search improved discovery; frontend modernization reduced bundle size |
| Prolog | Content platform | LLM email parser reduced data entry 90%; vector search surfaced qualified candidates |
| Revrock | Music | Tour routing reduced travel cost; real-time profitability dashboards |
| Whistle | Privacy/education | Privacy platform for sensitive instruction; adaptive quality systems |
| Help Refugees | Non-profit | Streamlined volunteer coordination; data integrity systems |
| Manual.co | Healthcare | NLP symptom analysis; medical data integration |
| Remote | Collaboration | Creator marketplace; $15M+ ARR unlocked |
| David Hansen | — | — |
| Golden Pear | — | — |
| Mary Sabo | — | — |
| Mindsherpa | — | — |

---

## Web Properties

| Property | Domain | Status |
|---|---|---|
| Ponti Studios | ponti.io | Active |
| Hackefeller | hackefeller.com | Active |
| Chase Ponti | theponti.com | Active |
| Ponti Family | thepontis.com | Active |
| Dope Shit Studio | dopeshit.studio | Active |
| Los Angels | losangels.co | Planned |
| Support Local | supportlocal.world | Planned |

---

## Archived / Cancelled

- **Bread** — Bakery operations. Archived.
- **Neko** — Substance usage tracking. Archived.
- **Dagflow.io** — ETL pipeline platform. Cancelled.
- **SWE-agent** — Archived.
- **Campsite** — Open-source product monorepo. Archived.
- **Podgenai** — Audiobook/podcast generator. Archived.
- **TrustClaw** — Self-hostable personal AI agent. Archived.
- **Peterson Academy** — Web and Supabase infrastructure. Archived.
- **Manual.co** — Case-study web app. Archived.
- **StreamYard** — Full monorepo. Archived.
- **Whistle** — Jitsi-based meetings. Archived.
- **craftd** — Career tracking (dormant, belongs in hominem).
- **revrock** — Multi-agent music management (dormant).

---

## Developer Directory (`~/Developer`) Non-Project Repos

- **playground / playground/go / playground/rust** — Multi-language learning exercises.
- **web-playground** — Frontend UI pattern experiments.
- **exhe** — Location-based check-ins (Rails, legacy).
- **unsolicited** — Standalone Go application.
- **estate** — Real estate web app + scrapers (dormant/external).

---

## Tool Codenames

| Name | Role | Description |
|---|---|---|
| metatron | Core CLI / Scribe | Primary orchestrator and record-keeper |
| gilgul | Rewriting Agent | Text transformation / reincarnating content |
| bezalel | Structural Architect | File organization, templating, data structure design |
| shamir | Summarization Tool | Condensing, extracting core insights |
| gematria | Analytics & Scoring | Classification, sentiment analysis, counts |
| merkaba | Platform / Suite | Agent deployment and management |
| golem | Batch Task Runner | Heavy-duty I/O, file migrations, batch processing |
| dybbuk | Debugger / Inspector | Inspecting internal states, extracting hidden data |
| hashmal | Real-time Engine | High-speed streaming, low-latency processing |
| ofanim | Automation Loops | Background workers, watchers, cyclical processing |
| sopher | Documentation Tool | READMEs, changelogs, technical docs |

---

## Idea Backlog

Ideas too thin or scattered to cluster into products. Revisit if a pattern emerges. Grouped by theme:

- **Healthcare & Wellness** — Meal planning/genetic profiling (natural v2 for Vitals), digital meditation sanctuary, substance discovery/education (regulatory research spike).
- **Sustainability & Environment** — Carbon tracking (Vitals for environment), crop/livestock management, botanical photography, hydrogen production.
- **Government, Civic & Non-Profit** — Civic data transparency, flat-tax calculator, volunteer matching, charity discovery, candidate assessment, campaign branding.
- **AI & Model R&D** — Train/fine-tune LLM, action-suggestion model, daily product launch automation (stress-test of idea-validation studio), remote GPU access.
- **EdTech** — Topic-based Q&A, subscription image-analysis tools, niche study resources.
- **Personal Life** — Photo organization/sharing, cloud file storage, recipe management, SSO/passkey manager.
- **Private Membership** — Exclusive club access, private Slack community, invitation-only knowledge communities, mentorship/VC access.
- **Social/Messaging** — General messaging platform, HN-style topic platform, random stranger conversations.
- **Misc** — Retro spreadsheet app, keyboard mapping extension, stamp design tool, cycle-tracking color messaging app, developer tooling wishes.

---

## Roadmap

**Q1 — Decide & Label (current):** Assign lanes to all repos, document hominem as flagship, add experiment scorecards to labs apps, archive craftd, review altar.

**Q2 — Standardize & Prune:** Converge labs packages into hominem, standardize app templates, add schema conformance tests, add CI to verified repos.

**Q3 — Focus on Compounding Bets:** Hominem (#1), Kuma (#2), Kernel (#3), Hollywood (#4 if downstream product), selected labs apps. Run validation cycles.

**Q4 — Graduate, Spin Down, or Double Down:** Review each lane, graduate or archive ventures, set next year's capacity model.

### Operating Rules

1. One repo, one job.
2. No parallel products in the same problem space.
3. Incubator work is time-boxed with decision dates.
4. Shared infrastructure has a single owner.
5. `hominem` never imports from `labs`.
6. Public halo work doesn't dictate internal priorities.