export const runtime = 'edge'

import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getSchema } from '@/lib/admin/schemas'
import { EntityListTable } from '@/components/admin/EntityListTable'

/**
 * Per-entity hidden search keys. listColumns drives what's visible
 * in the table, but the operator usually wants to find by venue or
 * body text too — those columns aren't shown in the row but should
 * match the filter.
 */
const SEARCH_EXTRA: Record<string, string[]> = {
  eventos: ['venue', 'country', 'description', 'body', 'external_link'],
  publicaciones: ['journal', 'doi', 'abstract'],
  catalogue: ['instrumentation', 'notes', 'description', 'year_text'],
  proyectos: ['description', 'slug'],
  posts: ['excerpt', 'tags', 'slug', 'body'],
}

const WORKER_BASE =
  process.env.NODE_ENV === 'production'
    ? (process.env.CMS_API_URL ?? 'https://sergioluque-cms.carlosluque-095.workers.dev')
    : 'http://localhost:8787'

const COOKIE_NAME = 'sl_admin_jwt'

export default async function EntityListPage({
  params,
}: {
  params: Promise<{ entity: string }>
}) {
  const { entity } = await params

  // Obras has its own dedicated UI — handle it separately
  if (entity === 'obras') redirect('/admin/obras')

  const schema = getSchema(entity)
  if (!schema) notFound()

  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) redirect('/admin/login')

  let rows: Record<string, unknown>[] = []
  try {
    const res = await fetch(`${WORKER_BASE}/admin/${schema.name}`, {
      headers: { Authorization: `Bearer ${token}` },
      
    })
    if (res.ok) rows = (await res.json()) as Record<string, unknown>[]
  } catch {
    // ignore
  }

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '20px',
            fontWeight: 700,
            margin: 0,
            letterSpacing: '0.05em',
          }}
        >
          {schema.label}{' '}
          <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '14px' }}>
            ({rows.length})
          </span>
        </h1>
        <Link
          href={`/admin/${schema.route}/new`}
          style={{
            background: 'var(--text-primary)',
            color: 'var(--bg)',
            padding: '8px 16px',
            fontFamily: 'monospace',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textDecoration: 'none',
          }}
        >
          + NEW {schema.labelSingular.toUpperCase()}
        </Link>
      </div>

      <EntityListTable
        rows={rows}
        route={schema.route}
        listColumns={schema.listColumns}
        searchableExtraKeys={SEARCH_EXTRA[schema.name] ?? []}
      />
    </main>
  )
}
