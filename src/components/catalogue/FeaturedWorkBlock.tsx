import Image from 'next/image'
import { S } from '@/lib/strings'
import type { CatalogueEntry } from '@/types'

const isHttpUrl = (s: string | undefined): s is string =>
  !!s && /^https?:\/\//i.test(s)

interface FeaturedWorkBlockProps {
  entry: CatalogueEntry
  /** Optional fallback cover used when the featured entry has no image. */
  fallbackCoverUrl?: string
}

/**
 * Featured work hero shown above the catalogue table — large cover image
 * on the left, small "FEATURED WORK" eyebrow + title + description +
 * action buttons on the right. Title and description follow the site's
 * Space Mono / IBM Plex Sans typography (no off-brand serif italic from
 * the source mockup); buttons reuse the existing .btn-ghost language.
 */
export function FeaturedWorkBlock({ entry, fallbackCoverUrl }: FeaturedWorkBlockProps) {
  const coverUrl = isHttpUrl(entry.imageUrl)
    ? entry.imageUrl
    : isHttpUrl(fallbackCoverUrl)
      ? fallbackCoverUrl
      : null

  return (
    <section className="featured-work-block" style={wrapStyle}>
      {coverUrl ? (
        <div className="featured-work-image-wrap" style={imageWrapStyle}>
          <Image
            src={coverUrl}
            alt={entry.title}
            width={1200}
            height={1200}
            priority
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      ) : (
        <div style={{ ...imageWrapStyle, background: 'var(--surface)' }} aria-hidden />
      )}

      <div style={textColStyle}>
        <p className="t-label" style={{ margin: '0 0 16px' }}>
          {S.catalogue.featuredLabel}
        </p>
        <h2
          className="t-h2"
          style={{
            margin: '0 0 16px',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
          }}
        >
          {entry.title}
        </h2>
        {entry.instrumentation && (
          <p
            className="t-meta"
            style={{
              margin: '0 0 16px',
              color: 'var(--text-muted)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {entry.instrumentation}
          </p>
        )}
        {entry.description && (
          <p
            style={{
              fontFamily: 'var(--font-ibm-plex-sans)',
              fontSize: '15px',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              margin: '0 0 24px',
              maxWidth: '46ch',
            }}
          >
            {entry.description}
          </p>
        )}
        <FeaturedActions entry={entry} />
      </div>
    </section>
  )
}

function FeaturedActions({ entry }: { entry: CatalogueEntry }) {
  const links = [
    isHttpUrl(entry.listenUrl) ? { url: entry.listenUrl, label: `▸ ${S.catalogue.listen}` } : null,
    isHttpUrl(entry.scoreUrl) ? { url: entry.scoreUrl, label: S.catalogue.viewScore } : null,
    isHttpUrl(entry.patchUrl) ? { url: entry.patchUrl, label: S.catalogue.viewPatch } : null,
    isHttpUrl(entry.videoUrl) ? { url: entry.videoUrl, label: S.catalogue.watchVideo } : null,
    isHttpUrl(entry.losslessUrl) ? { url: entry.losslessUrl, label: S.catalogue.downloadLossless } : null,
  ].filter(<T,>(x: T | null): x is T => x !== null)

  if (links.length === 0) return null

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
      {links.map((l) => (
        <a
          key={l.url}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost"
          style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '10px 18px',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            textDecoration: 'none',
          }}
        >
          {l.label}
        </a>
      ))}
    </div>
  )
}

const wrapStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(240px, 1fr) 1fr',
  gap: 'clamp(24px, 5vw, 64px)',
  alignItems: 'center',
  paddingBottom: '64px',
  borderBottom: '1px solid var(--border)',
  marginBottom: '64px',
}

const imageWrapStyle: React.CSSProperties = {
  width: '100%',
  aspectRatio: '1 / 1',
  overflow: 'hidden',
  border: '1px solid var(--border)',
}

const textColStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
}
