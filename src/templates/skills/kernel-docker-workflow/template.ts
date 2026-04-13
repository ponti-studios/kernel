import { parseFrontmatter } from "../../../core/templates/frontmatter.js";
import type { SkillTemplate } from "../../../core/templates/types.js";
import { SKILL_NAMES } from "../../constants.js";
import dockerWorkflowSkillMarkdown from "./instructions.md";

const { body } = parseFrontmatter(dockerWorkflowSkillMarkdown);

export function getDockerWorkflowSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAMES.DOCKER_WORKFLOW,
    profile: "extended",
    description:
      "Manages Docker workflows for local development infrastructure and production container packaging. Use when writing Dockerfiles, configuring compose services, debugging container issues, optimizing image size, or when users ask about containerization.",
    license: "MIT",
    compatibility: "Any project using Docker for local infrastructure or production deployments.",
    metadata: {
      author: "project",
      version: "1.0",
      category: "Engineering",
      tags: [
        "docker",
        "compose",
        "containers",
        "dockerfile",
        "multi-stage",
        "infrastructure",
        "devops",
      ],
    },
    when: [
      "user is writing or reviewing a Dockerfile",
      "user is configuring Docker Compose for local development",
      "user is debugging a container that fails to start or behaves unexpectedly",
      "user is optimizing image size or reducing build time",
      "user is setting up local databases, caches, or queues via containers",
    ],
    applicability: [
      "Use when authoring or reviewing any Dockerfile or compose.yml",
      "Use when setting up local development infrastructure",
      "Use when preparing container images for production deployment",
    ],
    termination: [
      "Dockerfile uses multi-stage build with minimal runtime image",
      "Containers run as non-root user",
      "Local compose services start healthy and are accessible",
    ],
    outputs: [
      "Production-ready multi-stage Dockerfile",
      "Docker Compose configuration for local infrastructure",
      "Image size analysis and optimization recommendations",
    ],
    instructions: body,
  };
}
