import * as yaml from "yaml";

const FRONTMATTER_DELIMITER = "---";

export function parseFrontmatter<
  TFrontmatter extends Record<string, unknown> = Record<string, unknown>,
>(content: string): { frontmatter: TFrontmatter; body: string } {
  if (!content.startsWith(FRONTMATTER_DELIMITER)) {
    return { frontmatter: {} as TFrontmatter, body: content };
  }

  const end = content.indexOf(`\n${FRONTMATTER_DELIMITER}`, FRONTMATTER_DELIMITER.length);
  if (end === -1) {
    return { frontmatter: {} as TFrontmatter, body: content };
  }

  const raw = content.slice(FRONTMATTER_DELIMITER.length, end).trim();
  const body = content.slice(end + FRONTMATTER_DELIMITER.length + 1).trimStart();

  let frontmatter: TFrontmatter = {} as TFrontmatter;
  try {
    frontmatter = (yaml.parse(raw) ?? {}) as TFrontmatter;
  } catch {
    // Malformed frontmatter — treat as empty.
  }

  return { frontmatter, body };
}
