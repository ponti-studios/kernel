# Document Builder

Use this generator as the canonical document builder for the vault. It should make documents feel like real working artifacts: clear, useful, opinionated, and ready to live in the system.

## Core Workflow

1. Identify the document type, audience, project, and intended use.
2. Choose the closest reference from `project-docs/` or `general/`.
3. Produce a filled document, not a template with placeholders.
4. Preserve useful frontmatter conventions and relative links.
5. Remove instructional filler unless the user explicitly asks for a blank template.
6. Mark unsupported facts as `TBD` instead of inventing details.

## Project Documents

Use `project-docs/` for studio, client, product, and project documents:

- **Architecture**: `project-docs/architecture.md` for system design, technical architecture, infrastructure, or data flow.
- **Case study**: `project-docs/case-study.md` for completed work, portfolio writeups, outcomes, or project showcases.
- **Client overview**: `project-docs/client.md` for client project summaries and engagement overviews.
- **Feature spec**: `project-docs/feature.md` for feature-level product specs.
- **PRD**: `project-docs/prd.md` for product requirements, flows, scope, and release planning.
- **Research**: `project-docs/research.md` for discovery, user research, market research, and competitive analysis.
- **Retrospective**: `project-docs/retrospective.md` for postmortems, after-action reviews, and lessons learned.
- **Strategy**: `project-docs/strategy.md` for vision, positioning, go-to-market, portfolio, or business strategy.
- **Venture**: `project-docs/venture.md` for internal products and ventures.
- **Lightweight shells**: use `*-template.md`, `meeting-notes-template.md`, or `lightweight-template.md` when the fuller templates are too heavy.
- **StreamYard/Collab docs**: use the StreamYard collaboration references for client-specific testing, feedback, and collaboration guides.

## General Documents

Use `general/` for recurring vault documents:

- **Daily note**: `general/daily-note.md`
- **1-on-1**: `general/one-on-one.md`
- **Idea**: `general/idea.md`
- **Project page**: `general/project.md`
- **User story**: `general/user-story.md`
- **Market research stub**: `general/market-research.md`
- **User outreach**: `general/user-outreach.md`
- **User interview email**: `general/user-interview-email.md`
- **Pre-mortem**: `general/pre-mortem.md`
- **All-hands outline**: `general/all-hands.md`
- **Product pitch deck**: `general/product-slide-deck.md`
- **Agent skill design**: `general/agent-skill-architecture.md`; prefer the system `skill-creator` skill when available.

## Defaults

- Default status: `discovery` for new projects unless the source clearly says otherwise.
- Default category: `ventures` for internal products and `clients` for client work.
- Use `n/a` for repository, deployment, or budget when unknown.
- Use concise, decisive prose. The document should feel like a real artifact, not a form.

## Quality Bar

- Make the document immediately useful after creation.
- Keep structure strong, but cut sections that do not serve the job.
- Prefer concrete decisions, open questions, risks, and next actions over generic description.
- Write in a practical studio voice: direct, sharp, plainspoken, and specific.
- Do not over-polish personal notes; do polish client-facing, portfolio, proposal, and strategy docs.
