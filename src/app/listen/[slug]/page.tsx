import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getObraBySlug, getSettings } from '@/lib/db/queries'
import { AudioPlayer, AudioFormatTag } from '@/components/audio'
import { PostBody } from '@/components/blog/PostBody'
import { S } from '@/lib/strings'
import { detectAudioFormat } from '@/lib/audio-format'
import type { Metadata } from 'next'

const isHttpUrl = (s: string | undefined): s is string =>
  !!s && /^https?:\/\//i.test(s)

// Render on-demand instead of pre-generating per-slug paths at build time.
// @cloudflare/next-on-pages doesn't fall back to runtime rendering for
// slugs absent from generateStaticParams, so any work added via admin
// after a deploy returned 404 until the next build. Dynamic + edge cache
// (1h revalidate) is the right trade-off for a content-driven catalog.
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const [obra, settings] = await Promise.all([getObraBySlug(slug), getSettings()])
  if (!obra) return {}
  // OG image priority for social shares (WhatsApp, Twitter, …):
  // 1. the work's own image, 2. operator-picked works fallback cover,
  // 3. site-wide social share image. None → inherit the layout default.
  const ogImage =
    (isHttpUrl(obra.imageUrl) && obra.imageUrl) ||
    (isHttpUrl(settings?.worksFallbackCoverUrl) && settings.worksFallbackCoverUrl) ||
    (isHttpUrl(settings?.socialShareImageUrl) && settings.socialShareImageUrl) ||
    undefined
  return {
    title: obra.title,
    // Description = title + instrumentation when present; falls back
    // to instrumentation alone, then to a generic phrasing. Better
    // than the bare "violin solo" description which Google
    // characterised as low-information.
    description: obra.instrumentation
      ? `${obra.title} — ${obra.instrumentation}. A composition by Sergio Luque.`
      : `${obra.title}. A composition by Sergio Luque.`,
    alternates: { canonical: `/listen/${slug}` },
    openGraph: ogImage
      ? { images: [{ url: ogImage, width: 1200, height: 630 }] }
      : undefined,
    twitter: ogImage ? { images: [ogImage] } : undefined,
  }
}

export default async function ObraPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  // Pull obra + settings in parallel — settings carries the operator-
  // picked fallback cover used when this obra has no image_url of its own.
  const [obra, settings] = await Promise.all([getObraBySlug(slug), getSettings()])
  if (!obra) notFound()

  const title = obra.title
  const instrumentation = obra.instrumentation
  const description = obra.description

  const heroImageSrc = isHttpUrl(obra.imageUrl)
    ? obra.imageUrl
    : isHttpUrl(settings?.worksFallbackCoverUrl)
      ? settings.worksFallbackCoverUrl
      : null

  const premiereInfo = [obra.premiereDate, obra.premiereVenue, obra.premiereCity]
    .filter(Boolean)
    .join(', ')

  // JSON-LD MusicComposition schema for this work. References the
  // site-wide Person entity declared in app/layout.tsx via @id, so the
  // composer-to-composition link is a single Knowledge Graph node
  // rather than two disconnected blobs. Audio URL surfaces as a
  // recordedAs MusicRecording when present — that's the structure
  // Google + AI search engines look for to surface listenable
  // results. Only render when we have a slug + title (always true
  // for an existing obra row).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicComposition',
    '@id': `https://sergioluque.com/listen/${slug}#composition`,
    name: title,
    composer: { '@id': 'https://sergioluque.com/#person' },
    url: `https://sergioluque.com/listen/${slug}`,
    ...(obra.year ? { datePublished: String(obra.year) } : {}),
    ...(instrumentation ? { musicArrangement: instrumentation } : {}),
    ...(description ? { description } : {}),
    ...(isHttpUrl(obra.audioUrl)
      ? {
          recordedAs: {
            '@type': 'MusicRecording',
            byArtist: { '@id': 'https://sergioluque.com/#person' },
            audio: obra.audioUrl,
          },
        }
      : {}),
  }

  return (
    <div className="page-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(
            /[<\u2028\u2029]/g,
            (ch) => `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`
          ),
        }}
      />
      <div className="aside-grid">
        <div>
          <h1 className="t-h2">{title}</h1>

          {instrumentation && (
            <p className="t-meta" style={{ marginBottom: '32px' }}>
              {instrumentation}
            </p>
          )}

          {isHttpUrl(obra.audioUrl) && (
            <div style={{ marginBottom: '48px' }}>
              {(() => {
                const fmt = detectAudioFormat(obra.audioUrl)
                return fmt ? (
                  <div style={{ marginBottom: '10px' }}>
                    <AudioFormatTag format={fmt} />
                  </div>
                ) : null
              })()}
              <AudioPlayer audioUrl={obra.audioUrl} title={title} />
            </div>
          )}

          {heroImageSrc && (
            <div style={{ marginBottom: '48px' }}>
              <Image
                src={heroImageSrc}
                alt={title}
                width={1600}
                height={900}
                style={{ display: 'block', width: '100%', height: 'auto' }}
              />
            </div>
          )}

          {description && (
            <div style={{ marginBottom: '48px' }}>
              <PostBody value={description} />
            </div>
          )}
        </div>

        <aside>
          {/*
           * Order requested by the operator:
           *   1. Year         (always shown when present)
           *   2. Duration     (always shown when present)
           *   3. Performed by (ensembles)
           *   4. Recorded at  (recordedAt — new field)
           *   5. Premiere     (date, venue, city joined)
           *   6. Commissioned by (commissions)
           *
           * Each row only renders when its value exists, so the section
           * collapses cleanly for sparse entries. The list is built once
           * and filtered to keep the JSX flat and the order explicit.
           */}
          <dl style={{ borderTop: '1px solid var(--border)' }}>
            {[
              { label: S.works.year, value: obra.year != null ? String(obra.year) : undefined },
              { label: S.works.duration, value: obra.duration },
              { label: S.works.ensembles, value: obra.ensembles },
              { label: S.works.recordedAt, value: obra.recordedAt },
              { label: S.works.premiere, value: premiereInfo || undefined },
              { label: S.works.commissions, value: obra.commissions },
            ]
              .filter((item): item is typeof item & { value: string } => Boolean(item.value))
              .map((item) => (
                <div
                  key={item.label}
                  style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}
                >
                  <dt className="t-label" style={{ marginBottom: '4px' }}>
                    {item.label}
                  </dt>
                  <dd className="t-meta" style={{ color: 'var(--text-primary)', margin: 0 }}>
                    {item.value}
                  </dd>
                </div>
              ))}
          </dl>
        </aside>
      </div>
    </div>
  )
}
