import Image from 'next/image'
import type { Evento } from '@/types'

const isHttpUrl = (s: string | undefined): s is string =>
  !!s && /^https?:\/\//i.test(s)

interface ConcertItemProps {
  evento: Evento
}

function formatEventDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function ConcertItem({ evento }: ConcertItemProps) {
  const title = evento.title
  const showImage = isHttpUrl(evento.imageUrl)

  return (
    <div
      className="concert-item"
      style={{
        display: 'grid',
        gridTemplateColumns: showImage ? '80px 140px 1fr' : '140px 1fr',
        gap: '24px',
        padding: '16px 0',
        borderBottom: '1px solid var(--border)',
        alignItems: 'start',
      }}
    >
      {showImage && (
        <Image
          src={evento.imageUrl as string}
          alt={title}
          width={80}
          height={80}
          style={{ display: 'block', width: '80px', height: '80px', objectFit: 'cover' }}
        />
      )}

      <span
        style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          letterSpacing: '0.05em',
        }}
      >
        {formatEventDate(evento.eventDate)}
      </span>

      <div>
        <p
          className="concert-item-title"
          style={{ fontFamily: 'var(--font-space-mono)', fontSize: '13px', color: 'var(--text-primary)', margin: 0 }}
        >
          {title}
        </p>
        {(evento.venue || evento.city) && (
          <p style={{ fontFamily: 'var(--font-space-mono)', fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0', letterSpacing: '0.05em' }}>
            {[evento.venue, evento.city, evento.country].filter(Boolean).join(', ')}
          </p>
        )}
        {evento.externalLink && (
          <a
            href={evento.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: 'var(--font-space-mono)', fontSize: '10px', color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}
          >
            →
          </a>
        )}
      </div>
    </div>
  )
}
