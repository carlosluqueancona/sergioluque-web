import Image from 'next/image'
import Link from 'next/link'
import { AudioPlayerMini, AudioFormatTag } from '@/components/audio'
import { S } from '@/lib/strings'
import { detectAudioFormat } from '@/lib/audio-format'
import type { Obra } from '@/types'

const isHttpUrl = (s: string | undefined): s is string =>
  !!s && /^https?:\/\//i.test(s)

interface WorkCardProps {
  obra: Obra
}

export function WorkCard({ obra }: WorkCardProps) {
  const title = obra.title
  const instrumentation = obra.instrumentation
  const slug = obra.slug
  const showImage = isHttpUrl(obra.imageUrl)
  const showAudio = isHttpUrl(obra.audioUrl)
  const audioFormat = showAudio ? detectAudioFormat(obra.audioUrl) : null
  const href = `/works/${slug}`

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
            {audioFormat && (
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <AudioFormatTag format={audioFormat} />
              </div>
            )}
            <AudioPlayerMini audioUrl={obra.audioUrl as string} title={title} />
          </div>
        ) : (
          <p className="t-caption">{S.works.noAudio}</p>
        )}
      </div>
    </article>
  )
}
