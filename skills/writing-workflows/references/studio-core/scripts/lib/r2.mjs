// Cloudflare R2 (S3-compatible) upload + presigned read URLs, with no SDK.
//
// OpenRouter requires `frame_images` to be a publicly downloadable HTTPS URL, so a
// keyframe has to leave the disk before it can anchor a shot. Presigning avoids the
// public-bucket question entirely: the object stays private and the URL expires.
//
// SigV4 is implemented here rather than pulled in: it is ~80 lines, it is a fixed
// standard, and a skill that needs `npm install` before it can render is not a skill.

const ALGORITHM = 'AWS4-HMAC-SHA256';
const SERVICE = 's3';

const hex = (buf) => Buffer.from(buf).toString('hex');
// Binary-safe: a PNG must be hashed as bytes, not stringified through a text encoder.
const sha256 = async (data) =>
  hex(await crypto.subtle.digest('SHA-256', typeof data === 'string' ? new TextEncoder().encode(data) : data));

async function hmac(key, data) {
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data)));
}

/** RFC 3986 encoding, as SigV4 requires (encode everything but unreserved). */
const uriEncode = (value) =>
  encodeURIComponent(value).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

function amzDate(now) {
  const iso = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  return { long: iso, short: iso.slice(0, 8) };
}

export class R2Error extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'R2Error';
    this.status = status;
  }
}

/**
 * R2 access key IDs are 32 hex characters, but the dashboard and some copy paths
 * prefix them with `ID` (34 chars), which R2's S3 endpoint rejects outright. Strip
 * that prefix when the remainder is exactly an access key, so pasting what the UI
 * shows is enough.
 */
export function normalizeAccessKeyId(value) {
  if (!value) return value;
  const bare = value.trim();
  if (/^[0-9a-fA-F]{32}$/.test(bare)) return bare;
  const stripped = bare.replace(/^ID(?=[0-9a-fA-F]{32}$)/, '');
  return stripped;
}

export function r2Config(env = process.env) {
  const endpoint = env.R2_S3_API_ENDPOINT?.replace(/\/+$/, '');
  return {
    endpoint,
    // R2_ACCES_KEY is the name already in use in ~/.localrc (sic); accept the
    // conventional spelling too, so either works.
    accessKeyId: normalizeAccessKeyId(env.R2_ACCESS_KEY_ID ?? env.R2_ACCES_KEY),
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucket: env.R2_BUCKET ?? 'hominem-storage',
    region: env.R2_REGION ?? 'auto',
  };
}

export function r2Configured(config = r2Config()) {
  return Boolean(config.endpoint && config.accessKeyId && config.secretAccessKey && config.bucket);
}

/**
 * Sign a request. Returns the headers to send. `payloadHash` is the hex SHA-256 of
 * the body (or UNSIGNED-PAYLOAD when the body is streamed).
 */
export async function signRequest({ method, url, headers = {}, payloadHash, config, now = new Date() }) {
  const { endpoint, accessKeyId, secretAccessKey, region } = config;
  const target = new URL(url);
  const { long, short } = amzDate(now);
  const host = target.host;

  const signedHeaders = ['host', 'x-amz-content-sha256', 'x-amz-date'];
  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${long}\n`;
  const canonicalRequest = [
    method,
    target.pathname || '/',
    target.searchParams.toString(),
    canonicalHeaders,
    signedHeaders.join(';'),
    payloadHash,
  ].join('\n');

  const scope = `${short}/${region}/${SERVICE}/aws4_request`;
  const stringToSign = [ALGORITHM, long, scope, await sha256(canonicalRequest)].join('\n');

  let key = await hmac(new TextEncoder().encode(`AWS4${secretAccessKey}`), short);
  key = await hmac(key, region);
  key = await hmac(key, SERVICE);
  key = await hmac(key, 'aws4_request');
  const signature = hex(await hmac(key, stringToSign));

  return {
    ...headers,
    host,
    'x-amz-date': long,
    'x-amz-content-sha256': payloadHash,
    authorization: `${ALGORITHM} Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders.join(';')}, Signature=${signature}`,
  };
}

/** Upload bytes and return the object key. Throws R2Error with the provider message. */
export async function putObject({ key, body, contentType = 'application/octet-stream', config = r2Config(), fetchImpl = globalThis.fetch, now = new Date() }) {
  if (!r2Configured(config)) throw new R2Error('R2 is not configured: set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_S3_API_ENDPOINT and R2_BUCKET', 0);
  const url = `${config.endpoint}/${config.bucket}/${key.split('/').map(uriEncode).join('/')}`;
  const payloadHash = await sha256(body);
  const signed = await signRequest({ method: 'PUT', url, payloadHash, config, now });

  const response = await fetchImpl(url, {
    method: 'PUT',
    headers: { ...signed, 'content-type': contentType, 'content-length': String(body.length) },
    body,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new R2Error(`R2 PUT ${key} failed (${response.status}): ${text.slice(0, 300)}`, response.status);
  }
  return { key, url };
}

/** A time-limited GET URL that needs no public bucket. */
export async function presignGet({ key, expiresSeconds = 3600, config = r2Config(), now = new Date() }) {
  if (!r2Configured(config)) throw new R2Error('R2 is not configured: set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_S3_API_ENDPOINT and R2_BUCKET', 0);
  const { short, long } = amzDate(now);
  const scope = `${short}/${config.region}/${SERVICE}/aws4_request`;
  const host = new URL(config.endpoint).host;
  const path = `/${config.bucket}/${key.split('/').map(uriEncode).join('/')}`;
  const query = [
    ['X-Amz-Algorithm', ALGORITHM],
    ['X-Amz-Credential', `${config.accessKeyId}/${scope}`],
    ['X-Amz-Date', long],
    ['X-Amz-Expires', String(expiresSeconds)],
    ['X-Amz-SignedHeaders', 'host'],
  ]
    .map(([k, v]) => `${uriEncode(k)}=${uriEncode(v)}`)
    .sort()
    .join('&');

  const canonicalRequest = ['GET', path, query, `host:${host}\n`, 'host', 'UNSIGNED-PAYLOAD'].join('\n');
  const stringToSign = [ALGORITHM, long, scope, await sha256(canonicalRequest)].join('\n');
  let key2 = await hmac(new TextEncoder().encode(`AWS4${config.secretAccessKey}`), short);
  key2 = await hmac(key2, config.region);
  key2 = await hmac(key2, SERVICE);
  key2 = await hmac(key2, 'aws4_request');
  const signature = hex(await hmac(key2, stringToSign));

  return `${config.endpoint}${path}?${query}&X-Amz-Signature=${signature}`;
}

/** Upload a local file and return a presigned URL the provider can fetch. */
export async function publishFile({ path, key, contentType, expiresSeconds = 3600, config = r2Config(), fetchImpl = globalThis.fetch, now = new Date() }) {
  const { readFileSync } = await import('node:fs');
  const body = readFileSync(path);
  await putObject({ key, body, contentType, config, fetchImpl, now });
  return presignGet({ key, expiresSeconds, config, now });
}
