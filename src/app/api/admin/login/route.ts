export const runtime = 'edge'

/**
 * Proxy login requests to the Cloudflare Worker admin API.
 * Forwards the Set-Cookie header from the Worker response so the
 * browser gets the httpOnly JWT cookie on the same Next.js origin.
 */
import { NextRequest, NextResponse } from 'next/server'

const WORKER_BASE =
  process.env.NODE_ENV === 'production'
    ? (process.env.CMS_API_URL ?? 'https://sergioluque-cms.carlosluque-095.workers.dev')
    : 'http://localhost:8787'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()

    const workerRes = await fetch(`${WORKER_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })

    const data = (await workerRes.json()) as Record<string, unknown>

    const response = NextResponse.json(data, { status: workerRes.status })

    // Forward Set-Cookie header from Worker so browser stores the JWT cookie
    const setCookie = workerRes.headers.get('Set-Cookie')
    if (setCookie) {
      response.headers.set('Set-Cookie', setCookie)
    }

    return response
  } catch {
    return NextResponse.json({ error: 'Worker unavailable' }, { status: 503 })
  }
}
