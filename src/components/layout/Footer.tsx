import Link from 'next/link'
import { S } from '@/lib/strings'
import { CookiePreferencesLink } from './CookiePreferencesLink'

export function Footer() {
  const navLinks = [
    { href: '/works', label: S.nav.works },
    { href: '/projects', label: S.nav.projects },
    { href: '/blog', label: S.nav.blog },
    { href: '/bio', label: S.nav.bio },
    { href: '/publications', label: S.nav.publications },
    { href: '/concerts', label: S.nav.concerts },
    { href: '/contact', label: S.nav.contact },
  ]

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        marginTop: '96px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: 'clamp(24px, 4vw, 32px) clamp(20px, 5vw, 48px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} Sergio Luque
          </p>
          <CookiePreferencesLink />
        </div>

        <nav aria-label="Footer navigation">
          <ul
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px 32px',
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
