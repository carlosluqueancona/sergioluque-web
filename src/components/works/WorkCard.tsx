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

  return (
    <article
      className="work-card"
      style={{
        borderBottom: '1px solid var(--border)',
        padding: '24px 0',
        display: 'grid',
        gridTemplateColumns: showImage ? '120px 1fr' : '1fr',
        gap: '24px',
        alignItems: 'start',
      }}
    >
      {showImage && (
        <Link href={`/${locale}/obras/${slug}`} style={{ display: 'block' }}>
          <Image
            src={obra.imageUrl as string}
            alt={title}
            width={120}
            height={120}
            style={{ display: 'block', objectFit: 'cover', width: '120px', height: '120px' }}
          />
        </Link>
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
          <Link
            href={`/${locale}/obras/${slug}`}
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              textDecoration: 'none',
            }}
          >
            {title}
          </Link>
          {obra.year != null && (
            <span
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '12px',
                color: 'var(--text-muted)',
                flexShrink: 0,
              }}
            >
              {obra.year}
            </span>
          )}
        </div>

        {(instrumentation || obra.duration) && (
          <p
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              margin: '0 0 12px',
              letterSpacing: '0.05em',
            }}
          >
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

        {showAudio && (
          <AudioPlayerMini
            audioUrl={obra.audioUrl as string}
            title={title}
            duration={obra.audioDuration}
          />
        )}

        {!showAudio && (
          <p
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
            }}
          >
            {t('noAudio')}
          </p>
        )}
      </div>
    </article>
  )
}
