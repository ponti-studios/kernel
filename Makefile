# Ghostwire Build System
# ======================
# This Makefile provides clear, documented build steps for the Ghostwire project.
# All complex build logic is centralized here for maintainability.
#
# Quick Start:
#   make dev      # Start development mode with hot reload
#   make build    # Build for production
#   make test     # Run all tests
#
# For detailed help: make help

# Configuration
# ------------
SHELL := /bin/bash
.SHELLFLAGS := -euo pipefail -c

# Use bunx for TypeScript compiler (ensures it's available)
TSC := bunx tsc

# Colors for output
BLUE := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

# Default target
.DEFAULT_GOAL := help

# =============================================================================
# PUBLIC TARGETS (User-facing commands)
# =============================================================================

.PHONY: help
help: ## Show this help message
	@echo ""
	@echo "$(BLUE)Ghostwire Build System$(RESET)"
	@echo "======================"
	@echo ""
	@echo "$(GREEN)Quick Commands:$(RESET)"
	@echo "  make dev          Start development mode with hot reload"
	@echo "  make build        Build for production (full build)"
	@echo "  make test         Run all tests"
	@echo "  make clean        Remove all build artifacts"
	@echo ""
	@echo "$(GREEN)Development:$(RESET)"
	@echo "  make dev-setup    Setup development environment"
	@echo "  make typecheck    Run TypeScript type checking"
	@echo "  make lint         Run linting (if available)"
	@echo ""
	@echo "$(GREEN)Build Variants:$(RESET)"
	@echo "  make build-fast   Build without binaries (faster)"
	@echo "  make build-all    Build everything including platform binaries"
	@echo "  make build-cli    Build CLI only"
	@echo ""
	@echo "$(GREEN)Testing:$(RESET)"
	@echo "  make test         Run all tests"
	@echo "  make test-watch   Run tests in watch mode"
	@echo "  make test-agents  Run agent-specific tests"
	@echo ""
	@echo "$(GREEN)Utilities:$(RESET)"
	@echo "  make sync         Build and sync to OpenCode plugins"
	@echo "  make schema       Regenerate JSON schema"
	@echo "  make agents       Regenerate agents manifest"
	@echo "  make check        Run all checks (typecheck + test)"
	@echo ""
	@echo "$(YELLOW)Advanced:$(RESET)"
	@echo "  make topology     Check repository topology"
	@echo "  make binaries     Build platform-specific binaries"
	@echo "  make docs         Sync documentation"
	@echo ""
	@echo "For more details, see: $(BLUE)Makefile$(RESET) or $(BLUE)CONTRIBUTING.md$(RESET)"
	@echo ""

# Development
# -----------
.PHONY: dev
dev: dev-setup ## Start development mode with hot reload
	@echo "$(GREEN)Starting development mode...$(RESET)"
	bun build src/index.ts \
		--watch \
		--outdir dist \
		--target=bun \
		--format=esm \
		--external=@ast-grep/napi

.PHONY: dev-setup
dev-setup: agents ## Setup development environment (ensure plugin wrapper exists)
	@bun run script/ensure-plugin-wrapper.ts

# Build
# -----
.PHONY: build
build: clean agents schema ## Full production build (default)
	@echo "$(GREEN)Building Ghostwire...$(RESET)"
	
	# Step 1: Build main plugin
	@echo "$(BLUE)  → Building main plugin...$(RESET)"
	bun build src/index.ts \
		--outdir dist \
		--target bun \
		--format esm \
		--external @ast-grep/napi
	
	# Step 2: Generate TypeScript declarations
	@echo "$(BLUE)  → Generating TypeScript declarations...$(RESET)"
	$(TSC) --emitDeclarationOnly
	
	# Step 3: Build CLI
	@echo "$(BLUE)  → Building CLI...$(RESET)"
	bun build src/cli/index.ts \
		--outdir dist/cli \
		--target bun \
		--format esm \
		--external @ast-grep/napi
	
	# Step 4: Copy builtin skills
	@echo "$(BLUE)  → Copying builtin skills...$(RESET)"
	bun run script/copy-builtin-skills.ts
	
	@echo "$(GREEN)✓ Build complete$(RESET)"

.PHONY: build-fast
build-fast: agents ## Build without cleaning (faster for incremental builds)
	@echo "$(GREEN)Building (fast mode)...$(RESET)"
	bun build src/index.ts --outdir dist --target bun --format esm --external @ast-grep/napi
	tsc --emitDeclarationOnly
	bun build src/cli/index.ts --outdir dist/cli --target bun --format esm --external @ast-grep/napi
	bun run script/copy-builtin-skills.ts
	bun run script/build-schema.ts

.PHONY: build-all
build-all: build binaries ## Build everything including platform binaries

.PHONY: build-cli
build-cli: ## Build CLI only
	bun build src/cli/index.ts \
		--outdir dist/cli \
		--target bun \
		--format esm \
		--external @ast-grep/napi

# Testing
# -------
.PHONY: test
test: typecheck ## Run all tests (includes type checking first)
	@echo "$(GREEN)Running tests...$(RESET)"
	bun test

.PHONY: test-watch
test-watch: ## Run tests in watch mode
	bun test --watch

.PHONY: test-agents
test-agents: ## Run agent-specific tests only
	bun test src/orchestration/agents/

# Code Quality
# ------------
.PHONY: typecheck
typecheck: ## Run TypeScript type checking
	@echo "$(BLUE)Running type check...$(RESET)"
	$(TSC) --noEmit

.PHONY: check
check: typecheck test ## Run all checks (typecheck + test)
	@echo "$(GREEN)✓ All checks passed$(RESET)"

# Utilities
# ---------
.PHONY: clean
clean: ## Remove all build artifacts
	@echo "$(YELLOW)Cleaning build artifacts...$(RESET)"
	rm -rf dist
	@echo "$(GREEN)✓ Clean complete$(RESET)"

.PHONY: sync
sync: build ## Build and sync to OpenCode plugins directory
	@echo "$(BLUE)Syncing to OpenCode plugins...$(RESET)"
	cp dist/index.js ~/.config/opencode/plugins/ghostwire.mjs
	@echo "$(GREEN)✓ Sync complete$(RESET)"

.PHONY: schema
schema: ## Regenerate JSON schema from Zod types
	bun run script/build-schema.ts

.PHONY: agents
agents: ## Regenerate agents manifest from markdown files
	bun run script/build-agents-manifest.ts

# Advanced
# ----------
.PHONY: binaries
binaries: ## Build platform-specific binaries (Darwin, Linux, Windows)
	@echo "$(GREEN)Building platform binaries...$(RESET)"
	bun run script/build-binaries.ts

.PHONY: topology
topology: ## Check repository topology and structure
	bun run script/check-topology.ts

.PHONY: docs
docs: ## Sync documentation to GitHub Pages
	bun run script/sync-docs.ts

# Release
# -------
.PHONY: prepublish
prepublish: clean build ## Prepare for publishing (clean build)
	@echo "$(GREEN)Ready for publishing$(RESET)"

# =============================================================================
# PRIVATE TARGETS (Internal use)
# =============================================================================

# Ensure all dependencies are installed
.PHONY: deps
deps: ## Install dependencies (internal)
	bun install

# Legacy compatibility - these map to the new simple commands
.PHONY: build-schema build-agents-manifest copy-builtin-skills ensure-plugin-wrapper
build-schema: schema
build-agents-manifest: agents
copy-builtin-skills: build
ensure-plugin-wrapper: dev-setup
