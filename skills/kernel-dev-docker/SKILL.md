---
name: kernel-dev-docker
description: Enforces Docker workflow boundaries for local infrastructure and production image packaging. Use when writing or reviewing Dockerfiles, configuring Compose services, defining container networking/readiness, or preventing unsafe containerization patterns.
license: MIT
compatibility: Projects using Docker for local infrastructure or production packaging.
metadata:
  author: project
  version: "1.0"
  category: Engineering
  tags:
    - docker
    - compose
    - containers
    - dockerfile
    - infrastructure
    - devops
when:
  - user is writing or reviewing a Dockerfile
  - user is configuring Docker Compose for local development infrastructure
  - user is debugging container startup, readiness, or inter-service communication issues
  - user is packaging an application image for production
  - user is setting up local databases, caches, or queues via containers
applicability:
  - Use when enforcing Dockerfile or Compose correctness
  - Use when separating host-run app workflows from containerized infrastructure
  - Use when reviewing image hygiene, readiness, or runtime safety
  - Use when preventing unsafe or non-portable container patterns
termination:
  - Local infrastructure boundaries are correct
  - Production image packaging follows the required rules
  - Networking, readiness, and runtime safety rules are satisfied
outputs:
  - Correct Dockerfile or Compose boundary decision
  - Container workflow findings and required fixes
  - Production packaging or local infrastructure recommendation
---

Enforce the container workflow this project expects. This skill exists to stop the LLM from using Docker as a generic hammer, blurring local infrastructure with app runtime, or shipping unsafe container packaging.

## Non-Negotiables

- Use Docker Compose for local infrastructure services such as databases, caches, and queues.
- Keep application code running on the host during normal local development unless the project explicitly requires full containerized app runtime.
- Production images use multi-stage builds and a minimal runtime image.
- Runtime containers do not run as root.
- Secrets are injected at runtime, never baked into the image.

Forbidden behavior:

- Do not use ad hoc containers as a substitute for the project's local workflow contract.
- Do not treat local Compose configuration as a production deployment manifest.
- Do not store important state in the container writable layer.
- Do not rely on container-start order when service readiness is the real dependency.
- Do not use floating production image references when a pinned version or digest is required.

## Local Infrastructure Rules

- Containers own local infrastructure services; the host owns the fast application feedback loop unless the project explicitly says otherwise.
- Every infrastructure service should have an explicit healthcheck.
- Services should communicate through the correct Docker network/service-name boundary rather than accidental localhost assumptions.
- If a local service needs persistence, use a named volume or external storage boundary.

## Production Image Rules

- Build artifacts and runtime dependencies should be separated from build-time tooling.
- Runtime images should contain only what is needed to start the application.
- Healthcheck behavior should exist where the runtime contract expects it.
- Image size, attack surface, and startup correctness should all be considered part of the packaging review.

## Networking And Readiness Rules

- Distinguish clearly between host-to-container access and container-to-container access.
- Use readiness checks for dependency sequencing; do not assume container start means the service is usable.
- Environment variables and connection strings must match the actual network boundary they run in.

## Guardrails

- Never choose convenience over container boundary correctness.
- Never let a Dockerfile hide missing build or runtime assumptions.
- Never publish an image that requires manual shell fixes to boot correctly.
- Never merge Compose or image changes without checking persistence, networking, and health behavior.
