import Image from 'next/image'
import { getPublicaciones } from '@/lib/db/queries'
import { S } from '@/lib/strings'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = { title: S.publications.title }

const isHttpUrl = (s: string | undefined): s is string =>
  !!s && /^https?:\/\//i.test(s)

export default async function PublicacionesPage() {
  const publicaciones = await getPublicaciones()

  const countLabel =
    publicaciones.length === 1 ? '1 entry' : `${publicaciones.length} entries`
  return (
    <div className="page-shell">
      <h1 className="t-h1">{S.publications.title}</h1>
      <p className="t-label" style={{ marginBottom: '48px' }}>
        {countLabel}
      </p>

      {publicaciones.map((pub) => {
        const showImage = isHttpUrl(pub.imageUrl)
        return (
          <article
            key={pub.id}
            style={{
              borderBottom: '1px solid var(--border)',
              padding: '24px 0',
              display: 'grid',
              gridTemplateColumns: showImage ? '100px 1fr' : '1fr',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {showImage && (
              <Image
                src={pub.imageUrl as string}
                alt={pub.title}
                width={100}
                height={140}
                style={{ display: 'block', width: '100%', height: 'auto', objectFit: 'cover' }}
              />
            )}

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '16px', marginBottom: '4px' }}>
                <h2 style={{ fontFamily: 'var(--font-space-mono)', fontSize: '14px', fontWeight: 700, color: 'var(--heading)', margin: 0 }}>
                  {pub.title}
                </h2>
                {pub.year && (
                  <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>
                    {pub.year}
                  </span>
                )}
              </div>

              {pub.journal && (
                <p style={{ fontFamily: 'var(--font-space-mono)', fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 8px', letterSpacing: '0.05em' }}>
                  {pub.journal}
                </p>
              )}

              {pub.abstract && (
                <p style={{ fontFamily: 'var(--font-ibm-plex-sans)', fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.6 }}>
                  {pub.abstract}
                </p>
              )}

              <div style={{ display: 'flex', gap: '16px' }}>
                {pub.doi && (
                  <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: 'var(--font-space-mono)', fontSize: '10px', color: 'var(--accent)', textDecoration: 'none', letterSpacing: '0.1em' }}>
                    {S.publications.doi} ↗
                  </a>
                )}
                {pub.pdfUrl && (
                  <a href={pub.pdfUrl} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: 'var(--font-space-mono)', fontSize: '10px', color: 'var(--accent)', textDecoration: 'none', letterSpacing: '0.1em' }}>
                    {S.publications.download} ↓
                  </a>
                )}
              </div>
            </div>
          </article>
        )
      })}

      {/* Stochastic Synthesis SoundCloud playlist — same embed the
          legacy /stochastics page used. Playlist ID 1918903. The
          player colour is forced to the brand accent #C24100 so it
          reads in lock-step with the rest of the site. The iframe
          fills its container width up to 640 px and keeps the 475 px
          height SoundCloud expects for the playlist layout. */}
      <section
        aria-labelledby="stochastics-audio-heading"
        style={{ marginTop: '64px', paddingTop: '48px', borderTop: '1px solid var(--border)' }}
      >
        <h2
          id="stochastics-audio-heading"
          className="t-label"
          style={{ marginBottom: '16px' }}
        >
          Audio
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-ibm-plex-sans)',
            fontSize: '15px',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            margin: '0 0 24px',
            maxWidth: '52ch',
          }}
        >
          Stochastic Synthesis Examples.
        </p>
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '640px',
            border: '1px solid var(--border)',
          }}
        >
          <iframe
            title="Stochastic Synthesis — Sergio Luque on SoundCloud"
            src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/1918903&color=%23C24100&auto_play=false&hide_related=true&show_artwork=false&show_user=true&show_playcount=true"
            width="100%"
            height="475"
            frameBorder="0"
            scrolling="no"
            allow="autoplay; encrypted-media"
            loading="lazy"
            style={{ display: 'block', width: '100%', height: '475px', border: 0 }}
          />
        </div>
      </section>
    </div>
  )
}
