import Link from 'next/link'
import { S } from '@/lib/strings'
import { getSettings } from '@/lib/db/queries'
import { CookiePreferencesLink } from './CookiePreferencesLink'
import { SocialLinks } from './SocialLinks'
import { PUBLIC_SECTIONS } from '@/lib/feature-flags'

// Async server component — fetches settings to surface the operator's
// social profile URLs. Tolerant of Worker outages: if the fetch
// throws, the social strip just renders empty.
export async function Footer() {
  // Same order as the header nav: Listen, News, Biography, Catalogue,
  // Stochastics, Contact (with Projects/Blog gated by feature flags).
  const navLinks: Array<{ href: string; label: string }> = [
    { href: '/listen', label: S.nav.works },
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
  let settings = null
  try {
    settings = await getSettings()
  } catch {
    /* keep settings null — SocialLinks renders nothing without URLs */
  }
  // Show the social row only when there's at least one URL configured —
  // otherwise the divider would land on an empty row and look broken.
  const hasSocials = !!(
    settings &&
    (settings.socialTwitter ||
      settings.socialInstagram ||
      settings.socialYoutube ||
      settings.socialSoundcloud ||
      settings.socialBandcamp ||
      settings.socialFacebook ||
      settings.socialLinkedin)
  )

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
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Row 1 — brand / legal on the left, nav on the right (existing). */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '6px',
            }}
          >
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link
                href="/privacy"
                style={{
                  fontFamily: 'var(--font-space-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                }}
              >
                Privacy
              </Link>
              <span
                aria-hidden
                style={{ color: 'var(--text-muted)', fontSize: '10px', opacity: 0.6 }}
              >
                ·
              </span>
              <CookiePreferencesLink />
            </div>
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

        {/* Row 2 — socials, right-aligned to mirror the nav above. Only
           rendered (with its divider) when at least one URL is set, so
           empty configs don't leave a stray rule. */}
        {hasSocials && (
          <div
            style={{
              borderTop: '1px solid var(--border)',
              paddingTop: '20px',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <SocialLinks settings={settings} variant="footer" />
          </div>
        )}
      </div>
    </footer>
  )
}
