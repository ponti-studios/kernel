## 1. Install OCLIF and dependencies

- [x] 1.1 Install oclif framework (oclif@5)
- [x] 1.2 Install chalk for colors
- [x] 1.3 Install @oclif/plugin-spinners (not available, use nanospinner)
- [x] 1.4 Install @oclif/plugin-interactive (not available, use inquirer)

## 2. Create OCLIF CLI structure

- [x] 2.1 Create src/cli/main.ts as CLI entry point
- [x] 2.2 Create src/cli/base.ts for shared command logic
- [x] 2.3 Create src/cli/commands/ directory
- [x] 2.4 Configure CLI in package.json

## 3. Rewrite init command

- [x] 3.1 Create src/cli/commands/init.ts with TUI
- [x] 3.2 Add ASCII banner display
- [x] 3.3 Add spinners for detection and generation
- [x] 3.4 Add progress table for file generation
- [x] 3.5 Add success summary with next steps

## 4. Rewrite update command] 4.

- [x1 Create src/cli/commands/update.ts with TUI
- [x] 4.2 Add spinner for checking updates
- [x] 4.3 Add summary table
- [x] 4.4 Add success message

## 5. Rewrite config command

- [x] 5.1 Create src/cli/commands/config.ts with TUI
- [x] 5.2 Use table for config display
- [x] 5.3 Add get/set actions

## 6. Rewrite detect command

- [x] 6.1 Create src/cli/commands/detect.ts with TUI
- [x] 6.2 Add tree/list view for detected tools
- [x] 6.3 Add icons for each tool type

## 7. Add TUI utilities

- [x] 7.1 Create src/cli/ui/colors.ts for chalk theme
- [x] 7.2 Create src/cli/ui/banner.ts for ASCII art
- [x] 7.3 Create src/cli/ui/spinner.ts for spinner helpers
- [x] 7.4 Create src/cli/ui/table.ts for table display
- [x] 7.5 Create src/cli/ui/tree.ts for tree display

## 8. Test and build

- [x] 8.1 Test all commands manually
- [x] 8.2 Run typecheck
- [x] 8.3 Build CLI binary
- [x] 8.4 Verify binary works
