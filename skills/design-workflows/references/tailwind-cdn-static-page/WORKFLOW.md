# Single-File HTML Page with Tailwind CDN and CDN-Loaded Dependencies

## When to use

- Landing pages, prototypes, or demos that must run from a single HTML file (no build step, no bundler).
- When the user wants Tailwind styling without a Vite/Webpack setup.
- When embedding a React component (from npm) into a static page via CDN.

This procedure covers CDN mechanics only (Tailwind Play CDN, import maps, local verification). For the design process and taste (brief, variants, visual direction) use the `claude-design` skill; for a known brand's visual language use [web-designs](../web-designs/WORKFLOW.md); for a project with a shared design system use [kernel-design](../kernel-design/WORKFLOW.md).

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
