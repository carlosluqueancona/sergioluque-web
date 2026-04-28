export const runtime = 'edge'

import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getSchema } from '@/lib/admin/schemas'
import { GenericForm } from '@/components/admin/GenericForm'

const WORKER_BASE =
  process.env.NODE_ENV === 'production'
    ? (process.env.CMS_API_URL ?? 'https://sergioluque-cms.carlosluque-095.workers.dev')
    : 'http://localhost:8787'

const COOKIE_NAME = 'sl_admin_jwt'

export default async function EditEntityPage({
  params,
}: {
  params: Promise<{ entity: string; id: string }>
}) {
  const { entity, id } = await params
  const schema = getSchema(entity)
  if (!schema) notFound()

  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) redirect('/admin/login')

  let row: Record<string, unknown> | null = null
  try {
    const res = await fetch(`${WORKER_BASE}/admin/${schema.name}`, {
      headers: { Authorization: `Bearer ${token}` },
      
    })
    if (res.ok) {
      const all = (await res.json()) as Record<string, unknown>[]
      row = all.find((r) => String(r.id) === id) ?? null
    }
  } catch {
    // ignore
  }

  if (!row) notFound()

  // Convert datetime fields from SQL format to <input type="datetime-local"> format
  const normalized: Record<string, unknown> = { ...row }
  for (const field of schema.fields) {
    if (field.type === 'datetime' && typeof row[field.key] === 'string') {
      const v = row[field.key] as string
      normalized[field.key] = v.replace(' ', 'T').slice(0, 16)
    }
    if (field.type === 'date' && typeof row[field.key] === 'string') {
      normalized[field.key] = (row[field.key] as string).slice(0, 10)
    }
  }

  return (
    <main style={{ maxWidth: 800, margin: '0 auto' }}>
      <Link
        href={`/admin/${schema.route}`}
        style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        ← Back to {schema.label}
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
        Edit {schema.labelSingular.toLowerCase()}{' '}
        <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 400 }}>
          #{id}
        </span>
      </h1>
      <GenericForm schema={schema} initialData={normalized} />
    </main>
  )
}
