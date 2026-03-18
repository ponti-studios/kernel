## Why

The current name "ghostwire" is:
- Long (9 characters)
- Hard to type quickly
- Confusing branding (what does it mean?)
- Doesn't reflect the expanded vision

The new name "jinn" is:
- Short (4 characters)
- Easy to type, great for CLI
- Magical, wish-granting connotation
- Works across all languages
- Appealing to both technical and non-technical users

This rebrand positions jinn as a general-purpose AI assistant for all personal computing tasks, not just coding.

## What Changes

- Rename npm package from `@hackefeller/ghostwire` to `@hackefeller/jinn`
- Rename CLI binary from `ghostwire` to `jinn`
- Rename config directory from `.ghostwire` to `.jinn`
- Update command prefix from `/ghostwire:` to `/jinn:`
- Update all source code references
- Update documentation and examples
- Version bump to 0.0.1 (first release)

## Capabilities

### Modified Capabilities

- `cli-binaries`: Changed from ghostwire to jinn
- `config-format`: Changed from .ghostwire/ to .jinn/
- `command-prefix`: Changed from /ghostwire: to /jinn:

## Impact

- Package name changes (breaking change for existing users)
- CLI users need to use `jinn` instead of `ghostwire`
- Existing installations will need to migrate config
- All generated files use new paths
