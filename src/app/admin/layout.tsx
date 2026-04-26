import type { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          background: 'var(--bg)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-space-mono), monospace',
          minHeight: '100vh',
        }}
      >
        <nav
          style={{
            borderBottom: '1px solid var(--border)',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: 'var(--text-muted)',
            }}
          >
            SL / ADMIN
          </span>
          <a href="/admin/obras" style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Obras</a>
          <form action="/api/admin/logout" method="post" style={{ marginLeft: 'auto' }}>
            <button
              type="submit"
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                fontFamily: 'monospace',
                fontSize: '11px',
                padding: '4px 12px',
                cursor: 'pointer',
                letterSpacing: '0.1em',
              }}
            >
              LOGOUT
            </button>
          </form>
        </nav>
        <main style={{ padding: '32px 24px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
