import Link from 'next/link'
import { NavLink } from './NavLink'
import { ThemeToggle } from './ThemeToggle'
import { MobileNav } from './MobileNav'
import { S } from '@/lib/strings'
import { PUBLIC_SECTIONS } from '@/lib/feature-flags'

export function Header() {
  // Nav order — Listen, News, Biography, Catalogue, Stochastics, Contact.
  // Sections gated behind feature flags (Projects, Blog) drop out of the
  // public nav entirely; when re-enabled they sit between Stochastics
  // and Contact. Admin still has them, the data stays in the worker.
  const navLinks: Array<{ href: string; label: string }> = [
    { href: '/works', label: S.nav.works },
    { href: '/news', label: S.nav.concerts },
    { href: '/bio', label: S.nav.bio },
    { href: '/catalogue', label: S.nav.catalogue },
    { href: '/stochastics', label: S.nav.publications },
    ...(PUBLIC_SECTIONS.projects
      ? [{ href: '/projects', label: S.nav.projects }]
      : []),
    ...(PUBLIC_SECTIONS.blog ? [{ href: '/blog', label: S.nav.blog }] : []),
    { href: '/contact', label: S.nav.contact },
  ]

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="site-header-inner">
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            textDecoration: 'none',
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap',
          }}
        >
          SERGIO LUQUE
        </Link>

        {/* Desktop nav (≥901px) */}
        <nav aria-label="Main navigation">
          <ul className="site-nav-desktop">
            {navLinks.map((link) => (
              <li key={link.href}>
                <NavLink href={link.href} label={link.label} />
              </li>
            ))}
            <li>
              <ThemeToggle />
            </li>
          </ul>
        </nav>

        {/* Mobile nav (≤900px) */}
        <div className="site-nav-mobile">
          <ThemeToggle />
          <MobileNav links={navLinks} menuLabel="Menu" />
        </div>
      </div>
    </header>
  )
}
