export const runtime = 'edge'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ENTITY_LIST } from '@/lib/admin/schemas'

const COOKIE_NAME = 'sl_admin_jwt'

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '24px',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  textDecoration: 'none',
  color: 'var(--text-primary)',
  transition: 'background 120ms ease',
}

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) redirect('/admin/login')

  // Static dashboard — entity-specific data could be fetched here later
  const sections = [
    {
      route: 'obras',
      label: 'Works',
      labelSingular: 'Work',
      emoji: '♫',
      special: true,
    },
    ...ENTITY_LIST.map((s) => ({
      route: s.route,
      label: s.label,
      labelSingular: s.labelSingular,
      emoji: s.emoji ?? '◇',
      special: false,
    })),
    {
      route: 'media',
      label: 'Media library',
      labelSingular: 'Media library',
      emoji: '▤',
      special: true,
    },
    {
      route: 'settings',
      label: 'Settings',
      labelSingular: 'Settings',
      emoji: '⚙',
      special: true,
    },
    {
      route: 'lissajous',
      label: 'Lissajous',
      labelSingular: 'Lissajous',
      emoji: '∞',
      special: true,
    },
  ]

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto' }}>
      <h1
        style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: '24px',
          fontWeight: 700,
          margin: '0 0 8px',
          letterSpacing: '0.05em',
        }}
      >
        Admin dashboard
      </h1>
      <p
        style={{
          color: 'var(--text-muted)',
          fontFamily: 'monospace',
          fontSize: '12px',
          margin: '0 0 32px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        Manage site content
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '12px',
        }}
      >
        {sections.map((s) => (
          <Link key={s.route} href={`/admin/${s.route}`} style={cardStyle}>
            <span
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '24px',
                color: 'var(--text-secondary)',
              }}
            >
              {s.emoji}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '15px',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              {s.label}
            </span>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '10px',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              View list →
            </span>
          </Link>
        ))}
      </div>
    </main>
  )
}
