---
title: "Architecture Title"             # REQUIRED: Human-readable title
type: architecture                       # REQUIRED: client | venture | case-study | feature | research | architecture | prd | strategy | retrospective
category: clients | ventures            # REQUIRED: clients | ventures
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
client: "Client Name" | null           # REQUIRED: Client organization name or null
tech_stack: [Technology, List]         # REQUIRED: All technologies used
repository: URL | n/a                   # REQUIRED: Code repository URL or n/a
deployment: URL | n/a                    # OPTIONAL: Production deployment URL
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
knowledge_type: standard
domain: ponti-studios/docs
scope: authoring-project-documents
applies_to:
---
# Architecture: [System/Component Name]

## Overview

**One paragraph describing the system, its purpose, and key architectural decisions.**

---

## Context & Goals

### System Context

Describe where this system fits in the overall product/application architecture.

### Architectural Goals

1. **Goal 1**: Description
2. **Goal 2**: Description

### Non-Goals

What is this system NOT responsible for?

---

## High-Level Architecture

### System Diagram

[Describe or include architecture diagram]

### Components

| Component | Responsibility | Technology |
|-----------|---------------|------------|
|           |               |            |

### Data Flow

1. **Flow 1**: Description

---

## API Design

### External APIs

#### API 1

```
Method: GET/POST/PUT/DELETE
Path: /api/resource
Authentication: 
Request: 
Response: 
Error Responses: 
```

### Internal APIs

#### API 1

```
Service: ServiceName
Method: 
Protocol: gRPC/HTTP/Message
Request: 
Response: 
```

---

## Data Model

### Database Schema

#### Table/Collection: [Name]

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
|        |      |             |             |

### Data Storage

- **Primary Store**: 
- **Cache**: 
- **Search Index**: 

---

## Security

### Authentication

Describe authentication approach.

### Authorization

Describe authorization/permissions model.

### Data Protection

- **Encryption at Rest**: 
- **Encryption in Transit**: 
- **Secrets Management**: 

---

## Scalability & Performance

### Scaling Strategy

- **Horizontal**: 
- **Vertical**: 

### Performance Targets

| Metric | Target |
|--------|--------|
|        |        |

### Caching Strategy

Describe caching approach and cache invalidation.

---

## Reliability

### Availability Targets

- **SLA**: 
- **Downtime Allowed**: 

### Failure Modes

| Failure Mode | Detection | Recovery |
|--------------|-----------|----------|
|              |           |          |

### Monitoring & Alerts

| Metric | Alert Threshold |
|--------|-----------------|
|        |                 |

---

## Deployment

### Infrastructure

- **Cloud Provider**: 
- **Compute**: 
- **CDN**: 

### CI/CD Pipeline

[Describe deployment pipeline]

---

## Decision Log

| Decision | Date | Rationale |
|----------|------|-----------|
|          |      |           |

---

## Open Questions

- Question 1?
- Question 2?

---

## Related Documents

- [Related Document 1](path/to/doc.md)
- [Related Document 2](path/to/doc.md)