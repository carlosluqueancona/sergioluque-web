import type { ReactNode } from 'react'
import { ThemeToggle } from '@/components/admin/ThemeToggle'
import { MobileNav } from '@/components/layout/MobileNav'

// Single source of truth for the admin nav. Same array feeds both the
// inline desktop list and the collapsible mobile panel so labels never
// drift between the two.
const ADMIN_LINKS = [
  { href: '/admin/obras', label: 'Works' },
  { href: '/admin/catalogue', label: 'Catalogue' },
  { href: '/admin/posts', label: 'Blog' },
  { href: '/admin/proyectos', label: 'Projects' },
  { href: '/admin/eventos', label: 'News' },
  { href: '/admin/publicaciones', label: 'Stochastics' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/lissajous', label: 'Lissajous' },
] as const

const adminLinkStyle = {
  fontSize: '12px',
  color: 'var(--text-secondary)',
  textDecoration: 'none',
} as const

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
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'var(--bg)',
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
            whiteSpace: 'nowrap',
          }}
        >
          SL / ADMIN
        </a>

        {/* Desktop links (≥901px). Reuses the public site's
            .site-nav-desktop / .site-nav-mobile breakpoint at 900px. */}
        <ul className="site-nav-desktop" style={{ gap: '20px' }}>
          {ADMIN_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} style={adminLinkStyle}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
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

          {/* Mobile hamburger (≤900px). MobileNav already wraps itself
              in .site-nav-mobile so it shows / hides at the same
              breakpoint where .site-nav-desktop disappears. */}
          <MobileNav links={[...ADMIN_LINKS]} menuLabel="Admin menu" />
        </div>
      </nav>
      <main style={{ padding: '32px 24px' }}>{children}</main>
    </div>
  )
}
