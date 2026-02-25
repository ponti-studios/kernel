# Workflows Create

Generate a structured task graph for the requested feature with fields:
id, subject, description, category, skills, estimatedEffort, status, blockedBy, blocks, wave.

Requirements:
- Build dependency-correct `blockedBy` and `blocks` edges.
- Assign categories from: visual-engineering, ultrabrain, quick, deep, artistry, writing, unspecified-low, unspecified-high.
- Favor parallelizable waves where dependencies permit.
