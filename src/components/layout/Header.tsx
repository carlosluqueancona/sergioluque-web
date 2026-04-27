import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import { LanguageSwitcher } from './LanguageSwitcher'
import { NavLink } from './NavLink'
import { ThemeToggle } from './ThemeToggle'

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
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 48px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href={`/${locale}`}
          style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            textDecoration: 'none',
            letterSpacing: '0.05em',
          }}
        >
          SERGIO LUQUE
        </Link>

        <nav aria-label="Navegación principal">
          <ul
            style={{
              display: 'flex',
              gap: '32px',
              listStyle: 'none',
              margin: 0,
              padding: 0,
              alignItems: 'center',
            }}
          >
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
      </div>
    </header>
  )
}
