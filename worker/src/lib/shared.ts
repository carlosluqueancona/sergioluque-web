import type { Env } from '../types';

// ── JWT helpers (Web Crypto, no Node.js deps) ──────────────────────────────

export function b64urlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function b64urlDecode(str: string): string {
  const pad = str.length % 4;
  const padded = pad ? str + '='.repeat(4 - pad) : str;
  return atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
}

export async function signJWT(
  payload: Record<string, unknown>,
  secret: string
): Promise<string> {
  const enc = new TextEncoder();
  const header = b64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64urlEncode(JSON.stringify(payload));
  const data = `${header}.${body}`;
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return `${data}.${b64urlEncode(String.fromCharCode(...new Uint8Array(sig)))}`;
}

export async function verifyJWT(
  token: string,
  secret: string
): Promise<Record<string, unknown> | null> {
  try {
    const [h, b, s] = token.split('.');
    if (!h || !b || !s) return null;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const rawSig = Uint8Array.from(b64urlDecode(s), (c) => c.charCodeAt(0));
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      rawSig,
      enc.encode(`${h}.${b}`)
    );
    if (!valid) return null;
    const payload = JSON.parse(b64urlDecode(b)) as Record<string, unknown>;
    // RFC 7519: `exp` is seconds since epoch, not milliseconds. The
    // Next-side verifier in src/lib/admin/jwt.ts uses seconds; keep
    // both in lockstep so a token signed by one always validates the
    // same way in the other.
    const nowSec = Math.floor(Date.now() / 1000);
    if (typeof payload['exp'] !== 'number' || payload['exp'] < nowSec) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Password hashing (PBKDF2-SHA-256 via Web Crypto, salted, iterated) ────
//
// Storage format: `pbkdf2$<iter>$<salt_b64url>$<hash_b64url>`
//
// Legacy hashes from before this change were plain unsalted SHA-256 — a
// 64-char lowercase hex string. `verifyPassword` accepts both shapes:
//   - new format: parse + PBKDF2 verify in constant time
//   - legacy:     SHA-256 compare in constant time, but signal the caller
//                 should rehash with the new scheme on the next successful
//                 login (transparent migration).
//
// `hashPassword` always returns the new format. Use it whenever you write
// to admin_users.password_hash going forward.

const PBKDF2_ITER = 600_000; // OWASP 2023 recommendation for PBKDF2-SHA-256
const PBKDF2_KEYLEN = 32;    // 256-bit derived key
const PBKDF2_SALT_LEN = 16;  // 128 bits of salt
const SHA256_HEX_RE = /^[0-9a-f]{64}$/;

function bufToB64Url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (const byte of bytes) s += String.fromCharCode(byte);
  return b64urlEncode(s);
}

function b64UrlToBytes(s: string): Uint8Array {
  return Uint8Array.from(b64urlDecode(s), (c) => c.charCodeAt(0));
}

// Constant-time comparison. Length-checks avoid early-exit and the XOR
// reduction collapses any byte mismatch into the final OR result.
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a[i]! ^ b[i]!;
  return r === 0;
}

async function pbkdf2(
  password: string,
  salt: Uint8Array,
  iterations: number,
  keyLen: number
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
    key,
    keyLen * 8
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(PBKDF2_SALT_LEN));
  const hash = await pbkdf2(password, salt, PBKDF2_ITER, PBKDF2_KEYLEN);
  return `pbkdf2$${PBKDF2_ITER}$${bufToB64Url(salt)}$${bufToB64Url(hash)}`;
}

/**
 * Verifies a plaintext password against a stored hash.
 *
 * Returns:
 *   { ok: true,  needsRehash: false } — match against the current scheme
 *   { ok: true,  needsRehash: true  } — match against legacy SHA-256;
 *                                       caller should rehash and persist
 *   { ok: false }                    — no match
 *
 * Always performs work proportional to the stored format to keep timing
 * roughly stable between unknown-email and bad-password paths.
 */
export async function verifyPassword(
  plain: string,
  stored: string
): Promise<{ ok: true; needsRehash: boolean } | { ok: false }> {
  if (typeof stored !== 'string' || stored.length === 0) return { ok: false };

  if (stored.startsWith('pbkdf2$')) {
    const parts = stored.split('$');
    if (parts.length !== 4) return { ok: false };
    const iter = Number.parseInt(parts[1]!, 10);
    if (!Number.isFinite(iter) || iter < 1) return { ok: false };
    let saltBytes: Uint8Array;
    let expected: Uint8Array;
    try {
      saltBytes = b64UrlToBytes(parts[2]!);
      expected = b64UrlToBytes(parts[3]!);
    } catch {
      return { ok: false };
    }
    const candidate = await pbkdf2(plain, saltBytes, iter, expected.length);
    return timingSafeEqual(candidate, expected)
      ? { ok: true, needsRehash: iter < PBKDF2_ITER }
      : { ok: false };
  }

  // Legacy: bare lowercase hex SHA-256 with no salt. Constant-time
  // compare on the digest, then signal rehash so the next successful
  // login upgrades the row to PBKDF2.
  if (SHA256_HEX_RE.test(stored)) {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(plain));
    const candidate = new Uint8Array(buf);
    const expected = new Uint8Array(32);
    for (let i = 0; i < 32; i++) expected[i] = parseInt(stored.slice(i * 2, i * 2 + 2), 16);
    return timingSafeEqual(candidate, expected)
      ? { ok: true, needsRehash: true }
      : { ok: false };
  }

  return { ok: false };
}

// ── CORS ──────────────────────────────────────────────────────────────────

const DEV_ORIGINS = ['http://localhost:3000', 'http://localhost:3001'];

export function getAllowedOrigins(env: Env): string[] {
  const prod = (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return [...prod, ...DEV_ORIGINS];
}

export function corsHeaders(
  origin: string,
  allowedOrigins: string[],
  methods = 'GET, OPTIONS'
): Record<string, string> {
  const allowed = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] ?? '';
  return {
    'Access-Control-Allow-Origin': allowed ?? '',
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// ── Response helpers ──────────────────────────────────────────────────────

export function json(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

export function jsonError(
  message: string,
  status = 400,
  headers: Record<string, string> = {}
): Response {
  return json({ error: message }, status, headers);
}

// ── Auth ──────────────────────────────────────────────────────────────────

export function extractToken(req: Request): string {
  // Cookie first
  const cookie = req.headers.get('cookie') ?? '';
  const match = /sl_admin_jwt=([^;]+)/.exec(cookie);
  if (match?.[1]) return match[1];
  // Authorization header
  const auth = req.headers.get('authorization') ?? '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return '';
}

export async function requireAuth(
  req: Request,
  env: Env
): Promise<Record<string, unknown> | null> {
  const token = extractToken(req);
  if (!token) return null;
  return verifyJWT(token, env.JWT_SECRET);
}
