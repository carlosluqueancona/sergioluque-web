export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

const WORKER_BASE =
  process.env.NODE_ENV === 'production'
    ? (process.env.CMS_API_URL ?? 'https://sergioluque-cms.carlosluque-095.workers.dev')
    : 'http://localhost:8787'

const COOKIE_NAME = 'sl_admin_jwt'

/**
 * Proxy: ask the Worker to mint a presigned R2 PUT URL so the browser can
 * upload large files (audio, images, PDFs) directly to R2, bypassing the
 * 100 MB Worker request body limit on the legacy /admin/upload endpoint.
 *
 * Body in:  { filename: string, contentType: string }
 * Body out: { uploadUrl, publicUrl, key }
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.text()
    const res = await fetch(`${WORKER_BASE}/admin/upload/presign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
