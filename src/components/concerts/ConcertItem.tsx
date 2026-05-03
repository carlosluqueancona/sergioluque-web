import type { Evento } from '@/types'
import { PostBody } from '@/components/blog/PostBody'
import { TrackedExternalLink } from '@/components/analytics/TrackedExternalLink'
import { ConcertImage } from './ConcertImage'

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

/**
 * Format an event date range. Picks the shortest representation that
 * stays unambiguous: same month → "3–5 May 2026", different months in
 * the same year → "30 April – 2 May 2026", different years → full date
 * on both sides. Falls back to the single start date when end is empty
 * or equal to start.
 */
function formatEventDateRange(startStr: string, endStr?: string): string {
  if (!endStr || endStr === startStr) return formatEventDate(startStr)
  const start = new Date(startStr)
  const end = new Date(endStr)
  if (Number.isNaN(end.getTime())) return formatEventDate(startStr)
  if (end.getTime() < start.getTime()) return formatEventDate(startStr)
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear()
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth()
  if (sameMonth) {
    const day = start.toLocaleDateString('en-GB', { day: 'numeric' })
    return `${day}–${formatEventDate(endStr)}`
  }
  if (sameYear) {
    const startPart = start.toLocaleDateString('en-GB', { month: 'long', day: 'numeric' })
    return `${startPart} – ${formatEventDate(endStr)}`
  }
  return `${formatEventDate(startStr)} – ${formatEventDate(endStr)}`
}

export function ConcertItem({ evento }: ConcertItemProps) {
  const title = evento.title
  const showImage = isHttpUrl(evento.imageUrl)
  const venueLine = [evento.venue, evento.city, evento.country]
    .filter(Boolean)
    .join(', ')

  // Layout class drives the responsive grid in globals.css. The date
  // used to live in its own middle column — it's now stacked inside
  // .concert-item__content directly under the venue line, so the row
  // is just a 2-col grid: image | content.
  const variant = showImage ? 'concert-item--with-image' : 'concert-item--no-image'

  // Image width/height feed Next's layout calc but the actual rendered
  // size comes from CSS — `width: 160px; height: auto` keeps the
  // natural aspect ratio (no crop). The 1600×900 hint here is just a
  // sane default for layout-shift prevention; `unoptimized: true` in
  // next.config.ts means Next does not resize.
  return (
    <article className={`concert-item ${variant}`}>
      {showImage && (
        <ConcertImage src={evento.imageUrl as string} alt={title} />
      )}

      <div className="concert-item__content">
        <p className="concert-item-title concert-item__title">{title}</p>
        {venueLine && <p className="concert-item__venue">{venueLine}</p>}
        <span className="concert-item__date">
          {formatEventDateRange(evento.eventDate, evento.eventEndDate)}
        </span>
        {evento.description && (
          <p className="concert-item__description">{evento.description}</p>
        )}
        {evento.body && (
          <div className="concert-item__body">
            <PostBody value={evento.body} />
          </div>
        )}
        {evento.externalLink && (
          <TrackedExternalLink
            href={evento.externalLink}
            className="concert-item__link"
            eventName="news_external_click"
            eventParams={{ event_title: title }}
          >
            →
          </TrackedExternalLink>
        )}
      </div>
    </article>
  )
}
