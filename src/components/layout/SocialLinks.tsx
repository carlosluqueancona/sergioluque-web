import type { Settings } from '@/types'

/**
 * Social profile links surfaced in the footer + contact page. URLs
 * come from admin → Settings → Social. Any unset / empty value is
 * skipped, so the strip only shows what the operator has actually
 * configured. Icons are inline SVG (no extra deps), monoline 16 px,
 * inheriting `currentColor` so light / dark + accent transitions
 * follow the surrounding type.
 */

interface SocialLinksProps {
  settings: Settings | undefined | null
  /** "footer" — compact muted; "contact" — slightly larger, accent on hover. */
  variant?: 'footer' | 'contact'
}

interface LinkDef {
  url: string | undefined
  label: string
  icon: React.ReactNode
}

type ResolvedLink = Omit<LinkDef, 'url'> & { url: string }

// Stroke-only glyphs at 16x16 viewBox so they sit on a 1 px grid and
// stay crisp at any size. currentColor on stroke / fill so theme
// transitions pick them up automatically.
const Icon = {
  twitter: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M9.31 6.94 14.62 1h-1.26L8.74 6.16 5.07 1H1l5.57 7.84L1 15h1.26l4.87-5.45L11.13 15h4.07l-5.9-8.06Zm-1.72 1.93-.56-.79L2.71 1.92h1.94l3.62 5.07.56.79L13.36 14h-1.94L7.59 8.87Z" />
    </svg>
  ),
  instagram: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <rect x="2" y="2" width="12" height="12" rx="3" />
      <circle cx="8" cy="8" r="3" />
      <circle cx="11.5" cy="4.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  ),
  youtube: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M14.7 4.3a2 2 0 0 0-1.4-1.4C12.1 2.6 8 2.6 8 2.6s-4.1 0-5.3.3A2 2 0 0 0 1.3 4.3C1 5.5 1 8 1 8s0 2.5.3 3.7a2 2 0 0 0 1.4 1.4c1.2.3 5.3.3 5.3.3s4.1 0 5.3-.3a2 2 0 0 0 1.4-1.4C15 10.5 15 8 15 8s0-2.5-.3-3.7ZM6.7 10.5V5.5L10.8 8l-4.1 2.5Z" />
    </svg>
  ),
  soundcloud: (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden>
      <path d="M2 9v3M4 7v5M6 6v6M8 5v7M10 4.5v7.5" />
      <path d="M12 4v8h4a3 3 0 0 0 0-6 4 4 0 0 0-4-2Z" />
    </svg>
  ),
  bandcamp: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M2 4 6 12 14 12 10 4 2 4Z" />
    </svg>
  ),
  facebook: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M9 14V8.5h1.8l.3-2.1H9V5.1c0-.6.2-1 1-1h1.1V2.1c-.2 0-.8-.1-1.5-.1-1.5 0-2.6.9-2.6 2.6v1.8H5.1v2.1h1.9V14H9Z" />
    </svg>
  ),
  linkedin: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M3.6 5.3a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6ZM4.7 13.5H2.5V6.4h2.2v7.1ZM13.5 13.5h-2.2V10c0-.8 0-1.9-1.1-1.9s-1.3.9-1.3 1.8v3.6H6.7V6.4h2.1v1c.3-.6 1-1.2 2.2-1.2 2.3 0 2.7 1.5 2.7 3.5v3.8Z" />
    </svg>
  ),
} as const

export function SocialLinks({ settings, variant = 'footer' }: SocialLinksProps) {
  const all: LinkDef[] = [
    { url: settings?.socialTwitter, label: 'Twitter / X', icon: Icon.twitter },
    { url: settings?.socialInstagram, label: 'Instagram', icon: Icon.instagram },
    { url: settings?.socialYoutube, label: 'YouTube', icon: Icon.youtube },
    { url: settings?.socialSoundcloud, label: 'SoundCloud', icon: Icon.soundcloud },
    { url: settings?.socialBandcamp, label: 'Bandcamp', icon: Icon.bandcamp },
    { url: settings?.socialFacebook, label: 'Facebook', icon: Icon.facebook },
    { url: settings?.socialLinkedin, label: 'LinkedIn', icon: Icon.linkedin },
  ]
  const links: ResolvedLink[] = all.filter(
    (l): l is ResolvedLink => Boolean(l.url && /^https?:\/\//i.test(l.url))
  )

  if (links.length === 0) return null

  const isContact = variant === 'contact'
  const itemColor = isContact ? 'var(--text-secondary)' : 'var(--text-muted)'
  const gap = isContact ? '20px' : '14px'

  return (
    <ul
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap,
        listStyle: 'none',
        margin: 0,
        padding: 0,
      }}
    >
      {links.map((link) => (
        <li key={link.label} style={{ display: 'flex' }}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className="social-link"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: itemColor,
              transition: 'color 180ms ease, transform 180ms ease',
            }}
          >
            {link.icon}
          </a>
        </li>
      ))}
    </ul>
  )
}
