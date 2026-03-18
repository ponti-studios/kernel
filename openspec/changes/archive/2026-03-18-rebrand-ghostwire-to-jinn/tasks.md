## 1. Update package.json

- [x] 1.1 Update name to @hackefeller/jinn
- [x] 1.2 Update version to 0.0.1
- [x] 1.3 Update bin to jinn

## 2. Update CLI code

- [x] 2.1 Update src/cli/main.ts name and description
- [x] 2.2 Update CLI program name to jinn

## 3. Update config paths

- [x] 3.1 Update config directory constant (.ghostwire → .jinn)
- [x] 3.2 Update CLI commands to use new config path
- [x] 3.3 Update generator paths

## 4. Update templates

- [x] 4.1 Update command prefix (/ghostwire: → /jinn:)
- [x] 4.2 Update skill names (ghostwire-* → jinn-*)
- [x] 4.3 Update generated file names

## 5. Update CLI output

- [x] 5.1 Update banner text
- [x] 5.2 Update help text
- [x] 5.3 Update example commands

## 6. Test

- [x] 6.1 Build CLI
- [x] 6.2 Test init command
- [x] 6.3 Test detect command
- [x] 6.4 Test config command
- [x] 6.5 Test update command

## 7. Cleanup

- [x] 7.1 Remove old dist/ghostwire if exists
- [x] 7.2 Verify binary is named jinn
