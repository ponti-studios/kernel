# Dashboard Layout Patterns (Vercel Design System)

Patterns for building Monitor-surface dashboards (test indices, status pages, API documentation) using the Vercel design system. Use when the user wants a dashboard, not a landing page.

## Layout: Sidebar + Main Content

```css
.dashboard {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
}
.sidebar {
  background: #fafafa;
  border-right: 1px solid #ebebeb;
  padding: 24px;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}
.main {
  padding: 40px;
}
```

- Sidebar: sticky, full-height, scrollable. Contains navigation links with badges.
- Main: scrollable content area with stats, categories, and cards.

## Stats Grid (4 columns)

```css
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 40px;
}
.stat-card {
  background: #fff;
  border-radius: 8px;
  box-shadow:
    0px 0px 0px 1px rgba(0, 0, 0, 0.08),
    0px 2px 2px rgba(0, 0, 0, 0.04),
    0px 0px 0px 1px #fafafa;
  padding: 20px;
}
.stat-value {
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -1.28px;
  color: #171717;
}
.stat-label {
  font-size: 12px;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}
```

## Test/Card Grid (2 columns)

```css
.test-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.test-card {
  background: #fff;
  border-radius: 8px;
  box-shadow:
    0px 0px 0px 1px rgba(0, 0, 0, 0.08),
    0px 2px 2px rgba(0, 0, 0, 0.04),
    0px 0px 0px 1px #fafafa;
  padding: 20px;
  text-decoration: none;
  color: inherit;
  display: block;
  transition: box-shadow 0.15s;
}
.test-card:hover {
  box-shadow:
    0px 0px 0px 1px rgba(0, 0, 0, 0.12),
    0px 4px 8px rgba(0, 0, 0, 0.06),
    0px 0px 0px 1px #fafafa;
}
```

## Syntax-Highlighted Code Preview

```css
.code-preview {
  background: #fafafa;
  border-radius: 6px;
  padding: 12px;
  font-family: "Geist Mono", monospace;
  font-size: 12px;
  color: #4d4d4d;
  margin-top: 12px;
  overflow: hidden;
  max-height: 80px;
  position: relative;
}
.code-preview::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
  background: linear-gradient(transparent, #fafafa);
}
.syntax-key {
  color: #0a72ef;
} /* blue for keywords */
.syntax-str {
  color: #de1d8d;
} /* pink for strings */
.syntax-num {
  color: #ff5b4f;
} /* red for numbers */
```

## Category Headers

```css
.category-header {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 32px 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebebeb;
}
```

## Responsive

```css
@media (max-width: 1024px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
  .sidebar {
    position: relative;
    height: auto;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .test-grid {
    grid-template-columns: 1fr;
  }
}
```

## Key Rules

1. A dashboard is a **Monitor** surface — density and glanceability beat a hero. No centered hero, no three feature cards.
2. Use real data from the system (actual test counts, timing, pass rates) instead of invented numbers.
3. Code previews should show the actual API call, not placeholder text.
4. Sidebar navigation should be sticky and scrollable for long lists.
5. Every card should link to a detail page.
6. Use `// Returns:` comments replaced with exact JSON objects showing the full response structure.
