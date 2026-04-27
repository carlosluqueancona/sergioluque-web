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
  title_es: string
  title_en: string
  slug_es: string
  year: number
  is_featured: number
  sort_order: number
}

export default async function AdminObrasPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) redirect('/admin/login')

  // Fetch obras from Worker admin API
  let obras: ObraRow[] = []
  let debugInfo = ''
  try {
    const res = await fetch(`${WORKER_BASE}/admin/obras`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    debugInfo = `status=${res.status} url=${WORKER_BASE}/admin/obras`
    if (res.status === 401) redirect('/admin/login')
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data)) {
        obras = data as ObraRow[]
        debugInfo += ` rows=${obras.length}`
      } else {
        debugInfo += ` notArray=${JSON.stringify(data).slice(0, 100)}`
      }
    } else {
      debugInfo += ` body=${(await res.text()).slice(0, 100)}`
    }
  } catch (err) {
    debugInfo = `fetchError=${err instanceof Error ? err.message : String(err)}`
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.1em', margin: 0, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
          Obras ({obras.length})
        </h1>
        <Link
          href="/admin/obras/nueva"
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
          + Nueva Obra
        </Link>
      </div>

      {obras.length === 0 && (
        <>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '13px' }}>
            No hay obras todavía. Crea la primera con el botón de arriba.
          </p>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '10px', marginTop: '24px', opacity: 0.5 }}>
            DEBUG: {debugInfo}
          </p>
        </>
      )}

      {obras.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 400 }}>Título ES</th>
              <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 400 }}>Año</th>
              <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 400 }}>Destacada</th>
              <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 400 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {obras.map((obra) => (
              <tr key={obra.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 0', color: 'var(--text-primary)' }}>{obra.title_es}</td>
                <td style={{ padding: '12px 0', color: 'var(--text-muted)' }}>{obra.year}</td>
                <td style={{ padding: '12px 0', color: 'var(--text-muted)' }}>{obra.is_featured ? '★' : '—'}</td>
                <td style={{ padding: '12px 0' }}>
                  <Link
                    href={`/admin/obras/${obra.id}`}
                    style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--accent)', textDecoration: 'none', marginRight: '16px' }}
                  >
                    Editar
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
