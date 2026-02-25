---
name: Parallel Execution
description: Execute independent tasks concurrently while preserving dependency safety.
---

1. Partition tasks by dependency wave.
2. Run each wave concurrently.
3. Enforce validation barrier before advancing to next wave.
