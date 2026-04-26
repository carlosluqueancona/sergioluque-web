// JWT HS256 implementation using Web Crypto API (Edge-compatible)
// Ported from cerostudio_site/functions/api/admin/_shared.js

export const COOKIE_NAME = 'sl_admin_jwt'
export const JWT_EXPIRY_SECONDS = 60 * 60 * 8 // 8 hours

function b64urlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function b64urlDecode(str: string): string {
  const pad = str.length % 4
  const padded = pad ? str + '='.repeat(4 - pad) : str
  return atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
}

export async function signJWT(
  payload: Record<string, unknown>,
  secret: string
): Promise<string> {
  const enc = new TextEncoder()
  const header = b64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = b64urlEncode(JSON.stringify(payload))
  const data = `${header}.${body}`

  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return `${data}.${b64urlEncode(String.fromCharCode(...new Uint8Array(sig)))}`
}

export async function verifyJWT(
  token: string,
  secret: string
): Promise<Record<string, unknown> | null> {
  try {
    const [h, b, s] = token.split('.')
    if (!h || !b || !s) return null

    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const data = `${h}.${b}`
    const sigBytes = Uint8Array.from(b64urlDecode(s), (c) => c.charCodeAt(0))
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(data))
    if (!valid) return null

    const payload = JSON.parse(b64urlDecode(b)) as Record<string, unknown>
    const now = Math.floor(Date.now() / 1000)
    if (typeof payload.exp === 'number' && payload.exp < now) return null

    return payload
  } catch {
    return null
  }
}

export function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET environment variable is not set')
  return secret
}
