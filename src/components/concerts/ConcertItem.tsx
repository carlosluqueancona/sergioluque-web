import Image from 'next/image'
import type { Evento } from '@/types'
import { PostBody } from '@/components/blog/PostBody'
import { TrackedExternalLink } from '@/components/analytics/TrackedExternalLink'

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
  const venueLine = [evento.venue, evento.city, evento.country]
    .filter(Boolean)
    .join(', ')

  // Layout class drives the responsive grid in globals.css. Inline
  // grid styles can't be overridden by media queries, so the layout
  // moved fully into CSS — desktop is 3 cols (image / date / content),
  // mobile is 2 cols (image / [date stacked over content]).
  const variant = showImage ? 'concert-item--with-image' : 'concert-item--no-image'

  // Image width/height feed Next's layout calc but the actual rendered
  // size comes from CSS — `width: 160px; height: auto` keeps the
  // natural aspect ratio (no crop). The 1600×900 hint here is just a
  // sane default for layout-shift prevention; `unoptimized: true` in
  // next.config.ts means Next does not resize.
  return (
    <article className={`concert-item ${variant}`}>
      {showImage && (
        <Image
          src={evento.imageUrl as string}
          alt={title}
          width={1600}
          height={900}
          className="concert-item__image"
        />
      )}

      <span className="concert-item__date">{formatEventDate(evento.eventDate)}</span>

      <div className="concert-item__content">
        <p className="concert-item-title concert-item__title">{title}</p>
        {venueLine && <p className="concert-item__venue">{venueLine}</p>}
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
