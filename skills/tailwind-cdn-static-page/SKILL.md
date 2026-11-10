---
name: tailwind-cdn-static-page
version: 1.0.0
author: Hermes Agent
description: "Tailwind CDN static HTML pages. Use for landing pages."
license: MIT
tags: [tailwind, html, cdn, import-map, react, static-site, web]
metadata:
  hermes:
    tags: [tailwind, html, cdn, import-map, react, static-site, web]
    related_skills: [web-designs, claude-design]
---

# Single-File HTML Page with Tailwind CDN and CDN-Loaded Dependencies

## When to use

- Landing pages, prototypes, or demos that must run from a single HTML file (no build step, no bundler).
- When the user wants Tailwind styling without a Vite/Webpack setup.
- When embedding a React component (from npm) into a static page via CDN.

## Setup

1. Add Tailwind Play CDN in `<head>`:
   ```html
   <script src="https://cdn.tailwindcss.com"></script>
   ```
2. Define CSS variables in a minimal `<style>` block (colors, shadows). Tailwind config maps these to utility colors:
   ```js
   tailwind.config = {
     theme: {
       extend: {
         colors: {
           bg: "var(--bg)",
           fg: "var(--fg)",
           accent: "var(--accent)",
           line: "var(--line)",
           card: "var(--card)",
         },
         fontFamily: {
           sans: ["Inter", "system-ui", "sans-serif"],
           mono: ["JetBrains Mono", "monospace"],
         },
         boxShadow: { card: "var(--shadow)" },
       },
     },
   };
   ```
3. Use utility classes throughout. Prefer Tailwind classes over inline `style="..."`.

## Consuming npm packages via import maps

For React (or any npm package) loaded from a CDN in a static page:

```html
<script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@18.3.1",
      "react-dom/client": "https://esm.sh/react-dom@18.3.1/client",
      "react/jsx-runtime": "https://esm.sh/react@18.3.1/jsx-runtime",
      "@scope/package": "https://esm.sh/@scope/package@1.0.0?deps=react@18.3.1,react-dom@18.3.1"
    }
  }
</script>
```

### Pitfalls (read before shipping)

- **Import maps are strict JSON**: no trailing commas after the last entry. A trailing comma silently breaks the entire import map — every bare specifier fails to resolve.
- **React version mismatch via esm.sh**: esm.sh resolves `react@>=18` to the latest major (React 19), while `react@18.3.1` pins to 18. If your page uses React 18 but the npm package pulls React 19 from esm.sh, you get `Cannot read properties of null (reading 'useSyncExternalStore')`. Fix: append `?deps=react@18.3.1,react-dom@18.3.1` to the package URL to force esm.sh to use your pinned React version.
- **esm.sh rewrites imports internally**: esm.sh's module response imports `/react@>=18/...` paths, not your import map's `react`. The `?deps` param is the reliable way to align versions — do not rely on the import map alone.
- **Peer dependencies**: npm packages with `peerDependencies` (e.g. React) must have the peer dep available. With esm.sh, the peer dep is auto-resolved; with a local `dist/` file, you must provide React yourself.

## Verification

- Serve locally: `python3 -m http.server 8080` in the site directory.
- Check with headless Chrome: `google-chrome --headless=new --virtual-time-budget=15000 --dump-dom http://127.0.0.1:8080/` — look for rendered `<canvas>` or component output.
- If a component fails to render, check `data-status` attributes or `window.onerror` handlers added temporarily.

## Animated back-and-forth demo pattern

For a "fuzzy text → structured output" demo (e.g., showing extraction results), use CSS animations + JS:

```css
.msg-enter {
  animation: msgSlideIn 0.4s ease-out forwards;
  opacity: 0;
  transform: translateY(12px);
}
@keyframes msgSlideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.mem-enter {
  animation: memFadeIn 0.5s ease-out forwards;
  opacity: 0;
  transform: scale(0.95);
}
@keyframes memFadeIn {
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

JS pattern:

- Define a `conversation` array with `{role, text, delay, memories: [...]}` entries
- `runAnimation()`: iterate turns, `setTimeout` for each message, then `setTimeout` for each memory card (staggered 300ms)
- `clearAll()`: clear timeouts, empty containers, reset stats
- Replay button calls `runAnimation()`
- Auto-start with `setTimeout(runAnimation, 1000)` on page load
- Track stats (counts) that update as items appear

**Pitfall:** Always clear existing timeouts before re-running — otherwise multiple animation chains overlap and produce duplicate cards.

- Dark themes make canvas-based components (orbs, charts) pop. Use `bg-black` with a radial gradient accent: `bg-[radial-gradient(circle_at_50%_0%,rgba(22,199,132,0.15),transparent_60%)]`.
- **Single-orb scroll-driven pattern**: Render one interactive element (orb, chart, 3D object) once, position it fixed/sticky on desktop (inline on mobile), and use `IntersectionObserver` to change its state as content sections scroll into view. Fade it out on sections where it would overlap (e.g. download CTA). This avoids rendering the same component multiple times and creates a cohesive narrative. Mobile: switch from `position: fixed` to `position: relative` with centered layout.
- **User design preference**: Think from first principles — don't just restyle existing layouts. Push creative bounds. The orb/hero element is the centerpiece, not decoration.
- Use `bg-black/95` with `border border-white/10` for glassy card surfaces on dark backgrounds.
- Pill buttons: `rounded-full` with `bg-white text-black` for primary CTAs on dark.
- Font: Inter for body, JetBrains Mono for labels/captions.
