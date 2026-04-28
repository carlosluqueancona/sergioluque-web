export const runtime = 'edge'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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
  is_featured: number
  sort_order: number
}

export default async function AdminObrasPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) redirect('/admin/login')

  let obras: ObraRow[] = []
  try {
    const res = await fetch(`${WORKER_BASE}/admin/obras`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.status === 401) redirect('/admin/login')
    if (res.ok) {
      obras = (await res.json()) as ObraRow[]
    }
  } catch {
    // Worker unreachable — show empty state
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.1em', margin: 0, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
          Works ({obras.length})
        </h1>
        <Link
          href="/admin/obras/new"
          style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            letterSpacing: '0.1em',
            color: 'var(--bg)',
            background: 'var(--text-primary)',
            textDecoration: 'none',
            padding: '8px 16px',
            textTransform: 'uppercase',
          }}
        >
          + New work
        </Link>
      </div>

      {obras.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '13px' }}>
          No works yet. Create the first one with the button above.
        </p>
      )}

      {obras.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 400 }}>Title</th>
              <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 400 }}>Year</th>
              <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 400 }}>Featured</th>
              <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 400 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {obras.map((obra) => (
              <tr key={obra.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 0', color: 'var(--text-primary)' }}>{obra.title}</td>
                <td style={{ padding: '12px 0', color: 'var(--text-muted)' }}>{obra.year}</td>
                <td style={{ padding: '12px 0', color: 'var(--text-muted)' }}>{obra.is_featured ? '★' : '—'}</td>
                <td style={{ padding: '12px 0' }}>
                  <Link
                    href={`/admin/obras/${obra.id}`}
                    style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--accent)', textDecoration: 'none', marginRight: '16px' }}
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
