import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { hasReportedCost, mergeUsage, normalizeUsage } from '../scripts/lib/usage.mjs';

describe('normalizeUsage', () => {
  it('reads raw snake_case usage from image and video responses', () => {
    assert.deepEqual(
      normalizeUsage({
        cost: 0.018,
        prompt_tokens: 12,
        completion_tokens: 1088,
        total_tokens: 1100,
        completion_tokens_details: { image_tokens: 1024 },
      }),
      {
        costUsd: 0.018,
        promptTokens: 12,
        completionTokens: 1088,
        totalTokens: 1100,
        imageTokens: 1024,
      },
    );
  });

  it('reads camelCase usage as an SDK hands it back', () => {
    assert.deepEqual(
      normalizeUsage({
        costUsd: 0.0012,
        promptTokens: 40,
        completionTokens: 12,
        totalTokens: 52,
        promptTokensDetails: { cachedTokens: 32 },
        completionTokensDetails: { reasoningTokens: 4 },
      }),
      {
        costUsd: 0.0012,
        promptTokens: 40,
        completionTokens: 12,
        totalTokens: 52,
        cachedPromptTokens: 32,
        reasoningTokens: 4,
      },
    );
  });

  it('returns undefined when there is no usage block', () => {
    assert.equal(normalizeUsage(undefined), undefined);
    assert.equal(normalizeUsage(null), undefined);
    assert.equal(normalizeUsage({}), undefined);
  });

  it('ignores values that are not finite numbers', () => {
    assert.equal(normalizeUsage({ cost: 'free', prompt_tokens: Number.NaN }), undefined);
    assert.equal(normalizeUsage({ cost: Number.POSITIVE_INFINITY }), undefined);
  });

  it('never invents a zero cost', () => {
    // 0 is a real reported price (a free model); absence must stay absent.
    assert.deepEqual(normalizeUsage({ cost: 0 }), { costUsd: 0 });
    assert.equal(hasReportedCost(normalizeUsage({ cost: 0 })), true);
    assert.equal(hasReportedCost(normalizeUsage({ prompt_tokens: 5 })), false);
    assert.equal(hasReportedCost(undefined), false);
  });

  it('distinguishes an absent cost from a zero cost', () => {
    const absent = normalizeUsage({ prompt_tokens: 5, completion_tokens: 5 });
    const zero = normalizeUsage({ cost: 0, prompt_tokens: 5, completion_tokens: 5 });
    assert.equal('costUsd' in absent, false);
    assert.equal('costUsd' in zero, true);
    assert.equal(absent.costUsd, undefined);
    assert.equal(zero.costUsd, 0);
    assert.notDeepEqual(absent, zero);
  });
});

describe('mergeUsage', () => {
  it('keeps the first reported value per field', () => {
    assert.deepEqual(mergeUsage({ promptTokens: 10 }, { promptTokens: 99, costUsd: 0.084 }), {
      promptTokens: 10,
      costUsd: 0.084,
    });
  });

  it('fills missing fields from later blocks', () => {
    assert.deepEqual(
      mergeUsage(undefined, { totalTokens: 5 }, { totalTokens: 99, costUsd: 0.01 }),
      { totalTokens: 5, costUsd: 0.01 },
    );
  });

  it('treats a reported zero as a value, not as missing', () => {
    assert.deepEqual(mergeUsage({ costUsd: 0 }, { costUsd: 0.5 }), { costUsd: 0 });
  });

  it('returns undefined when nothing was reported', () => {
    assert.equal(mergeUsage(undefined, undefined), undefined);
    assert.equal(mergeUsage({}, {}), undefined);
  });
});
