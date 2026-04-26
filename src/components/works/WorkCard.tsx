import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { AudioPlayerMini } from '@/components/audio'
import type { Obra, Locale } from '@/types'

interface WorkCardProps {
  obra: Obra
  locale: Locale
}

export async function WorkCard({ obra, locale }: WorkCardProps) {
  const t = await getTranslations('works')
  const title = obra.title
  const instrumentation = obra.instrumentation
  const slug = obra.slug

  return (
    <article
      className="work-card"
      style={{
        borderBottom: '1px solid var(--border)',
        padding: '24px 0',
        display: 'grid',
        gridTemplateColumns: obra.imageUrl ? '120px 1fr' : '1fr',
        gap: '24px',
        alignItems: 'start',
      }}
    >
      {obra.imageUrl && (
        <Link href={`/${locale}/obras/${slug}`} style={{ display: 'block' }}>
          <Image
            src={obra.imageUrl}
            alt={title}
            width={120}
            height={120}
            style={{ display: 'block', objectFit: 'cover' }}
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
        </div>

        {instrumentation && (
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
              <span style={{ marginLeft: '16px', color: 'var(--text-muted)' }}>
                {obra.duration}
              </span>
            )}
          </p>
        )}

        {obra.audioUrl && (
          <AudioPlayerMini
            audioUrl={obra.audioUrl}
            title={title}
            duration={obra.audioDuration}
          />
        )}

        {!obra.audioUrl && (
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
