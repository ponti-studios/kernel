#!/bin/bash
# Ghostwire CLI Command Test Script
# Tests all ghostwire CLI commands with various options

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Use direct CLI entry point (bun run src/cli/index.ts)
# Note: bunx ghostwire uses a different binary (chat server)
GHOSTWIRE_CLI="bun run src/cli/index.ts"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Build first to ensure dist is up to date
echo -e "${BLUE}=== Building ghostwire ===${NC}"
bun run build

# Create a temporary directory for test outputs
TEST_DIR=$(mktemp -d)
echo -e "${BLUE}=== Test directory: $TEST_DIR ===${NC}"

# Cleanup function
cleanup() {
    echo -e "${BLUE}=== Cleaning up ===${NC}"
    rm -rf "$TEST_DIR"
}
trap cleanup EXIT

# Track test results
PASSED=0
FAILED=0

# Test function - runs command and checks exit code
test_command() {
    local description="$1"
    local command="$2"
    local expected_exit="${3:-0}"
    
    echo -e "\n${YELLOW}Testing: $description${NC}"
    echo -e "${YELLOW}Command: $command${NC}"
    
    # Run command in subshell to prevent exit
    (
        set +e
        eval "$command" > /dev/null 2>&1
        exit $?
    )
    local actual_exit=$?
    
    if [ "$actual_exit" -eq "$expected_exit" ]; then
        echo -e "${GREEN}✓ PASSED (exit code: $actual_exit)${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED: Expected exit code $expected_exit but got $actual_exit${NC}"
        ((FAILED++))
        return 1
    fi
}

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}  Ghostwire CLI Command Test Suite${NC}"
echo -e "${BLUE}========================================${NC}"

# ============================================
# Test: ghostwire version
# ============================================
test_command "ghostwire version" "$GHOSTWIRE_CLI version"
test_command "ghostwire --version" "$GHOSTWIRE_CLI --version"
test_command "ghostwire --help" "$GHOSTWIRE_CLI --help"

# ============================================
# Test: ghostwire install
# ============================================
test_command "ghostwire install --help" "$GHOSTWIRE_CLI install --help"
test_command "ghostwire install (non-TUI, no providers)" \
    "$GHOSTWIRE_CLI install --no-tui --openai=no --gemini=no --copilot=no --opencode-zen=no --zai-coding-plan=no --kimi-for-coding=no"
test_command "ghostwire install with --local-only" \
    "$GHOSTWIRE_CLI install --no-tui --openai=no --gemini=no --copilot=no --opencode-zen=no --zai-coding-plan=no --kimi-for-coding=no --local-only"
test_command "ghostwire install with --skip-auth" \
    "$GHOSTWIRE_CLI install --no-tui --openai=no --gemini=no --copilot=no --opencode-zen=no --zai-coding-plan=no --kimi-for-coding=no --skip-auth"
test_command "ghostwire install with --install-path" \
    "$GHOSTWIRE_CLI install --no-tui --openai=no --gemini=no --copilot=no --opencode-zen=no --zai-coding-plan=no --kimi-for-coding=no --install-path=$SCRIPT_DIR"

# ============================================
# Test: ghostwire run
# ============================================
test_command "ghostwire run --help" "$GHOSTWIRE_CLI run --help"

# ============================================
# Test: ghostwire get-local-version
# ============================================
test_command "ghostwire get-local-version --help" "$GHOSTWIRE_CLI get-local-version --help"
test_command "ghostwire get-local-version" "$GHOSTWIRE_CLI get-local-version" 1
test_command "ghostwire get-local-version --json" "$GHOSTWIRE_CLI get-local-version --json" 1
test_command "ghostwire get-local-version --directory ." "$GHOSTWIRE_CLI get-local-version --directory ." 1

# ============================================
# Test: ghostwire doctor
# ============================================
test_command "ghostwire doctor --help" "$GHOSTWIRE_CLI doctor --help"
test_command "ghostwire doctor" "$GHOSTWIRE_CLI doctor"
test_command "ghostwire doctor --verbose" "$GHOSTWIRE_CLI doctor --verbose"
test_command "ghostwire doctor --json" "$GHOSTWIRE_CLI doctor --json"

# ============================================
# Test: ghostwire export
# ============================================
test_command "ghostwire export --help" "$GHOSTWIRE_CLI export --help"
test_command "ghostwire export --target copilot" \
    "$GHOSTWIRE_CLI export --target copilot --directory $TEST_DIR/export-copilot"
test_command "ghostwire export --target codex" \
    "$GHOSTWIRE_CLI export --target codex --directory $TEST_DIR/export-codex"
test_command "ghostwire export --target all" \
    "$GHOSTWIRE_CLI export --target all --directory $TEST_DIR/export-all"
test_command "ghostwire export --target all --strict" \
    "$GHOSTWIRE_CLI export --target all --directory $TEST_DIR/export-strict --strict"
test_command "ghostwire export --target all --manifest" \
    "$GHOSTWIRE_CLI export --target all --directory $TEST_DIR/export-manifest --manifest"
test_command "ghostwire export --target all --force" \
    "$GHOSTWIRE_CLI export --target all --directory $TEST_DIR/export-force --force"
test_command "ghostwire export --target copilot --groups instructions" \
    "$GHOSTWIRE_CLI export --target copilot --directory $TEST_DIR/export-groups --groups instructions"
test_command "ghostwire export --target copilot --groups prompts,skills" \
    "$GHOSTWIRE_CLI export --target copilot --directory $TEST_DIR/export-groups-multi --groups prompts,skills"

# ============================================
# Test: ghostwire sync-models
# ============================================
test_command "ghostwire sync-models --help" "$GHOSTWIRE_CLI sync-models --help" 0
test_command "ghostwire sync-models" "$GHOSTWIRE_CLI sync-models" 0

# ============================================
# Test: ghostwire mcp
# ============================================
test_command "ghostwire mcp --help" "$GHOSTWIRE_CLI mcp --help" 0

# ============================================
# Summary
# ============================================
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}  Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo -e "Total:  $((PASSED + FAILED))"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}Some tests failed!${NC}"
    exit 1
fi
