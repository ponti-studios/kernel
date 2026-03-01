import { renderProfileUsage } from "../profiles";

export const CODE_OPTIMIZE_TEMPLATE = `# Code:Optimize Command
Improve performance, reduce bundle size, or enhance runtime efficiency.
## Optimization Areas
- **Algorithmic** - Better algorithms and data structures
- **Memory** - Reduce allocations and improve garbage collection
- **CPU** - Cache-friendly code, vectorization
- **Network** - Reduce requests, optimize payload sizes
- **Build** - Faster compilation and bundling
- **Runtime** - Lazy loading, code splitting
## Key Profiles & Tasks
${renderProfileUsage(["oracle_performance"])}
- Measure performance before and after optimizations
- Profile code to identify actual bottlenecks
- Prioritize high-impact optimizations
- Ensure optimizations don't harm readability
## Verification
- Benchmark improvements with concrete metrics
- Run full test suite
- Check production-like environment behavior
- Monitor for regressions
<optimization-target>
$ARGUMENTS
</optimization-target>`;
