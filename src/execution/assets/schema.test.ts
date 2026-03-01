import { describe, it, expect } from "bun:test";
import {
  promptAssetSchema,
  type PromptAsset,
  validatePromptAsset,
  validatePromptAssetList,
  detectDuplicateAssetIds,
  serializePromptAsset,
  digestPromptAsset,
  verifyPromptAssetIntegrity,
  canMutatePromptAsset,
} from "./schema";

describe("PromptAsset Schema", () => {
  // Helper to generate valid SHA-256 hex
  const validChecksum = "a".repeat(64);

  // ============================================================================
  // Valid Instances (minimal to comprehensive)
  // ============================================================================

  it("should accept minimal valid asset", () => {
    const asset = {
      id: "test-asset",
      version: "1.0",
      content: "This is a valid prompt asset content that meets minimum length requirements",
      origin: "hand-written" as const,
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(true);
  });

  it("should accept asset with all fields including optional", async () => {
    const asset: PromptAsset = {
      id: "advisor-architecture-profile",
      version: "2.1.3",
      content:
        "Validate architecture for agent-native parity and system cohesion through comprehensive capability mapping",
      origin: "hand-written",
      created: "2025-01-15T12:30:45Z",
      checksum: validChecksum,
      immutable: true,
      tags: ["architecture", "validation", "parity-check"],
      metadata: {
        adapter: "claude-code",
        domains: ["system-design", "architecture"],
      },
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual(["architecture", "validation", "parity-check"]);
    }
  });

  it("should accept generated origin asset", () => {
    const asset = {
      id: "generated-profile-prompt",
      version: "1.0",
      content: "This prompt was generated from a template and instrumentation schema",
      origin: "generated" as const,
      created: "2025-01-20T10:00:00Z",
      checksum: validChecksum,
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(true);
  });

  it("should accept external origin asset", () => {
    const asset = {
      id: "external-best-practices",
      version: "3.2.1",
      content: "Best practices from external documentation and community standards for code review",
      origin: "external" as const,
      created: "2025-01-10T14:20:00Z",
      checksum: validChecksum,
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(true);
  });

  it("should accept synthesized origin asset", () => {
    const asset = {
      id: "synthesized-combined-guidance",
      version: "1.5",
      content: "Combined guidance synthesized from multiple sources and validated through testing",
      origin: "synthesized" as const,
      created: "2025-01-05T09:15:30Z",
      checksum: validChecksum,
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(true);
  });

  it("should accept asset with immutable false", () => {
    const asset = {
      id: "mutable-asset",
      version: "1.0",
      content: "This asset can be mutated at runtime if needed for testing",
      origin: "hand-written" as const,
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
      immutable: false,
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.immutable).toBe(false);
    }
  });

  it("should accept semantic versioning patterns", () => {
    const versions = ["1.0", "2.1.3", "0.1.0-beta", "1.0.0-rc1", "10.20.30"];
    versions.forEach((version) => {
      const asset = {
        id: "versioning-test",
        version,
        content: "Testing various semantic version formats for compatibility",
        origin: "hand-written" as const,
        created: "2025-01-01T00:00:00Z",
        checksum: validChecksum,
      };
      const result = validatePromptAsset(asset);
      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // Invalid Instances (missing/wrong fields/types)
  // ============================================================================

  it("should reject asset missing id", () => {
    const asset = {
      version: "1.0",
      content: "Content without id field",
      origin: "hand-written" as const,
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
    };
    const result = validatePromptAsset(asset as any);
    expect(result.success).toBe(false);
  });

  it("should accept profile with complex lifecycle hints", () => {
    const asset = {
      id: "test-asset",
      version: "1.0",
      content: "Asset with invalid ID pattern containing spaces",
      origin: "hand-written" as const,
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
      immutable: true,
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(false);
  });

  it("should reject id with invalid pattern (underscores)", () => {
    const asset = {
      id: "invalid_asset_id",
      version: "1.0",
      content: "Asset with invalid ID pattern containing underscores",
      origin: "hand-written" as const,
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(false);
  });

  it("should reject id starting with hyphen", () => {
    const asset = {
      id: "-invalid-asset",
      version: "1.0",
      content: "Asset ID starting with hyphen",
      origin: "hand-written" as const,
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(false);
  });

  it("should reject id ending with hyphen", () => {
    const asset = {
      id: "invalid-asset-",
      version: "1.0",
      content: "Asset ID ending with hyphen",
      origin: "hand-written" as const,
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(false);
  });

  it("should reject id too short (< 3 chars)", () => {
    const asset = {
      id: "ab",
      version: "1.0",
      content: "Asset ID that is too short",
      origin: "hand-written" as const,
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(false);
  });

  it("should reject id too long (> 100 chars)", () => {
    const asset = {
      id: "a".repeat(101),
      version: "1.0",
      content: "Asset ID that exceeds maximum length",
      origin: "hand-written" as const,
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(false);
  });

  it("should reject missing version", () => {
    const asset = {
      id: "test-asset",
      content: "Content without version",
      origin: "hand-written" as const,
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
    };
    const result = validatePromptAsset(asset as any);
    expect(result.success).toBe(false);
  });

  it("should reject empty version", () => {
    const asset = {
      id: "test-asset",
      version: "",
      content: "Content with empty version",
      origin: "hand-written" as const,
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(false);
  });

  it("should reject content too short (< 10 chars)", () => {
    const asset = {
      id: "test-asset",
      version: "1.0",
      content: "Short",
      origin: "hand-written" as const,
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(false);
  });

  it("should reject content too long (> 10000 chars)", () => {
    const asset = {
      id: "test-asset",
      version: "1.0",
      content: "x".repeat(10001),
      origin: "hand-written" as const,
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(false);
  });

  it("should reject invalid origin", () => {
    const asset = {
      id: "test-asset",
      version: "1.0",
      content: "Content with invalid origin",
      origin: "invalid-origin" as any,
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(false);
  });

  it("should reject invalid datetime format for created", () => {
    const asset = {
      id: "test-asset",
      version: "1.0",
      content: "Content with invalid datetime",
      origin: "hand-written" as const,
      created: "2025-01-01",
      checksum: validChecksum,
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(false);
  });

  it("should reject invalid checksum format (not hex)", () => {
    const asset = {
      id: "test-asset",
      version: "1.0",
      content: "Content with invalid checksum",
      origin: "hand-written" as const,
      created: "2025-01-01T00:00:00Z",
      checksum: "not-a-valid-hex-string",
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(false);
  });

  it("should reject checksum too short (not 64 chars)", () => {
    const asset = {
      id: "test-asset",
      version: "1.0",
      content: "Content with short checksum",
      origin: "hand-written" as const,
      created: "2025-01-01T00:00:00Z",
      checksum: "abc123",
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(false);
  });

  it("should reject tags with empty string", () => {
    const asset = {
      id: "test-asset",
      version: "1.0",
      content: "Content with invalid tags",
      origin: "hand-written" as const,
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
      tags: ["valid", "", "invalid"],
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(false);
  });

  // ============================================================================
  // Deterministic Serialization
  // ============================================================================

  it("should produce stable JSON serialization", () => {
    const asset: PromptAsset = {
      id: "test-asset",
      version: "1.0",
      content: "This is test content that should serialize consistently",
      origin: "hand-written",
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
      immutable: true,
    };
    const ser1 = serializePromptAsset(asset);
    const ser2 = serializePromptAsset(asset);
    expect(ser1).toBe(ser2);
  });

  it("should produce consistent serialization regardless of tag order", () => {
    const asset1: PromptAsset = {
      id: "test-asset",
      version: "1.0",
      content: "Content with tags",
      origin: "hand-written",
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
      immutable: true,
      tags: ["alpha", "beta", "gamma"],
    };

    const asset2: PromptAsset = {
      ...asset1,
      tags: ["gamma", "alpha", "beta"],
    };

    const ser1 = serializePromptAsset(asset1);
    const ser2 = serializePromptAsset(asset2);
    expect(ser1).toBe(ser2);
  });

  it("should round-trip correctly through parse", () => {
    const asset: PromptAsset = {
      id: "advisor-architecture",
      version: "2.0",
      content: "Validate architecture for agent-native parity and system cohesion",
      origin: "hand-written",
      created: "2025-01-15T12:30:45Z",
      checksum: validChecksum,
      immutable: true,
      tags: ["architecture", "validation"],
    };

    const serialized = serializePromptAsset(asset);
    const parsed = JSON.parse(serialized);
    const validated = validatePromptAsset(parsed);
    expect(validated.success).toBe(true);
    if (validated.success) {
      expect(validated.data.id).toBe(asset.id);
      expect(validated.data.tags).toEqual(asset.tags!.sort());
    }
  });

  // ============================================================================
  // Digest Functions
  // ============================================================================

  it("should produce stable digest for same asset", async () => {
    const asset: PromptAsset = {
      id: "test-asset",
      version: "1.0",
      content: "Content for digest testing",
      origin: "hand-written",
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
      immutable: true,
    };
    const digest1 = await digestPromptAsset(asset);
    const digest2 = await digestPromptAsset(asset);
    expect(digest1).toBe(digest2);
  });

  it("should produce different digest when content changes", async () => {
    const asset1: PromptAsset = {
      id: "test-asset",
      version: "1.0",
      content: "Content version one",
      origin: "hand-written",
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
      immutable: true,
    };

    const asset2: PromptAsset = {
      ...asset1,
      content: "Content version two",
    };

    const digest1 = await digestPromptAsset(asset1);
    const digest2 = await digestPromptAsset(asset2);
    expect(digest1).not.toBe(digest2);
  });

  // ============================================================================
  // Integrity Verification
  // ============================================================================

  it("should verify asset with matching checksum", async () => {
    // Create asset without checksum field
    const baseAsset = {
      id: "test-asset",
      version: "1.0",
      content: "Content for integrity check",
      origin: "hand-written" as const,
      created: "2025-01-01T00:00:00Z",
      immutable: true,
    } as const;

    // Compute the correct checksum for this asset
    const computedChecksum = await digestPromptAsset(baseAsset as any);

    // Update asset with correct checksum
    const asset: PromptAsset = {
      id: baseAsset.id,
      version: baseAsset.version,
      content: baseAsset.content,
      origin: baseAsset.origin,
      created: baseAsset.created,
      checksum: computedChecksum,
      immutable: baseAsset.immutable,
    };

    // Verification should pass
    const isValid = await verifyPromptAssetIntegrity(asset);
    expect(isValid).toBe(true);
  });

  it("should reject asset with mismatched checksum", async () => {
    const asset: PromptAsset = {
      id: "test-asset",
      version: "1.0",
      content: "Content for integrity check",
      origin: "hand-written",
      created: "2025-01-01T00:00:00Z",
      checksum: "0".repeat(64),
      immutable: true,
    };

    const isValid = await verifyPromptAssetIntegrity(asset);
    expect(isValid).toBe(false);
  });

  // ============================================================================
  // Immutability Enforcement
  // ============================================================================

  it("should allow mutation when immutable is false", () => {
    const asset: PromptAsset = {
      id: "mutable-asset",
      version: "1.0",
      content: "Mutable content",
      origin: "hand-written",
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
      immutable: false,
    };
    expect(canMutatePromptAsset(asset)).toBe(true);
  });

  it("should prevent mutation when immutable is true", () => {
    const asset: PromptAsset = {
      id: "immutable-asset",
      version: "1.0",
      content: "Immutable content",
      origin: "hand-written",
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
      immutable: true,
    };
    expect(canMutatePromptAsset(asset)).toBe(false);
  });

  // ============================================================================
  // Batch Validation
  // ============================================================================

  it("should validate list with all valid assets", () => {
    const assets = [
      {
        id: "asset-one",
        version: "1.0",
        content: "First valid test asset",
        origin: "hand-written" as const,
        created: "2025-01-01T00:00:00Z",
        checksum: validChecksum,
      },
      {
        id: "asset-two",
        version: "2.0",
        content: "Second valid test asset",
        origin: "generated" as const,
        created: "2025-01-02T00:00:00Z",
        checksum: validChecksum,
      },
    ];
    const results = validatePromptAssetList(assets);
    expect(results.length).toBe(2);
    expect(results.every((r) => r.isValid)).toBe(true);
  });

  it("should report per-item errors in batch validation", () => {
    const assets = [
      {
        id: "asset-one",
        version: "1.0",
        content: "Valid first asset",
        origin: "hand-written" as const,
        created: "2025-01-01T00:00:00Z",
        checksum: validChecksum,
      },
      {
        id: "invalid",
        version: "1.0",
        content: "Short",
        origin: "hand-written" as const,
        created: "2025-01-02T00:00:00Z",
        checksum: validChecksum,
      },
    ];
    const results = validatePromptAssetList(assets as unknown[]);
    expect(results[0].isValid).toBe(true);
    expect(results[1].isValid).toBe(false);
    expect(results[1].errors.length).toBeGreaterThan(0);
  });

  // ============================================================================
  // Duplicate Detection
  // ============================================================================

  it("should detect duplicate asset in same version", () => {
    const assets: PromptAsset[] = [
      {
        id: "advisor-architecture",
        version: "1.0",
        content: "First version of architecture asset",
        origin: "hand-written",
        created: "2025-01-01T00:00:00Z",
        checksum: validChecksum,
        immutable: true,
      },
      {
        id: "other-asset",
        version: "1.0",
        content: "Other asset",
        origin: "hand-written",
        created: "2025-01-02T00:00:00Z",
        checksum: validChecksum,
        immutable: true,
      },
      {
        id: "advisor-architecture",
        version: "1.0",
        content: "Duplicate with same version",
        origin: "hand-written",
        created: "2025-01-03T00:00:00Z",
        checksum: validChecksum,
        immutable: true,
      },
    ];

    const duplicates = detectDuplicateAssetIds(assets);
    expect(duplicates.length).toBe(1);
    expect(duplicates[0].id).toBe("advisor-architecture");
    expect(duplicates[0].versions).toEqual(["1.0"]);
    expect(duplicates[0].indices).toEqual([0, 2]);
  });

  it("should allow same ID with different versions", () => {
    const assets: PromptAsset[] = [
      {
        id: "advisor-architecture",
        version: "1.0",
        content: "Version 1.0 content",
        origin: "hand-written",
        created: "2025-01-01T00:00:00Z",
        checksum: validChecksum,
        immutable: true,
      },
      {
        id: "advisor-architecture",
        version: "2.0",
        content: "Version 2.0 content with improvements",
        origin: "hand-written",
        created: "2025-01-02T00:00:00Z",
        checksum: validChecksum,
        immutable: true,
      },
    ];

    const duplicates = detectDuplicateAssetIds(assets);
    expect(duplicates.length).toBe(0);
  });

  it("should return empty array when no duplicates", () => {
    const assets: PromptAsset[] = [
      {
        id: "unique-asset-one",
        version: "1.0",
        content: "First unique asset",
        origin: "hand-written",
        created: "2025-01-01T00:00:00Z",
        checksum: validChecksum,
        immutable: true,
      },
      {
        id: "unique-asset-two",
        version: "1.0",
        content: "Second unique asset",
        origin: "generated",
        created: "2025-01-02T00:00:00Z",
        checksum: validChecksum,
        immutable: true,
      },
    ];

    const duplicates = detectDuplicateAssetIds(assets);
    expect(duplicates.length).toBe(0);
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  it("should accept asset with max-length valid content", () => {
    const asset = {
      id: "max-content-asset",
      version: "1.0",
      content: "x".repeat(10000),
      origin: "hand-written" as const,
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(true);
  });

  it("should accept asset with many tags", () => {
    const tags = Array.from({ length: 20 }, (_, i) => `tag-${i}`);
    const asset = {
      id: "many-tags-asset",
      version: "1.0",
      content: "Asset with many discovery tags",
      origin: "hand-written" as const,
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
      tags,
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(true);
  });

  it("should accept asset with hyphenated ID containing numbers", () => {
    const asset = {
      id: "profile-v2-guidance-123",
      version: "1.0",
      content: "Asset with complex hyphenated ID",
      origin: "hand-written" as const,
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(true);
  });

  it("should accept asset with complex metadata", () => {
    const asset: PromptAsset = {
      id: "complex-metadata-asset",
      version: "1.0",
      content: "Asset with nested metadata structure",
      origin: "hand-written",
      created: "2025-01-01T00:00:00Z",
      checksum: validChecksum,
      immutable: true,
      metadata: {
        adapter: "claude-code",
        domains: ["system-design", "architecture"],
        nested: {
          level2: {
            level3: ["deep", "structure"],
          },
        },
      },
    };
    const result = validatePromptAsset(asset);
    expect(result.success).toBe(true);
  });
});
