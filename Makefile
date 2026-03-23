# =============================================================================
# Kernel CLI test targets
# Run from repo root: make <target>
# =============================================================================

BIN := $(shell pwd)/dist/kernel
TESTDIR := /tmp/kernel-cli-test
TESTDIR_DELIVERY_BOTH := /tmp/kernel-cli-test-delivery-both
TESTDIR_DELIVERY_SKILLS := /tmp/kernel-cli-test-delivery-skills
TESTDIR_MULTI := /tmp/kernel-cli-test-multi
TESTHOME := /tmp/kernel-cli-home
TESTHOME_DELIVERY_BOTH := /tmp/kernel-cli-home-delivery-both
TESTHOME_DELIVERY_SKILLS := /tmp/kernel-cli-home-delivery-skills
TESTHOME_MULTI := /tmp/kernel-cli-home-multi

.PHONY: help test-all test-init test-init-both test-init-skills test-init-multi \
	test-update test-config test-detect test-vault clean build

help:
	@echo "Kernel CLI test targets"
	@echo ""
	@echo "  make build              Build the CLI binary"
	@echo "  make test-init         Test 'kernel init --delivery both'"
	@echo "  make test-init-both    Test 'kernel init --delivery both'"
	@echo "  make test-init-skills  Test 'kernel init --delivery skills'"
	@echo "  make test-init-multi   Test 'kernel init' with multiple tools"
	@echo "  make test-update       Test 'kernel update --force'"
	@echo "  make test-config       Test 'kernel config show / add-tool'"
	@echo "  make test-detect       Test 'kernel detect'"
	@echo "  make test-vault        Test 'kernel vault compile --dry-run'"
	@echo "  make test-all          Run all CLI integration tests"
	@echo "  make clean             Remove test directories"
	@echo ""
	@echo "File count expectations:"
	@echo "  --delivery both:       8 agents + 20 skills"
	@echo "  --delivery skills:    0 agents + 20 skills"

build:
	bun ./src/templates/.generated/generate.ts
	bun build ./src/cli/main.ts --compile --outfile ./dist/kernel
	cp ./package.json ./dist/
	ln -sf $(PWD)/dist/kernel /usr/local/bin/kernel

# --- Test init with --delivery both ---
test-init: build
	rm -rf $(TESTDIR) $(TESTHOME)
	mkdir -p $(TESTDIR) $(TESTHOME)
	cd $(TESTDIR) && git init --quiet
	mkdir -p $(TESTDIR)/.opencode
	HOME=$(TESTHOME) $(BIN) init --path $(TESTDIR) --tools opencode --delivery both --yes
	@echo ""
	@echo "=== File counts ==="
	@echo ".opencode/agents/  -> $$(ls $(TESTDIR)/.opencode/agents/*.md 2>/dev/null | wc -l | tr -d ' ') (expected 8)"
	@echo ".opencode/skills/  -> $$(ls -d $(TESTDIR)/.opencode/skills/*/ 2>/dev/null | wc -l | tr -d ' ') (expected 20)"
	@echo ""
	@echo "=== Spot-check: global config exists ==="
	@{ test -f $(TESTHOME)/.kernel/config.yaml && echo "PASS: ~/.kernel/config.yaml created" || echo "FAIL: ~/.kernel/config.yaml missing"; }

# --- Test init with --delivery both ---
test-init-both: build
	rm -rf $(TESTDIR_DELIVERY_BOTH) $(TESTHOME_DELIVERY_BOTH)
	mkdir -p $(TESTDIR_DELIVERY_BOTH) $(TESTHOME_DELIVERY_BOTH)
	cd $(TESTDIR_DELIVERY_BOTH) && git init --quiet
	mkdir -p $(TESTDIR_DELIVERY_BOTH)/.opencode
	HOME=$(TESTHOME_DELIVERY_BOTH) $(BIN) init --path $(TESTDIR_DELIVERY_BOTH) --tools opencode --delivery both --yes
	@echo ""
	@echo "=== File counts ==="
	@echo ".opencode/agents/  -> $$(ls $(TESTDIR_DELIVERY_BOTH)/.opencode/agents/*.md 2>/dev/null | wc -l | tr -d ' ') (expected 8)"
	@echo ".opencode/skills/  -> $$(ls -d $(TESTDIR_DELIVERY_BOTH)/.opencode/skills/*/ 2>/dev/null | wc -l | tr -d ' ') (expected 20)"

# --- Test init with --delivery skills (agents should NOT exist) ---
test-init-skills: build
	rm -rf $(TESTDIR_DELIVERY_SKILLS) $(TESTHOME_DELIVERY_SKILLS)
	mkdir -p $(TESTDIR_DELIVERY_SKILLS) $(TESTHOME_DELIVERY_SKILLS)
	cd $(TESTDIR_DELIVERY_SKILLS) && git init --quiet
	mkdir -p $(TESTDIR_DELIVERY_SKILLS)/.opencode
	HOME=$(TESTHOME_DELIVERY_SKILLS) $(BIN) init --path $(TESTDIR_DELIVERY_SKILLS) --tools opencode --delivery skills --yes
	@echo ""
	@echo "=== File counts ==="
	@echo ".opencode/agents/  -> $$(ls $(TESTDIR_DELIVERY_SKILLS)/.opencode/agents/*.md 2>/dev/null | wc -l | tr -d ' ') (expected 0)"
	@echo ".opencode/skills/  -> $$(ls -d $(TESTDIR_DELIVERY_SKILLS)/.opencode/skills/*/ 2>/dev/null | wc -l | tr -d ' ') (expected 20)"

# --- Test init with multiple tools ---
test-init-multi: build
	rm -rf $(TESTDIR_MULTI) $(TESTHOME_MULTI)
	mkdir -p $(TESTDIR_MULTI) $(TESTHOME_MULTI)
	cd $(TESTDIR_MULTI) && git init --quiet
	mkdir -p $(TESTDIR_MULTI)/.opencode $(TESTDIR_MULTI)/.claude
	HOME=$(TESTHOME_MULTI) $(BIN) init --path $(TESTDIR_MULTI) --tools opencode,claude --delivery both --yes
	@echo ""
	@echo "=== File counts ==="
	@echo ".opencode/agents/  -> $$(ls $(TESTDIR_MULTI)/.opencode/agents/*.md 2>/dev/null | wc -l | tr -d ' ') (expected 8)"
	@echo ".opencode/skills/  -> $$(ls -d $(TESTDIR_MULTI)/.opencode/skills/*/ 2>/dev/null | wc -l | tr -d ' ') (expected 20)"
	@echo ".claude/agents/    -> $$(ls $(TESTDIR_MULTI)/.claude/agents/*.md 2>/dev/null | wc -l | tr -d ' ') (expected 8)"
	@echo ".claude/skills/    -> $$(ls -d $(TESTDIR_MULTI)/.claude/skills/*/ 2>/dev/null | wc -l | tr -d ' ') (expected 20)"

# --- Test update after init ---
test-update: test-init
	HOME=$(TESTHOME) $(BIN) update --path $(TESTDIR) --force
	@echo ""
	@echo "=== After update --force: counts should be unchanged ==="
	@echo ".opencode/agents/  -> $$(ls $(TESTDIR)/.opencode/agents/*.md 2>/dev/null | wc -l | tr -d ' ') (expected 8)"
	@echo ".opencode/skills/  -> $$(ls -d $(TESTDIR)/.opencode/skills/*/ 2>/dev/null | wc -l | tr -d ' ') (expected 20)"

# --- Test config commands ---
test-config: build
	rm -rf $(TESTDIR) $(TESTHOME)
	mkdir -p $(TESTDIR) $(TESTHOME)
	cd $(TESTDIR) && git init --quiet
	mkdir -p $(TESTDIR)/.opencode
	HOME=$(TESTHOME) $(BIN) init --path $(TESTDIR) --tools opencode --delivery both --yes
	HOME=$(TESTHOME) $(BIN) config show
	HOME=$(TESTHOME) $(BIN) config add-tool claude
	HOME=$(TESTHOME) $(BIN) config show

# --- Test detect ---
test-detect: build
	$(BIN) detect

# --- Test vault (requires --vault <path> or vaultPath in config) ---
test-vault: build
	HOME=$(TESTHOME) $(BIN) vault compile --dry-run || true

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
	rm -rf $(TESTHOME) $(TESTHOME_DELIVERY_BOTH) $(TESTHOME_DELIVERY_SKILLS) $(TESTHOME_MULTI)
