/**
 * Minimal AWS Signature V4 presigner for Cloudflare R2's S3-compatible API.
 *
 * R2 accepts SigV4 signed requests with `region: "auto"` and the host
 * `<account_id>.r2.cloudflarestorage.com`. We use it here to mint
 * presigned PUT URLs so the browser can upload files larger than the
 * 100 MB Worker request body limit directly to R2.
 *
 * Pure Web Crypto — no SDK, no extra deps.
 */

const enc = new TextEncoder();

async function sha256Hex(data: string | ArrayBuffer): Promise<string> {
  const buf = typeof data === 'string' ? enc.encode(data) : data;
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return toHex(new Uint8Array(hash));
}

async function hmac(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const k = await crypto.subtle.importKey(
    'raw',
    key as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', k, enc.encode(data));
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function rfc3986Encode(s: string): string {
  // encodeURIComponent() leaves `!*'()` un-encoded; SigV4 requires them encoded.
  // It also leaves `~` un-encoded which is correct.
  return encodeURIComponent(s).replace(
    /[!*'()]/g,
    (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase()
  );
}

function encodeS3Path(path: string): string {
  // Encode each path segment but keep the slashes between segments intact.
  return path
    .split('/')
    .map((seg) => rfc3986Encode(seg))
    .join('/');
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function amzDateStamp(date: Date): { dateStamp: string; amzDate: string } {
  const y = date.getUTCFullYear();
  const m = pad2(date.getUTCMonth() + 1);
  const d = pad2(date.getUTCDate());
  const hh = pad2(date.getUTCHours());
  const mm = pad2(date.getUTCMinutes());
  const ss = pad2(date.getUTCSeconds());
  return { dateStamp: `${y}${m}${d}`, amzDate: `${y}${m}${d}T${hh}${mm}${ss}Z` };
}

interface PresignParams {
  accountId: string;
  bucket: string;
  key: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** PUT, GET, … */
  method?: string;
  /** Expiration window in seconds, max 604800 (7 days). Default 300 (5 min). */
  expiresIn?: number;
  /** Optional Content-Type the upload must declare; pinned into the signature. */
  contentType?: string;
}

/**
 * Generate a presigned R2 URL. The browser can hit the returned URL with
 * `fetch(url, { method, body, headers: { 'Content-Type': contentType } })`
 * — the Worker is no longer in the upload path.
 */
export async function presignR2PutUrl(params: PresignParams): Promise<string> {
  const {
    accountId,
    bucket,
    key,
    accessKeyId,
    secretAccessKey,
    method = 'PUT',
    expiresIn = 300,
    contentType,
  } = params;

  const host = `${accountId}.r2.cloudflarestorage.com`;
  const region = 'auto';
  const service = 's3';
  const algorithm = 'AWS4-HMAC-SHA256';

  const now = new Date();
  const { dateStamp, amzDate } = amzDateStamp(now);
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const credential = `${accessKeyId}/${credentialScope}`;

  // Headers signed for presigned URLs: host (always) and content-type (only
  // when we want to bind the request to a specific declared MIME).
  const signedHeaderNames = contentType ? ['content-type', 'host'] : ['host'];
  const signedHeaders = signedHeaderNames.join(';');

  const queryParams: Record<string, string> = {
    'X-Amz-Algorithm': algorithm,
    'X-Amz-Credential': credential,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(expiresIn),
    'X-Amz-SignedHeaders': signedHeaders,
  };

  // Canonical query string: sorted by key, both key and value rfc3986-encoded.
  const canonicalQueryString = Object.keys(queryParams)
    .sort()
    .map((k) => `${rfc3986Encode(k)}=${rfc3986Encode(queryParams[k]!)}`)
    .join('&');

  const canonicalUri = `/${encodeS3Path(`${bucket}/${key}`)}`;

  const canonicalHeaders =
    (contentType ? `content-type:${contentType}\n` : '') + `host:${host}\n`;

  // Presigned URLs use UNSIGNED-PAYLOAD as the hashed body — body is sent
  // separately by the browser.
  const payloadHash = 'UNSIGNED-PAYLOAD';

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join('\n');

  // Derive the signing key (kSigning).
  const kDate = await hmac(enc.encode('AWS4' + secretAccessKey), dateStamp);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  const kSigning = await hmac(kService, 'aws4_request');
  const signature = toHex(new Uint8Array(await hmac(kSigning, stringToSign)));

  const finalQuery = `${canonicalQueryString}&X-Amz-Signature=${signature}`;
  return `https://${host}${canonicalUri}?${finalQuery}`;
}
