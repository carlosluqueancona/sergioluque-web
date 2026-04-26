export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

const WORKER_BASE =
  process.env.NODE_ENV === 'production'
    ? (process.env.CMS_API_URL ?? 'https://sergioluque-cms.carlosluque-095.workers.dev')
    : 'http://localhost:8787'

const COOKIE_NAME = 'sl_admin_jwt'

function authHeader(req: NextRequest): Record<string, string> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const res = await fetch(`${WORKER_BASE}/admin/obras`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(req) },
      body,
    })
    const data = (await res.json()) as Record<string, unknown>
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Worker unavailable' }, { status: 503 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.text()
    const parsed = JSON.parse(body) as { id?: number }
    if (!parsed.id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const res = await fetch(`${WORKER_BASE}/admin/obras/${parsed.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader(req) },
      body,
    })
    const data = (await res.json()) as Record<string, unknown>
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Worker unavailable' }, { status: 503 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const res = await fetch(`${WORKER_BASE}/admin/obras/${id}`, {
      method: 'DELETE',
      headers: authHeader(req),
    })
    const data = (await res.json()) as Record<string, unknown>
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Worker unavailable' }, { status: 503 })
  }
}
