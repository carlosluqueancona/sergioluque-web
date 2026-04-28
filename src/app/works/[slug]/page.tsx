import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getObraBySlug } from '@/lib/db/queries'
import { AudioPlayer } from '@/components/audio'
import { PostBody } from '@/components/blog/PostBody'
import { S } from '@/lib/strings'
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
  const obra = await getObraBySlug(slug)
  if (!obra) return {}
  return {
    title: obra.title,
    description: obra.instrumentation,
  }
}

export default async function ObraPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const obra = await getObraBySlug(slug)
  if (!obra) notFound()

  const title = obra.title
  const instrumentation = obra.instrumentation
  const description = obra.description

  const premiereInfo = [obra.premiereDate, obra.premiereVenue, obra.premiereCity]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="page-shell">
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
              <AudioPlayer
                audioUrl={obra.audioUrl}
                title={title}
                duration={obra.audioDuration}
              />
            </div>
          )}

          {isHttpUrl(obra.imageUrl) && (
            <div style={{ marginBottom: '48px' }}>
              <Image
                src={obra.imageUrl}
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
          <dl style={{ borderTop: '1px solid var(--border)' }}>
            {[
              { label: S.works.year, value: obra.year != null ? String(obra.year) : undefined },
              { label: S.works.duration, value: obra.duration },
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

            {obra.ensembles && (
              <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <dt className="t-label" style={{ marginBottom: '4px' }}>
                  {S.works.ensembles}
                </dt>
                <dd style={{ margin: 0 }}>
                  <p className="t-caption" style={{ color: 'var(--text-primary)', margin: 0 }}>
                    {obra.ensembles}
                  </p>
                </dd>
              </div>
            )}
          </dl>
        </aside>
      </div>
    </div>
  )
}
