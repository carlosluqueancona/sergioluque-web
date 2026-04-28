export const runtime = 'edge'

import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getSchema } from '@/lib/admin/schemas'

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

      {rows.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          No records yet. Create the first one.
        </p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'monospace',
            fontSize: '12px',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th
                style={{
                  textAlign: 'left',
                  padding: '8px 12px',
                  color: 'var(--text-muted)',
                  fontWeight: 400,
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  width: '60px',
                }}
              >
                ID
              </th>
              {schema.listColumns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    color: 'var(--text-muted)',
                    fontWeight: 400,
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  {col.label}
                </th>
              ))}
              <th style={{ width: '80px' }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={String(row.id)} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                  {String(row.id)}
                </td>
                {schema.listColumns.map((col) => {
                  const v = row[col.key]
                  let display: string = ''
                  if (v == null) display = '—'
                  else if (typeof v === 'number' && (col.key === 'is_featured')) {
                    display = v === 1 ? '✓' : '—'
                  } else {
                    display = String(v).slice(0, 80)
                  }
                  return (
                    <td key={col.key} style={{ padding: '12px' }}>
                      {display}
                    </td>
                  )
                })}
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <Link
                    href={`/admin/${schema.route}/${row.id}`}
                    style={{ color: 'var(--accent)', fontSize: '11px' }}
                  >
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
