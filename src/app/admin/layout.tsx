import type { ReactNode } from 'react'
import { ThemeToggle } from '@/components/admin/ThemeToggle'

// NOTE: no <html>/<head>/<body> here — those belong to the root layout. The
// admin theme bootstrap lives in the public root layout's bootstrap script,
// which detects /admin/* and applies data-admin-theme from localStorage.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        margin: 0,
        background: 'var(--bg)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-space-mono), monospace',
        minHeight: '100vh',
        transition: 'background 150ms ease, color 150ms ease',
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
        <a
          href="/admin"
          style={{
            fontFamily: 'monospace',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: 'var(--text-muted)',
            textDecoration: 'none',
          }}
        >
          SL / ADMIN
        </a>
        <a href="/admin/obras" style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Works</a>
        <a href="/admin/catalogue" style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Catalogue</a>
        <a href="/admin/posts" style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Blog</a>
        <a href="/admin/proyectos" style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Projects</a>
        <a href="/admin/eventos" style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'none' }}>News</a>
        <a href="/admin/publicaciones" style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Stochastics</a>
        <a href="/admin/media" style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Media</a>
        <a href="/admin/settings" style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Settings</a>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <form action="/api/admin/logout" method="post">
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
        </div>
      </nav>
      <main style={{ padding: '32px 24px' }}>{children}</main>
    </div>
  )
}
