import type { Evento } from '@/types'

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

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '140px 1fr',
        gap: '24px',
        padding: '16px 0',
        borderBottom: '1px solid var(--border)',
        alignItems: 'baseline',
      }}
    >
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
        <p style={{ fontFamily: 'var(--font-space-mono)', fontSize: '13px', color: 'var(--text-primary)', margin: 0 }}>
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
