import { describe, expect, test } from "bun:test";
import { buildUsageRecord, decodeDataUrl, extractImageDataUrl, slugify } from "./generate-image";

describe("slugify", () => {
  test("lowercases and hyphenates", () => {
    expect(slugify("Neon Fox Portrait!")).toBe("neon-fox-portrait");
  });

  test("falls back to a default for empty input", () => {
    expect(slugify("   ")).toBe("artwork");
  });

  test("truncates long input", () => {
    expect(slugify("a".repeat(100)).length).toBeLessThanOrEqual(60);
  });
});

describe("extractImageDataUrl", () => {
  test("extracts the url from a well-formed response", () => {
    const response = {
      choices: [
        { message: { images: [{ image_url: { url: "data:image/png;base64,abc123" } }] } },
      ],
    };
    expect(extractImageDataUrl(response)).toBe("data:image/png;base64,abc123");
  });

  test("throws when no image is present", () => {
    expect(() => extractImageDataUrl({ choices: [{ message: {} }] })).toThrow();
  });
});

describe("buildUsageRecord", () => {
  test("captures usage metadata without embedding image data", () => {
    const response = {
      id: "gen-123",
      created: 1700000000,
      usage: { prompt_tokens: 42, completion_tokens: 7 },
      provider: "google-ai-studio",
      choices: [
        {
          finish_reason: "stop",
          message: {
            content: "here you go",
            images: [{ image_url: { url: "data:image/png;base64,abc123" } }],
          },
        },
      ],
    };

    const record = buildUsageRecord(response, "google/gemini-3.1-flash-image-preview", "a fox");

    expect(record.id).toBe("gen-123");
    expect(record.model).toBe("google/gemini-3.1-flash-image-preview");
    expect(record.prompt).toBe("a fox");
    expect(record.usage).toEqual({ prompt_tokens: 42, completion_tokens: 7 });
    expect(JSON.stringify(record)).not.toContain("base64");
    expect((record.choices as Array<{ hasImage: boolean }>)[0].hasImage).toBe(true);
  });
});

describe("decodeDataUrl", () => {
  test("decodes a base64 png data url", () => {
    const { buffer, extension } = decodeDataUrl("data:image/png;base64,aGVsbG8=");
    expect(buffer.toString("utf-8")).toBe("hello");
    expect(extension).toBe("png");
  });

  test("normalizes jpeg mime type to a jpg extension", () => {
    const { extension } = decodeDataUrl("data:image/jpeg;base64,aGVsbG8=");
    expect(extension).toBe("jpg");
  });

  test("throws on a malformed data url", () => {
    expect(() => decodeDataUrl("not-a-data-url")).toThrow();
  });
});
