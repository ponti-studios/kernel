# =============================================================================
# Jinn CLI test targets
# Run from repo root: make <target>
# =============================================================================

BIN := $(shell pwd)/dist/jinn
TESTDIR := /tmp/jinn-cli-test
TESTDIR_DELIVERY_BOTH := /tmp/jinn-cli-test-delivery-both
TESTDIR_DELIVERY_SKILLS := /tmp/jinn-cli-test-delivery-skills
TESTDIR_MULTI := /tmp/jinn-cli-test-multi

.PHONY: help test-all test-init test-init-both test-init-skills test-init-multi \
	test-update test-config test-detect test-vault clean build

help:
	@echo "Jinn CLI test targets"
	@echo ""
	@echo "  make build              Build the CLI binary"
	@echo "  make test-init         Test 'jinn init --delivery commands' (agents bug fix)"
	@echo "  make test-init-both    Test 'jinn init --delivery both'"
	@echo "  make test-init-skills  Test 'jinn init --delivery skills' (no agents)"
	@echo "  make test-init-multi   Test 'jinn init' with multiple tools"
	@echo "  make test-update       Test 'jinn update --force'"
	@echo "  make test-config       Test 'jinn config show / add-tool'"
	@echo "  make test-detect       Test 'jinn detect'"
	@echo "  make test-vault        Test 'jinn vault compile --dry-run'"
	@echo "  make test-all          Run all CLI integration tests"
	@echo "  make clean             Remove test directories"
	@echo ""
	@echo "File count expectations:"
	@echo "  --delivery commands:  32 commands + 10 agents + 0 skills"
	@echo "  --delivery both:     32 commands + 10 agents + 7 skills"
	@echo "  --delivery skills:    0 commands + 0 agents + 7 skills"

build:
	bun build ./src/cli/main.ts --compile --outfile ./dist/jinn

# --- Test init with --delivery commands (the bug fix: agents should now exist) ---
test-init: build
	rm -rf $(TESTDIR)
	mkdir -p $(TESTDIR)
	cd $(TESTDIR) && git init --quiet
	$(BIN) init --path $(TESTDIR) --tools opencode --delivery commands --yes
	@echo ""
	@echo "=== File counts ==="
	@echo ".opencode/commands/  -> $$(ls $(TESTDIR)/.opencode/commands/*.md 2>/dev/null | wc -l | tr -d ' ') (expected 32)"
	@echo ".opencode/agents/    -> $$(ls $(TESTDIR)/.opencode/agents/*.md 2>/dev/null | wc -l | tr -d ' ') (expected 10)"
	@echo ".opencode/skills/    -> $$(ls -d $(TESTDIR)/.opencode/skills/*/ 2>/dev/null | wc -l | tr -d ' ') (expected 0)"
	@echo ""
	@echo "=== Spot-check: plan.md has ## Available commands and ## Related skills ==="
	@{ grep -q "## Available commands" $(TESTDIR)/.opencode/agents/plan.md && echo "PASS: plan.md has ## Available commands" || echo "FAIL: plan.md missing ## Available commands"; } && \
	{ grep -q "## Related skills" $(TESTDIR)/.opencode/agents/plan.md && echo "PASS: plan.md has ## Related skills" || echo "FAIL: plan.md missing ## Related skills"; }

# --- Test init with --delivery both ---
test-init-both: build
	rm -rf $(TESTDIR_DELIVERY_BOTH)
	mkdir -p $(TESTDIR_DELIVERY_BOTH)
	cd $(TESTDIR_DELIVERY_BOTH) && git init --quiet
	$(BIN) init --path $(TESTDIR_DELIVERY_BOTH) --tools opencode --delivery both --yes
	@echo ""
	@echo "=== File counts ==="
	@echo ".opencode/commands/  -> $$(ls $(TESTDIR_DELIVERY_BOTH)/.opencode/commands/*.md 2>/dev/null | wc -l | tr -d ' ') (expected 32)"
	@echo ".opencode/agents/    -> $$(ls $(TESTDIR_DELIVERY_BOTH)/.opencode/agents/*.md 2>/dev/null | wc -l | tr -d ' ') (expected 10)"
	@echo ".opencode/skills/    -> $$(ls -d $(TESTDIR_DELIVERY_BOTH)/.opencode/skills/*/ 2>/dev/null | wc -l | tr -d ' ') (expected 7)"

# --- Test init with --delivery skills (agents should NOT exist) ---
test-init-skills: build
	rm -rf $(TESTDIR_DELIVERY_SKILLS)
	mkdir -p $(TESTDIR_DELIVERY_SKILLS)
	cd $(TESTDIR_DELIVERY_SKILLS) && git init --quiet
	$(BIN) init --path $(TESTDIR_DELIVERY_SKILLS) --tools opencode --delivery skills --yes
	@echo ""
	@echo "=== File counts ==="
	@echo ".opencode/commands/  -> $$(ls $(TESTDIR_DELIVERY_SKILLS)/.opencode/commands/*.md 2>/dev/null | wc -l | tr -d ' ') (expected 0)"
	@echo ".opencode/agents/    -> $$(ls $(TESTDIR_DELIVERY_SKILLS)/.opencode/agents/*.md 2>/dev/null | wc -l | tr -d ' ') (expected 0)"
	@echo ".opencode/skills/    -> $$(ls -d $(TESTDIR_DELIVERY_SKILLS)/.opencode/skills/*/ 2>/dev/null | wc -l | tr -d ' ') (expected 7)"

# --- Test init with multiple tools ---
test-init-multi: build
	rm -rf $(TESTDIR_MULTI)
	mkdir -p $(TESTDIR_MULTI)
	cd $(TESTDIR_MULTI) && git init --quiet
	$(BIN) init --path $(TESTDIR_MULTI) --tools opencode,claude --delivery both --yes
	@echo ""
	@echo "=== File counts ==="
	@echo ".opencode/commands/  -> $$(ls $(TESTDIR_MULTI)/.opencode/commands/*.md 2>/dev/null | wc -l | tr -d ' ') (expected 32)"
	@echo ".opencode/agents/    -> $$(ls $(TESTDIR_MULTI)/.opencode/agents/*.md 2>/dev/null | wc -l | tr -d ' ') (expected 10)"
	@echo ".opencode/skills/    -> $$(ls -d $(TESTDIR_MULTI)/.opencode/skills/*/ 2>/dev/null | wc -l | tr -d ' ') (expected 7)"
	@echo ".claude/commands/jinn/ -> $$(ls $(TESTDIR_MULTI)/.claude/commands/jinn/*.md 2>/dev/null | wc -l | tr -d ' ') (expected 32)"
	@echo ".claude/agents/      -> $$(ls $(TESTDIR_MULTI)/.claude/agents/*.md 2>/dev/null | wc -l | tr -d ' ') (expected 10)"
	@echo ".claude/skills/      -> $$(ls -d $(TESTDIR_MULTI)/.claude/skills/*/ 2>/dev/null | wc -l | tr -d ' ') (expected 7)"

# --- Test update after init ---
test-update: test-init
	$(BIN) update --path $(TESTDIR) --force
	@echo ""
	@echo "=== After update --force: counts should be unchanged ==="
	@echo ".opencode/commands/  -> $$(ls $(TESTDIR)/.opencode/commands/*.md 2>/dev/null | wc -l | tr -d ' ') (expected 32)"
	@echo ".opencode/agents/    -> $$(ls $(TESTDIR)/.opencode/agents/*.md 2>/dev/null | wc -l | tr -d ' ') (expected 10)"

# --- Test config commands ---
test-config: build
	rm -rf $(TESTDIR)
	mkdir -p $(TESTDIR)
	cd $(TESTDIR) && git init --quiet
	$(BIN) init --path $(TESTDIR) --tools opencode --delivery commands --yes
	$(BIN) config --path $(TESTDIR) show
	$(BIN) config --path $(TESTDIR) add-tool claude
	$(BIN) config --path $(TESTDIR) show

# --- Test detect ---
test-detect: build
	$(BIN) detect

# --- Test vault (requires --vault <path> or vaultPath in config) ---
test-vault: build
	$(BIN) vault compile --dry-run || true

# --- All tests ---
test-all: build
	$(MAKE) test-init
	$(MAKE) test-init-both
	$(MAKE) test-init-skills
	$(MAKE) test-init-multi
	$(MAKE) test-detect
	$(MAKE) test-vault
	@echo ""
	@echo "=== ALL TESTS PASSED ==="

# --- Cleanup ---
clean:
	rm -rf $(TESTDIR) $(TESTDIR_DELIVERY_BOTH) $(TESTDIR_DELIVERY_SKILLS) $(TESTDIR_MULTI)
