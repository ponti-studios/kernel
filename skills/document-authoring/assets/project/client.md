---
title: "Client Project Title"           # REQUIRED: Human-readable title
type: client                            # REQUIRED: client | venture | case-study | feature | research | architecture | prd | strategy | retrospective
category: clients                       # REQUIRED: clients | ventures
project: project-slug                   # REQUIRED: Parent project identifier (kebab-case)
status: active
created: YYYY-MM-DD                     # REQUIRED: Document creation date
updated: YYYY-MM-DD                     # REQUIRED: Last significant update
start_date: YYYY-MM-DD                  # REQUIRED: When work began
end_date: YYYY-MM-DD | ongoing | null  # REQUIRED: End date or ongoing
owner: "First Last"                    # REQUIRED: Primary owner/author
team:
  - "# REQUIRED: All contributors"
  - "First Last (Role)"
  - "First Last (Role)"
client: "Client Organization Name"      # REQUIRED: Client organization name
tech_stack: [Technology, List]         # REQUIRED: All technologies used
repository: URL | n/a                   # REQUIRED: Code repository URL or n/a
deployment: URL | n/a                    # OPTIONAL: Production deployment URL
budget: "$amount" | internal | confidential  # REQUIRED: Project budget
revenue_model: consulting | subscription | transaction | ads | internal | null  # REQUIRED: How it generates revenue
priority: critical | high | medium | low  # REQUIRED: Business priority
domains: [industry, categories]        # REQUIRED: Business domains (e.g., healthcare, education)
tags: [technical, feature, keywords]   # REQUIRED: Searchable tags (e.g., ai, mobile, web)
keywords: [specific, terms, for, search]  # REQUIRED: Free-form search terms
related:
  - "# OPTIONAL: Related documents"
  - "relative/path/to/doc.md"
parent: relative/path/to/parent.md      # OPTIONAL: Parent document if sub-document
dependencies:
  - "# OPTIONAL: Dependent projects"
  - "project-slug-1"
impact_areas: [user-growth, revenue, technical-debt, performance]  # OPTIONAL: Business impact areas
kpis:
  - "# OPTIONAL: Key performance indicators"
  - "metric: "Metric Name"
knowledge_type: standard
domain: ponti-studios/docs
scope: authoring-project-documents
applies_to:
---
# Project Overview

## The Challenge

**What problem are you solving? Frame it as a compelling question.**

Describe the context and why this matters. What is the current state? Who is affected? What are the consequences of not solving this?

---

## The Solution

**What are you building/creating? High-level approach in one sentence.**

Explain your solution approach. How does it address the challenges above?

---

## Team & Collaboration

### Team Members

| Name | Role | Contribution |
|------|------|---------------|
|      |      |               |

### Client Contacts

| Name | Role | Contact |
|------|------|---------|
|      |      |         |

---

## Timeline

### Milestones

- [ ] **Milestone 1**: Description
- [ ] **Milestone 2**: Description
- [ ] **Milestone 3**: Description

---

## Technical Notes

### Architecture Overview

Describe the high-level architecture and key technical decisions.

### Key Challenges

1. **Challenge 1**: Description and approach
2. **Challenge 2**: Description and approach

---

## Lessons Learned

### What Worked Well

-

### What Could Be Improved

-

---

## Next Steps

- [ ] Action item 1
- [ ] Action item 2