/**
 * API client for the Cloudflare Worker CMS API.
 * In production: fetches from https://api.sergioluque.com
 * In development: fetches from http://localhost:8787
 */

const API_BASE =
  process.env.NODE_ENV === 'production'
? (process.env.CMS_API_URL ?? 'https://sergioluque-cms.carlosluque-095.workers.dev')
    : 'http://localhost:8787'

export async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      ...(process.env.NODE_ENV === 'production'
        ? { next: { revalidate: 3600 } }
        : {  }),
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}

export async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T | null> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}
