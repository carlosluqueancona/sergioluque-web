import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'

export async function Footer() {
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
        <div>
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
        </div>

        <nav aria-label="Navegación del pie de página">
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
