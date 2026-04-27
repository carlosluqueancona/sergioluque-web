import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { AudioPlayerMini } from '@/components/audio'
import type { Obra, Locale } from '@/types'

const isHttpUrl = (s: string | undefined): s is string =>
  !!s && /^https?:\/\//i.test(s)

interface WorkCardProps {
  obra: Obra
  locale: Locale
}

export async function WorkCard({ obra, locale }: WorkCardProps) {
  const t = await getTranslations('works')
  const title = obra.title
  const instrumentation = obra.instrumentation
  const slug = obra.slug
  const showImage = isHttpUrl(obra.imageUrl)
  const showAudio = isHttpUrl(obra.audioUrl)
  const href = `/${locale}/obras/${slug}`

  return (
    <article
      className="work-card"
      style={{
        position: 'relative',
        borderBottom: '1px solid var(--border)',
        padding: '24px 16px',
        marginInline: '-16px',
        display: 'grid',
        gridTemplateColumns: showImage ? '120px 1fr' : '1fr',
        gap: '24px',
        alignItems: 'start',
      }}
    >
      {/* Full-card click target. Sits below the audio player so its buttons stay interactive. */}
      <Link
        href={href}
        aria-label={title}
        className="work-card-link"
        style={{ position: 'absolute', inset: 0, zIndex: 1 }}
      />

      {showImage && (
        <span className="work-card-image">
          <Image
            src={obra.imageUrl as string}
            alt={title}
            width={120}
            height={120}
            style={{
              display: 'block',
              objectFit: 'cover',
              width: '120px',
              height: '120px',
            }}
          />
        </span>
      )}

      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '16px',
            marginBottom: '4px',
          }}
        >
          <h3 className="t-card-title">{title}</h3>
          {obra.year != null && (
            <span className="t-caption" style={{ flexShrink: 0 }}>
              {obra.year}
            </span>
          )}
        </div>

        {(instrumentation || obra.duration) && (
          <p className="t-meta" style={{ margin: '0 0 12px' }}>
            {instrumentation}
            {obra.duration && (
              <span
                style={{
                  marginLeft: instrumentation ? '16px' : 0,
                  color: 'var(--text-muted)',
                }}
              >
                {obra.duration}
              </span>
            )}
          </p>
        )}

        {showAudio ? (
          <div style={{ position: 'relative', zIndex: 2 }}>
            <AudioPlayerMini
              audioUrl={obra.audioUrl as string}
              title={title}
              duration={obra.audioDuration}
            />
          </div>
        ) : (
          <p className="t-caption">{t('noAudio')}</p>
        )}
      </div>
    </article>
  )
}
