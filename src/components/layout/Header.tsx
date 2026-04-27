import Link from 'next/link'
import { NavLink } from './NavLink'
import { ThemeToggle } from './ThemeToggle'
import { MobileNav } from './MobileNav'
import { S } from '@/lib/strings'

export function Header() {
  const navLinks = [
    { href: '/obras', label: S.nav.works },
    { href: '/proyectos', label: S.nav.projects },
    { href: '/blog', label: S.nav.blog },
    { href: '/bio', label: S.nav.bio },
    { href: '/publicaciones', label: S.nav.publications },
    { href: '/conciertos', label: S.nav.concerts },
    { href: '/contacto', label: S.nav.contact },
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
