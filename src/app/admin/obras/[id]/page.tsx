export const runtime = 'edge'

import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ObraForm } from '../ObraForm'

const WORKER_BASE =
  process.env.NODE_ENV === 'production'
    ? (process.env.CMS_API_URL ?? 'https://sergioluque-cms.carlosluque-095.workers.dev')
    : 'http://localhost:8787'

const COOKIE_NAME = 'sl_admin_jwt'

interface ObraRow {
  id: number
  title: string
  slug: string
  year: number
  instrumentation: string
  duration: string
  description: string
  audio_url: string
  image_url: string
  premiere_date: string
  premiere_venue: string
  premiere_city: string
  commissions: string
  ensembles: string
  recorded_at: string
  is_featured: number
  sort_order: number
}

export default async function EditObraPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) redirect('/admin/login')

  let obra: ObraRow | null = null
  try {
    const res = await fetch(`${WORKER_BASE}/admin/obras`, {
      headers: { Authorization: `Bearer ${token}` },
      
    })
    if (res.ok) {
      const all = (await res.json()) as ObraRow[]
      obra = all.find((o) => o.id === Number(id)) ?? null
    }
  } catch {
    // ignore
  }

  if (!obra) notFound()

  const initialData = {
    id: obra.id,
    title: obra.title ?? '',
    slug: obra.slug ?? '',
    year: String(obra.year ?? ''),
    instrumentation: obra.instrumentation ?? '',
    duration: String(obra.duration ?? ''),
    description: obra.description ?? '',
    audio_url: obra.audio_url ?? '',
    image_url: obra.image_url ?? '',
    premiere_date: obra.premiere_date ?? '',
    premiere_venue: obra.premiere_venue ?? '',
    premiere_city: obra.premiere_city ?? '',
    commissions: obra.commissions ?? '',
    ensembles: obra.ensembles ?? '',
    recorded_at: obra.recorded_at ?? '',
    is_featured: obra.is_featured === 1,
    sort_order: String(obra.sort_order ?? 0),
  }

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <Link
        href="/admin/obras"
        style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        ← Back to works
      </Link>
      <h1
        style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: '20px',
          fontWeight: 700,
          margin: '12px 0 32px',
          letterSpacing: '0.05em',
        }}
      >
        Edit work
      </h1>
      <ObraForm initialData={initialData} />
    </main>
  )
}
