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
    if (typeof payload['exp'] !== 'number' || payload['exp'] < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── SHA-256 password hashing (no bcrypt in Workers) ───────────────────────

export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(password));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
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
