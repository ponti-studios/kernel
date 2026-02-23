import type { BuiltinSkill } from "./types";

/**
 * Compound Engineering Skills - 73 skills organized by category
 *
 * DEVELOPMENT SKILLS (25)
 * - Language/Framework specific programming expertise
 * - Code generation, refactoring, optimization
 * - Testing and quality assurance
 *
 * DESIGN SKILLS (18)
 * - UI/UX design, visual design
 * - Design system implementation
 * - Design tool expertise
 *
 * DEVOPS SKILLS (12)
 * - Infrastructure, deployment, monitoring
 * - Container orchestration
 * - CI/CD pipelines
 *
 * DOCUMENTATION SKILLS (10)
 * - Technical writing, API documentation
 * - Process documentation
 * - Knowledge base management
 *
 * ANALYSIS SKILLS (8)
 * - Code analysis, performance analysis
 * - Research and investigation
 * - Data analysis
 */

// ============================================================================
// DEVELOPMENT SKILLS (25)
// ============================================================================

const developmentSkills: BuiltinSkill[] = [
  {
    name: "grid:typescript-expert",
    description:
      "Expert TypeScript development with type safety, advanced patterns, and ecosystem knowledge.",
    template: `# TypeScript Expert Skill

Master TypeScript development with advanced type system knowledge, architectural patterns, and ecosystem expertise.`,
  },
  {
    name: "grid:python-expert",
    description: "Expert Python development with modern patterns, libraries, and best practices.",
    template: `# Python Expert Skill

Master Python development with async/await, type hints, and ecosystem expertise.`,
  },
  {
    name: "grid:ruby-expert",
    description: "Expert Ruby and Rails development with DHH conventions and 37signals patterns.",
    template: `# Ruby Expert Skill

Master Ruby and Rails development with conventions, patterns, and domain modeling.`,
  },
  {
    name: "grid:go-expert",
    description:
      "Expert Go development with concurrency patterns, microservices, and performance optimization.",
    template: `# Go Expert Skill

Master Go development with goroutines, channels, and high-performance patterns.`,
  },
  {
    name: "grid:rust-expert",
    description: "Expert Rust development with safety, ownership, and systems programming.",
    template: `# Rust Expert Skill

Master Rust development with ownership, borrowing, and zero-cost abstractions.`,
  },
  {
    name: "grid:react-expert",
    description:
      "Expert React development with hooks, state management, and performance optimization.",
    template: `# React Expert Skill

Master React development with modern hooks, concurrent features, and performance patterns.`,
  },
  {
    name: "grid:vue-expert",
    description: "Expert Vue.js development with composition API and ecosystem mastery.",
    template: `# Vue Expert Skill

Master Vue development with reactive systems and component composition.`,
  },
  {
    name: "grid:next-expert",
    description: "Expert Next.js development with app router, server components, and deployment.",
    template: `# Next.js Expert Skill

Master Next.js with server components, API routes, and deployment patterns.`,
  },
  {
    name: "grid:node-expert",
    description: "Expert Node.js development with async patterns, frameworks, and optimization.",
    template: `# Node.js Expert Skill

Master Node.js with event loop, streams, and performance optimization.`,
  },
  {
    name: "grid:database-expert",
    description: "Expert database design and optimization across SQL and NoSQL systems.",
    template: `# Database Expert Skill

Master database design, query optimization, and scalability patterns.`,
  },
  {
    name: "grid:api-design-expert",
    description: "Expert REST, GraphQL, and gRPC API design with security and performance.",
    template: `# API Design Expert Skill

Master API design patterns, versioning, and best practices.`,
  },
  {
    name: "grid:testing-expert",
    description: "Expert test strategy, unit testing, integration testing, and test automation.",
    template: `# Testing Expert Skill

Master test-driven development, coverage strategies, and testing patterns.`,
  },
  {
    name: "grid:security-expert",
    description: "Expert security practices, vulnerability assessment, and secure coding.",
    template: `# Security Expert Skill

Master secure coding, vulnerability scanning, and security best practices.`,
  },
  {
    name: "grid:performance-expert",
    description: "Expert performance profiling, optimization, and scalability engineering.",
    template: `# Performance Expert Skill

Master performance optimization, profiling, and scalability patterns.`,
  },
  {
    name: "grid:refactoring-expert",
    description: "Expert code refactoring with safety guarantees and architectural improvements.",
    template: `# Refactoring Expert Skill

Master safe refactoring techniques and architectural improvements.`,
  },
  {
    name: "grid:documentation-code",
    description: "Expert at writing clear, maintainable code with excellent documentation.",
    template: `# Code Documentation Expert Skill

Master self-documenting code, comments, and inline documentation.`,
  },
  {
    name: "grid:dependency-management",
    description: "Expert dependency management, version resolution, and security auditing.",
    template: `# Dependency Management Expert Skill

Master package management, vulnerabilities, and version strategies.`,
  },
  {
    name: "grid:architecture-design",
    description: "Expert system architecture, design patterns, and scalable systems.",
    template: `# Architecture Design Expert Skill

Master architectural patterns, system design, and scalability.`,
  },
  {
    name: "grid:code-review",
    description: "Expert code review with focus on quality, security, and best practices.",
    template: `# Code Review Expert Skill

Master code review techniques, architectural assessment, and feedback.`,
  },
  {
    name: "grid:cli-development",
    description: "Expert CLI tool development with ergonomic user experience.",
    template: `# CLI Development Expert Skill

Master command-line tools, argument parsing, and user experience.`,
  },
  {
    name: "grid:web-scraping",
    description: "Expert web scraping and data extraction with ethical considerations.",
    template: `# Web Scraping Expert Skill

Master web automation, data extraction, and responsible scraping.`,
  },
  {
    name: "grid:integration-expertise",
    description: "Expert third-party API integration and webhook handling.",
    template: `# Integration Expert Skill

Master API integration, webhooks, and service communication.`,
  },
  {
    name: "grid:monorepo-management",
    description: "Expert monorepo setup, management, and tooling (Turborepo, Nx, Lerna).",
    template: `# Monorepo Management Expert Skill

Master monorepo tooling, workspace management, and dependencies.`,
  },
  {
    name: "grid:type-system-expert",
    description: "Expert type systems, type inference, and advanced typing patterns.",
    template: `# Type System Expert Skill

Master advanced typing patterns, generics, and type safety.`,
  },
  {
    name: "grid:algorithm-expert",
    description: "Expert algorithm design, data structures, and computational complexity.",
    template: `# Algorithm Expert Skill

Master algorithms, data structures, and computational efficiency.`,
  },
];

// ============================================================================
// DESIGN SKILLS (18)
// ============================================================================

const designSkills: BuiltinSkill[] = [
  {
    name: "grid:frontend-design",
    description: "Expert frontend UI/UX design with HTML, CSS, and modern frameworks.",
    template: `# Frontend Design Expert Skill

Master UI/UX design, accessibility, and responsive design.`,
  },
  {
    name: "grid:figma-expertise",
    description: "Expert Figma design, prototyping, and design system creation.",
    template: `# Figma Expert Skill

Master Figma design tools, component systems, and collaboration.`,
  },
  {
    name: "grid:design-system",
    description: "Expert design system creation, component libraries, and design scaling.",
    template: `# Design System Expert Skill

Master component design, design tokens, and system scaling.`,
  },
  {
    name: "grid:accessibility-expert",
    description: "Expert accessibility (WCAG, ARIA) and inclusive design practices.",
    template: `# Accessibility Expert Skill

Master WCAG standards, ARIA attributes, and accessible design.`,
  },
  {
    name: "grid:responsive-design",
    description: "Expert responsive design, mobile-first, and device adaptation.",
    template: `# Responsive Design Expert Skill

Master mobile-first design, breakpoints, and adaptation patterns.`,
  },
  {
    name: "grid:animation-expertise",
    description: "Expert CSS animations, transitions, and motion design.",
    template: `# Animation Expert Skill

Master CSS animations, transitions, and performance.`,
  },
  {
    name: "grid:color-typography",
    description: "Expert color theory, typography, and visual hierarchy.",
    template: `# Color & Typography Expert Skill

Master color systems, type scales, and visual hierarchy.`,
  },
  {
    name: "grid:interaction-design",
    description: "Expert interaction design, user flows, and user experience.",
    template: `# Interaction Design Expert Skill

Master user flows, interactive patterns, and user research.`,
  },
  {
    name: "grid:visual-design",
    description: "Expert visual design, composition, and design principles.",
    template: `# Visual Design Expert Skill

Master composition, design principles, and visual balance.`,
  },
  {
    name: "grid:dark-mode-design",
    description: "Expert dark mode design and theme system implementation.",
    template: `# Dark Mode Design Expert Skill

Master dark mode design, contrast ratios, and theme switching.`,
  },
  {
    name: "grid:design-documentation",
    description: "Expert design documentation, handoff, and design specs.",
    template: `# Design Documentation Expert Skill

Master design specs, developer handoff, and documentation.`,
  },
  {
    name: "grid:user-research",
    description: "Expert user research, testing, and design validation.",
    template: `# User Research Expert Skill

Master user testing, research methods, and design validation.`,
  },
  {
    name: "grid:branding-expertise",
    description: "Expert brand design, brand systems, and brand consistency.",
    template: `# Branding Expert Skill

Master brand systems, brand guidelines, and consistency.`,
  },
  {
    name: "grid:icon-design",
    description: "Expert icon design, icon systems, and SVG expertise.",
    template: `# Icon Design Expert Skill

Master icon design, SVG, and icon system management.`,
  },
  {
    name: "grid:illustration-expertise",
    description: "Expert illustration, digital art, and visual storytelling.",
    template: `# Illustration Expert Skill

Master illustration techniques, visual storytelling, and art direction.`,
  },
  {
    name: "grid:css-expertise",
    description: "Expert CSS, SCSS/SASS, and CSS-in-JS styling approaches.",
    template: `# CSS Expert Skill

Master CSS architecture, preprocessors, and performance.`,
  },
  {
    name: "grid:tailwind-mastery",
    description: "Expert Tailwind CSS and utility-first design approach.",
    template: `# Tailwind Expert Skill

Master Tailwind CSS, utility customization, and component extraction.`,
  },
  {
    name: "grid:component-design",
    description: "Expert reusable component design and component API design.",
    template: `# Component Design Expert Skill

Master component APIs, composition, and reusability patterns.`,
  },
];

// ============================================================================
// DEVOPS SKILLS (12)
// ============================================================================

const devopsSkills: BuiltinSkill[] = [
  {
    name: "grid:docker-expertise",
    description:
      "Expert Docker containerization, Dockerfile optimization, and registry management.",
    template: `# Docker Expert Skill

Master Docker images, containers, and registry best practices.`,
  },
  {
    name: "grid:kubernetes-expert",
    description: "Expert Kubernetes orchestration, deployments, and cluster management.",
    template: `# Kubernetes Expert Skill

Master Kubernetes deployments, scaling, and cluster management.`,
  },
  {
    name: "grid:ci-cd-expert",
    description: "Expert CI/CD pipelines, automation, and deployment strategies.",
    template: `# CI/CD Expert Skill

Master pipeline design, automation, and deployment orchestration.`,
  },
  {
    name: "grid:terraform-expertise",
    description: "Expert Infrastructure as Code with Terraform and cloud provisioning.",
    template: `# Terraform Expert Skill

Master IaC patterns, state management, and cloud infrastructure.`,
  },
  {
    name: "grid:aws-expert",
    description: "Expert AWS services, architecture, and cost optimization.",
    template: `# AWS Expert Skill

Master AWS services, architecture, and best practices.`,
  },
  {
    name: "grid:gcp-expertise",
    description: "Expert Google Cloud Platform services and architecture.",
    template: `# GCP Expert Skill

Master GCP services, architecture, and best practices.`,
  },
  {
    name: "grid:monitoring-expert",
    description: "Expert monitoring, logging, observability, and alerting.",
    template: `# Monitoring Expert Skill

Master observability, metrics, logs, and alerting patterns.`,
  },
  {
    name: "grid:security-infrastructure",
    description: "Expert infrastructure security, secrets management, and compliance.",
    template: `# Infrastructure Security Expert Skill

Master security hardening, secrets, and compliance.`,
  },
  {
    name: "grid:database-ops",
    description: "Expert database operations, backups, replication, and scaling.",
    template: `# Database Operations Expert Skill

Master backups, replication, scaling, and performance tuning.`,
  },
  {
    name: "grid:networking-devops",
    description: "Expert networking, load balancing, CDN, and DNS management.",
    template: `# Networking Expert Skill

Master networking, load balancing, CDN, and DNS.`,
  },
  {
    name: "grid:scaling-expertise",
    description: "Expert horizontal and vertical scaling, auto-scaling, and load management.",
    template: `# Scaling Expert Skill

Master scaling patterns, auto-scaling, and load management.`,
  },
  {
    name: "grid:disaster-recovery",
    description: "Expert disaster recovery, business continuity, and failover strategies.",
    template: `# Disaster Recovery Expert Skill

Master disaster recovery, failover, and business continuity.`,
  },
];

// ============================================================================
// DOCUMENTATION SKILLS (10)
// ============================================================================

const documentationSkills: BuiltinSkill[] = [
  {
    name: "grid:api-documentation",
    description: "Expert API documentation, OpenAPI/Swagger, and interactive docs.",
    template: `# API Documentation Expert Skill

Master OpenAPI specs, interactive documentation, and API reference.`,
  },
  {
    name: "grid:technical-writing",
    description: "Expert technical writing, clarity, and documentation structure.",
    template: `# Technical Writing Expert Skill

Master clear writing, documentation structure, and audience adaptation.`,
  },
  {
    name: "grid:readme-expertise",
    description: "Expert README creation, project documentation, and getting started guides.",
    template: `# README Expert Skill

Master README design, quick starts, and project documentation.`,
  },
  {
    name: "grid:tutorial-creation",
    description: "Expert tutorial creation, step-by-step guides, and learning paths.",
    template: `# Tutorial Creation Expert Skill

Master tutorial design, pacing, and learning progressions.`,
  },
  {
    name: "grid:changelog-expertise",
    description: "Expert changelog management, versioning docs, and release notes.",
    template: `# Changelog Expert Skill

Master changelog formats, versioning documentation, and release notes.`,
  },
  {
    name: "grid:documentation-site",
    description: "Expert documentation site creation with tools like Docusaurus, MkDocs.",
    template: `# Documentation Site Expert Skill

Master doc site tools, navigation, and publishing.`,
  },
  {
    name: "grid:architecture-documentation",
    description: "Expert architecture documentation, diagrams, and system design docs.",
    template: `# Architecture Documentation Expert Skill

Master architecture docs, diagrams, and ADRs.`,
  },
  {
    name: "grid:video-documentation",
    description: "Expert video creation, screen recording, and video documentation.",
    template: `# Video Documentation Expert Skill

Master screen recording, video editing, and video docs.`,
  },
  {
    name: "grid:contributing-guides",
    description: "Expert contributor guidelines, code of conduct, and contribution workflows.",
    template: `# Contributing Guide Expert Skill

Master contributor workflows, guidelines, and community building.`,
  },
  {
    name: "grid:knowledge-base",
    description: "Expert knowledge base creation and FAQ management.",
    template: `# Knowledge Base Expert Skill

Master KB organization, searchability, and content management.`,
  },
];

// ============================================================================
// ANALYSIS SKILLS (8)
// ============================================================================

const analysisSkills: BuiltinSkill[] = [
  {
    name: "grid:code-analysis",
    description: "Expert code analysis, metrics, and code quality assessment.",
    template: `# Code Analysis Expert Skill

Master code metrics, complexity analysis, and quality assessment.`,
  },
  {
    name: "grid:performance-analysis",
    description: "Expert performance profiling, bottleneck analysis, and optimization.",
    template: `# Performance Analysis Expert Skill

Master profiling, benchmarking, and performance optimization.`,
  },
  {
    name: "grid:security-analysis",
    description: "Expert security vulnerability analysis and penetration testing.",
    template: `# Security Analysis Expert Skill

Master vulnerability scanning, penetration testing, and threat analysis.`,
  },
  {
    name: "grid:git-analysis",
    description: "Expert git history analysis, commit patterns, and contribution metrics.",
    template: `# Git Analysis Expert Skill

Master git log analysis, contribution patterns, and history insights.`,
  },
  {
    name: "grid:dependency-analysis",
    description: "Expert dependency graph analysis, vulnerability scanning, and licenses.",
    template: `# Dependency Analysis Expert Skill

Master dependency trees, vulnerability detection, and license compliance.`,
  },
  {
    name: "grid:data-analysis",
    description: "Expert data analysis, visualization, and statistical insights.",
    template: `# Data Analysis Expert Skill

Master data visualization, statistical analysis, and insights.`,
  },
  {
    name: "grid:trend-analysis",
    description: "Expert technology trends, market analysis, and industry research.",
    template: `# Trend Analysis Expert Skill

Master trend identification, market analysis, and research.`,
  },
  {
    name: "grid:cost-analysis",
    description: "Expert infrastructure cost analysis, optimization, and budget planning.",
    template: `# Cost Analysis Expert Skill

Master cost optimization, budget planning, and FinOps.`,
  },
];

// ============================================================================
// EXPORT ALL COMPOUND SKILLS
// ============================================================================

export const COMPOUND_SKILLS: BuiltinSkill[] = [
  ...developmentSkills,
  ...designSkills,
  ...devopsSkills,
  ...documentationSkills,
  ...analysisSkills,
];

export const COMPOUND_SKILL_NAMES = COMPOUND_SKILLS.map((skill) => skill.name);
