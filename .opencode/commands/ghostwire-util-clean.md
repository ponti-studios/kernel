---
description: Clean up temporary and generated files
---

# Ghostwire: Util Clean

Clean up temporary and generated files.

## What to Clean

- Build artifacts (dist/, build/)
- Cache files (.cache/, node_modules/.cache)
- Temporary files (*.tmp, *.log)
- IDE files (.idea/, *.swp)
- Dependency caches

## Process

1. **Identify Targets**
   - Find temporary files
   - Find generated files
   - Find caches

2. **Preview**
   - List files to delete
   - Check file sizes
   - Verify safe to delete

3. **Clean**
   - Remove identified files
   - Preserve important data

4. **Verify**
   - Build still works
   - Tests still pass
