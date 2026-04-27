import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import { LanguageSwitcher } from './LanguageSwitcher'
import { NavLink } from './NavLink'
import { ThemeToggle } from './ThemeToggle'
import { MobileNav } from './MobileNav'

export async function Header() {
  const locale = await getLocale()
  const t = await getTranslations('nav')

  const navLinks = [
    { href: `/${locale}/obras`, label: t('works') },
    { href: `/${locale}/proyectos`, label: t('projects') },
    { href: `/${locale}/blog`, label: t('blog') },
    { href: `/${locale}/bio`, label: t('bio') },
    { href: `/${locale}/publicaciones`, label: t('publications') },
    { href: `/${locale}/conciertos`, label: t('concerts') },
    { href: `/${locale}/contacto`, label: t('contact') },
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
          href={`/${locale}`}
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
        <nav aria-label={t('works')}>
          <ul className="site-nav-desktop">
            {navLinks.map((link) => (
              <li key={link.href}>
                <NavLink href={link.href} label={link.label} />
              </li>
            ))}
            <li>
              <LanguageSwitcher />
            </li>
            <li>
              <ThemeToggle />
            </li>
          </ul>
        </nav>

        {/* Mobile nav (≤900px) */}
        <div className="site-nav-mobile">
          <LanguageSwitcher />
          <ThemeToggle />
          <MobileNav links={navLinks} menuLabel={locale === 'en' ? 'Menu' : 'Menú'} />
        </div>
      </div>
    </header>
  )
}
