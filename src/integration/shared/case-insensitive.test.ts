import { describe, test, expect } from "bun:test";
import {
  findCaseInsensitive,
  includesCaseInsensitive,
  findByNameCaseInsensitive,
  equalsIgnoreCase,
} from "./case-insensitive";

// basic coverage of case-insensitive utilities without any legacy-specific names

describe("findCaseInsensitive", () => {
  test("returns undefined for empty/undefined object", () => {
    const obj = undefined as any;
    const result = findCaseInsensitive(obj, "key");
    expect(result).toBeUndefined();
  });

  test("finds exact match first", () => {
    const obj = { plan: "value" };
    const result = findCaseInsensitive(obj, "plan");
    expect(result).toBe("value");
  });

  test("finds case-insensitive match when no exact match", () => {
    const obj = { plan: "value" };
    const result = findCaseInsensitive(obj, "PLAN");
    expect(result).toBe("value");
  });

  test("returns undefined when key not found", () => {
    const obj = { other: "value" };
    const result = findCaseInsensitive(obj, "plan");
    expect(result).toBeUndefined();
  });
});

describe("includesCaseInsensitive", () => {
  test("returns true for exact match", () => {
    const arr = ["alpha", "beta"];
    const result = includesCaseInsensitive(arr, "alpha");
    expect(result).toBe(true);
  });

  test("returns true for case-insensitive match", () => {
    const arr = ["alpha", "beta"];
    const result = includesCaseInsensitive(arr, "ALPHA");
    expect(result).toBe(true);
  });

  test("returns false when value not found", () => {
    const arr = ["alpha", "beta"];
    const result = includesCaseInsensitive(arr, "gamma");
    expect(result).toBe(false);
  });

  test("returns false for empty array", () => {
    const arr: string[] = [];
    const result = includesCaseInsensitive(arr, "alpha");
    expect(result).toBe(false);
  });
});

describe("findByNameCaseInsensitive", () => {
  test("finds element by exact name", () => {
    const arr = [
      { name: "plan", value: 1 },
      { name: "other", value: 2 },
    ];
    const result = findByNameCaseInsensitive(arr, "plan");
    expect(result).toEqual({ name: "plan", value: 1 });
  });

  test("finds element by case-insensitive name", () => {
    const arr = [
      { name: "plan", value: 1 },
      { name: "other", value: 2 },
    ];
    const result = findByNameCaseInsensitive(arr, "PLAN");
    expect(result).toEqual({ name: "plan", value: 1 });
  });

  test("returns undefined when name not found", () => {
    const arr = [{ name: "plan", value: 1 }];
    const result = findByNameCaseInsensitive(arr, "missing");
    expect(result).toBeUndefined();
  });
});

describe("equalsIgnoreCase", () => {
  test("returns true for same case", () => {
    expect(equalsIgnoreCase("plan", "plan")).toBe(true);
  });

  test("returns true for different case", () => {
    expect(equalsIgnoreCase("plan", "PLAN")).toBe(true);
    expect(equalsIgnoreCase("abc", "ABC")).toBe(true);
  });

  test("returns false for different strings", () => {
    expect(equalsIgnoreCase("plan", "other")).toBe(false);
  });
});
