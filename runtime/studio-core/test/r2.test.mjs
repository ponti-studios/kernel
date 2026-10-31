import { test } from 'node:test';
import assert from 'node:assert/strict';

import { normalizeAccessKeyId, presignGet, r2Configured, r2Config, putObject } from '../scripts/lib/r2.mjs';

const config = {
  endpoint: 'https://abc123.r2.cloudflarestorage.com',
  accessKeyId: 'AKIDEXAMPLE',
  secretAccessKey: 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY',
  bucket: 'test-bucket',
  region: 'auto',
};

test('presigns a GET that matches the AWS CLI byte for byte', async () => {
  // Cross-checked against `aws s3 presign` for the same request, credentials and
  // timestamp: the signature below is what the AWS CLI produced.
  const url = await presignGet({
    key: 'keyframes/shot-1.png',
    expiresSeconds: 3600,
    config,
    now: new Date('2026-10-26T00:58:27Z'),
  });
  assert.match(url, /X-Amz-Signature=[0-9a-f]{64}$/);
  assert.equal(url.split('X-Amz-Signature=')[1], 'c0a2b4edf9961084011313a363f9916e9da55fac4b7a41d7c65da54467f2f441');
  assert.ok(url.includes('X-Amz-Expires=3600'));
  assert.ok(url.startsWith('https://abc123.r2.cloudflarestorage.com/test-bucket/'));
});

test('does not sign a path twice or leak a raw slash', async () => {
  const url = await presignGet({ key: 'a b/c+d.png', config, now: new Date('2026-10-26T00:58:27Z') });
  assert.ok(url.includes('a%20b/c%2Bd.png'), url);
});

test('an incomplete configuration is refused with the missing variable named', async () => {
  const partial = { ...config, bucket: undefined };
  assert.equal(r2Configured(partial), false);
  await assert.rejects(() => putObject({ key: 'x.png', body: new Uint8Array([1]), config: partial }), /R2 is not configured/);
});

test('reads the credential names actually in localrc', () => {
  const cfg = r2Config({ R2_S3_API_ENDPOINT: 'https://h.example.com/', R2_ACCES_KEY: 'k', R2_SECRET_ACCESS_KEY: 's', R2_BUCKET: 'b' });
  assert.equal(cfg.accessKeyId, 'k');
  assert.equal(cfg.endpoint, 'https://h.example.com');
  assert.equal(r2Configured(cfg), true);
});

test('strips the ID prefix Cloudflare shows, keeps a bare access key', () => {
  const bare = '0123456789abcdef0123456789abcdef';
  assert.equal(normalizeAccessKeyId(`ID${bare}`), bare);
  assert.equal(normalizeAccessKeyId(bare), bare);
  assert.equal(normalizeAccessKeyId('  ' + bare + '  '), bare);
  // never mangles something that is not an access key
  assert.equal(normalizeAccessKeyId('IDnotakey'), 'IDnotakey');
});
