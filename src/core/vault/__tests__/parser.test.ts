/**
 * Unit tests for parseFrontmatter
 *
 * parseFrontmatter is a pure function — no I/O, fully deterministic.
 * Every case has a literal expected value so failures show the exact diff.
 */

import { describe, it, expect } from 'bun:test';
import { parseFrontmatter } from '../loader.js';

describe('parseFrontmatter', () => {
  it('parses standard YAML frontmatter and body', () => {
    const input = `---
name: writer-agent
description: A writing skill
---

# Writer Agent

Some body content.`;

    const { frontmatter, body } = parseFrontmatter(input);

    expect(frontmatter).toEqual({
      name: 'writer-agent',
      description: 'A writing skill',
    });
    expect(body).toBe('# Writer Agent\n\nSome body content.');
  });

  it('returns empty frontmatter and full string as body when no delimiter is present', () => {
    const input = '# No Frontmatter\n\nJust a body.';
    const { frontmatter, body } = parseFrontmatter(input);
    expect(frontmatter).toEqual({});
    expect(body).toBe('# No Frontmatter\n\nJust a body.');
  });

  it('returns empty frontmatter when closing delimiter is missing', () => {
    const input = '---\nname: orphan\n\nNo closing delimiter.';
    const { frontmatter, body } = parseFrontmatter(input);
    expect(frontmatter).toEqual({});
    expect(body).toBe('---\nname: orphan\n\nNo closing delimiter.');
  });

  it('returns empty frontmatter (not null) for malformed YAML', () => {
    const input = `---
: this is invalid yaml: [unclosed
---

Body after bad YAML.`;
    const { frontmatter, body } = parseFrontmatter(input);
    expect(frontmatter).toEqual({});
    expect(body).toBe('Body after bad YAML.');
  });

  it('handles empty frontmatter block', () => {
    const input = `---
---

Body only.`;
    const { frontmatter, body } = parseFrontmatter(input);
    expect(frontmatter).toEqual({});
    expect(body).toBe('Body only.');
  });

  it('preserves all frontmatter field types', () => {
    const input = `---
name: test-skill
version: "3.0"
active: true
count: 42
tags:
  - foo
  - bar
---

Body.`;
    const { frontmatter } = parseFrontmatter(input);
    expect(frontmatter.name).toBe('test-skill');
    expect(frontmatter.version).toBe('3.0');
    expect(frontmatter.active).toBe(true);
    expect(frontmatter.count).toBe(42);
    expect(frontmatter.tags).toEqual(['foo', 'bar']);
  });

  it('trims leading whitespace from body', () => {
    const input = `---
name: x
---


Body starts after blank lines.`;
    const { body } = parseFrontmatter(input);
    expect(body).toBe('Body starts after blank lines.');
  });

  it('handles empty string input', () => {
    const { frontmatter, body } = parseFrontmatter('');
    expect(frontmatter).toEqual({});
    expect(body).toBe('');
  });

  it('handles body that contains --- lines (not treated as delimiters)', () => {
    const input = `---
name: x
---

Before separator.

---

After separator.`;
    const { frontmatter, body } = parseFrontmatter(input);
    expect(frontmatter).toEqual({ name: 'x' });
    expect(body).toContain('Before separator.');
    expect(body).toContain('After separator.');
  });
});
