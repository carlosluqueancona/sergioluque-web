import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getObraBySlug, getObras } from '@/lib/db/queries'
import { AudioPlayer } from '@/components/audio'
import { PostBody } from '@/components/blog/PostBody'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/types'
import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateStaticParams() {
  const results = await Promise.allSettled([getObras('es'), getObras('en')])

  const obrasEs = results[0].status === 'fulfilled' ? results[0].value : []
  const obrasEn = results[1].status === 'fulfilled' ? results[1].value : []

  const params: Array<{ locale: string; slug: string }> = []

  for (const obra of obrasEs) {
    if (obra.slug) params.push({ locale: 'es', slug: obra.slug })
  }
  for (const obra of obrasEn) {
    if (obra.slug) params.push({ locale: 'en', slug: obra.slug })
  }

  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const obra = await getObraBySlug(slug, locale as Locale)
  if (!obra) return {}

  return {
    title: `${obra.title} — Sergio Luque`,
    description: obra.instrumentation,
  }
}

export default async function ObraPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const t = await getTranslations('works')
  const obra = await getObraBySlug(slug, locale as Locale)
  if (!obra) notFound()

  const title = obra.title
  const instrumentation = obra.instrumentation
  const description = obra.description

  // Build premiere string from separate fields
  const premiereInfo = [obra.premiereDate, obra.premiereVenue, obra.premiereCity]
    .filter(Boolean)
    .join(', ')

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 48px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 280px',
          gap: '64px',
          alignItems: 'start',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '36px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '8px',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h1>

          {instrumentation && (
            <p
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '32px',
                letterSpacing: '0.05em',
              }}
            >
              {instrumentation}
            </p>
          )}

          {obra.audioUrl && (
            <div style={{ marginBottom: '48px' }}>
              <AudioPlayer
                audioUrl={obra.audioUrl}
                title={title}
                duration={obra.audioDuration}
              />
            </div>
          )}

          {obra.imageUrl && (
            <div style={{ marginBottom: '48px' }}>
              <Image
                src={obra.imageUrl}
                alt={title}
                width={800}
                height={400}
                style={{ display: 'block', width: '100%', height: 'auto', objectFit: 'cover' }}
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
              { label: t('year'), value: obra.year != null ? String(obra.year) : undefined },
              { label: t('duration'), value: obra.duration },
              { label: t('premiere'), value: premiereInfo || undefined },
              { label: t('commissions'), value: obra.commissions },
            ]
              .filter((item): item is { label: string; value: string } => Boolean(item.value))
              .map((item) => (
                <div
                  key={item.label}
                  style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}
                >
                  <dt
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                    }}
                  >
                    {item.label}
                  </dt>
                  <dd
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    {item.value}
                  </dd>
                </div>
              ))}

            {obra.ensembles && (
              <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <dt
                  style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}
                >
                  {t('ensembles')}
                </dt>
                <dd style={{ margin: 0 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
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
