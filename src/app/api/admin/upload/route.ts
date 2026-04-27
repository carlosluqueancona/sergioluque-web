export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

const WORKER_BASE =
  process.env.NODE_ENV === 'production'
    ? (process.env.CMS_API_URL ?? 'https://sergioluque-cms.carlosluque-095.workers.dev')
    : 'http://localhost:8787'

const COOKIE_NAME = 'sl_admin_jwt'

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = req.nextUrl.searchParams.get('url')
    if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })

    const res = await fetch(`${WORKER_BASE}/admin/upload?url=${encodeURIComponent(url)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = (await res.json()) as Record<string, unknown>
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Worker unavailable' }, { status: 503 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Forward the multipart body as-is to the Worker
    const body = await req.arrayBuffer()
    const contentType = req.headers.get('content-type') ?? 'multipart/form-data'

    const res = await fetch(`${WORKER_BASE}/admin/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        Authorization: `Bearer ${token}`,
      },
      body,
    })

    const data = (await res.json()) as Record<string, unknown>
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Worker unavailable' }, { status: 503 })
  }
}
