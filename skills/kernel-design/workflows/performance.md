# Performance Workflow

Use this workflow for a performance or stability change in a web UI. Treat
performance as an accessibility requirement: slow input, delayed content, and
layout movement disproportionately affect low-end devices and users with access
needs.

## 1. Establish Scope

Record:

- Route, screen, or component under investigation.
- Primary user task and first meaningful interaction.
- Rendering model: server-rendered, statically generated, client-rendered, or
  hybrid.
- Target device: mid-tier mobile device or an equivalent emulation profile.
- Network profile: slow 4G throttling for lab measurement.
- Build mode: production build with source maps available for diagnosis.

Do not optimize from a desktop development build alone.

## 2. Measure Before Changing Code

Capture a production-like baseline with Lighthouse, Chrome DevTools, or field
telemetry. Record the metric, value, test conditions, and evidence location.

Use these budgets:

| Metric | Budget | What to inspect |
| --- | --- | --- |
| LCP | <= 2.5s | Largest above-the-fold text or image and its request chain |
| INP | <= 200ms | Slowest user interaction and the event-to-paint breakdown |
| CLS | <= 0.1 | Elements that move after first render |
| TTFB | <= 800ms target | Server, edge, cache, and document response timing |

Use p75 field data when available. If field data is unavailable, use at least
three repeatable lab runs and report the test profile. Do not claim a metric
passes from a single run.

Classify the bottleneck before selecting a fix:

- **LCP:** server response, render-blocking resource, request priority, font,
  image, or client-rendered above-fold content.
- **INP:** long JavaScript task, excessive rerender, synchronous work in an
  event handler, expensive layout, or input blocked by animation.
- **CLS:** missing dimensions, late fonts, injected content, changing text,
  or state changes that alter geometry.
- **Runtime cost:** unnecessary JavaScript, duplicated dependencies, oversized
  shared UI imports, or components initialized before interaction.

## 3. Apply Fixes In Order

### Loading and LCP

1. Render the above-fold structure in the server or static output when the
   framework supports it.
2. Keep the LCP element discoverable in the initial document. Do not create the
   primary heading or hero image only after client hydration.
3. Remove or defer non-critical scripts and styles. Code-split by route and
   lazy-load heavy widgets, charts, editors, and dialogs until needed.
4. Preload only resources proven to be critical. Preload at most the required
   font weight and the actual LCP media; do not preload an entire font family.
5. Use responsive image sources, explicit dimensions, modern formats, and
   appropriate fetch priority. Do not lazy-load the LCP image.
6. Reduce server and cache latency before adding client-side loading logic.

### Layout Stability and CLS

1. Give images, video, embeds, avatars, and async widgets final dimensions or
   an `aspect-ratio` before their content loads.
2. Size skeletons to the final component geometry. A skeleton must not be a
   different layout from the loaded state.
3. Reserve space for banners, validation messages, fonts, and asynchronous
   content. Do not insert content above existing content without reserved
   space.
4. Keep borders, focus rings, selected states, and loading indicators paint-only
   when the same information can be conveyed without changing dimensions.
5. Use the spacing, sizing, and component tokens exported by
   `@ponti-studios/ui`; do not introduce local layout values to mask movement.

### Interaction and INP

1. Keep event handlers short. Move non-urgent work out of the input path and
   schedule it after the interaction where possible.
2. Split long tasks. Avoid parsing, sorting, filtering, or serialization of
   large data sets synchronously during pointer or keyboard events.
3. Prevent unnecessary rerenders by narrowing state ownership and subscriptions.
4. Use CSS for simple state styling. Do not use JavaScript to animate hover,
   focus, selected, or pressed states.
5. Virtualize long lists and tables. Use the approved library in
   `references/ui-libraries.md` when the task requires virtualization.
6. Import shared UI components and utilities per component where supported so
   unused code can be tree-shaken.

### Animation

- Animate only `transform` and `opacity` for repeated or interactive motion.
- Use the motion tokens exported by `@ponti-studios/ui` where available.
- Keep transitions within 100-300ms unless a documented interaction requires
  another duration.
- Do not use `will-change` by default. Add it only for a measured compositor
  bottleneck and remove it when the motion ends if the platform requires that.
- Do not animate layout properties such as `width`, `height`, `top`, `left`,
  `margin`, or `padding` in high-frequency interactions.
- Respect `prefers-reduced-motion`; reduce or remove non-essential motion.
- Do not add an animation library for a CSS transition or state change.

### Shared UI Runtime Cost

- Use `@ponti-studios/ui` components and tokens as the visual source of truth.
- Check that the selected component does not initialize expensive behavior
  before it is visible or interactive.
- Avoid importing a full icon, chart, editor, or animation package when a
  per-component import is available.
- Do not duplicate a shared component locally to make a small performance
  change. Measure the shared component, then fix or extend it at its owner.
- Preserve accessibility and semantic states while reducing runtime cost.

## 4. Verify The Change

Run the same production-like test profile used for the baseline. Compare the
same route, viewport, network, CPU, and interaction. Verify:

- LCP is <= 2.5s or has improved with a documented remaining cause.
- INP is <= 200ms for the tested interaction or has improved with a documented
  remaining cause.
- CLS is <= 0.1 and no load-time layout shift remains unexplained.
- The first meaningful interaction remains responsive under slow 4G and 4x CPU
  throttling.
- Skeletons, images, media, and async regions reserve final space.
- Repeated animation uses compositor-friendly properties only.
- Reduced-motion behavior still works.
- Keyboard focus, disabled behavior, semantic states, and contrast still pass.

If a budget still fails, report the remaining bottleneck and evidence. Do not
mark the workflow complete because a code change was made.

## Output

Return:

1. Baseline: metric values, route, device, network, build, and tool.
2. Diagnosis: the measured bottleneck and its cause.
3. Changes: the smallest fixes applied and why they address the cause.
4. Verification: post-change values under the same conditions.
5. Remaining risk: unresolved budget failures, missing field data, or follow-up
   measurement required.
