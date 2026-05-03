import { getEventosProximos, getEventosPasados } from '@/lib/db/queries'
import { ConcertList } from '@/components/concerts'
import type { Evento } from '@/types'
import { S } from '@/lib/strings'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = {
  title: S.concerts.title,
  description:
    'Upcoming concerts, premieres, and recent news for composer Sergio Luque.',
  alternates: { canonical: '/news' },
}

/**
 * Build a schema.org/MusicEvent for an evento row. Only the upcoming
 * eventos qualify for the rich-results "Events" carousel — past ones
 * are still emitted (with `eventStatus: EventScheduled` since they
 * happened) for completeness, but Google generally surfaces only
 * future events.
 *
 * Location is intentionally minimal: we don't have a structured
 * venue address, only a free-text venue + city + country. We pack
 * those into a `Place` with a `PostalAddress` — Google falls back to
 * geocoding the addressLocality when latitude/longitude are absent.
 */
function eventoToMusicEvent(evento: Evento) {
  const composerRef = { '@id': 'https://sergioluque.com/#person' }
  const locationParts = [evento.venue, evento.city, evento.country].filter(Boolean)
  return {
    '@type': 'MusicEvent',
    '@id': `https://sergioluque.com/news#event-${evento.id}`,
    name: evento.title,
    startDate: evento.eventDate,
    ...(evento.eventEndDate ? { endDate: evento.eventEndDate } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    composer: composerRef,
    performer: composerRef,
    organizer: composerRef,
    ...(locationParts.length
      ? {
          location: {
            '@type': 'Place',
            name: evento.venue ?? locationParts[0],
            address: {
              '@type': 'PostalAddress',
              ...(evento.city ? { addressLocality: evento.city } : {}),
              ...(evento.country ? { addressCountry: evento.country } : {}),
            },
          },
        }
      : {}),
    ...(evento.description ? { description: evento.description } : {}),
    ...(evento.imageUrl ? { image: evento.imageUrl } : {}),
    ...(evento.externalLink ? { url: evento.externalLink } : {}),
  }
}

export default async function ConciertosPage() {
  const [proximos, pasados] = await Promise.all([
    getEventosProximos(),
    getEventosPasados(),
  ])

  // Emit one JSON-LD blob with @graph over every upcoming event.
  // Past events are skipped — Google's events rich result only shows
  // future events anyway, and including past would dilute the graph
  // for AI search engines that ground on schema.
  const jsonLd =
    proximos.length > 0
      ? {
          '@context': 'https://schema.org',
          '@graph': proximos.map(eventoToMusicEvent),
        }
      : null

  return (
    <div className="page-shell">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(
              /[<\u2028\u2029]/g,
              (ch) => `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`
            ),
          }}
        />
      )}
      <h1 className="t-h1" style={{ marginBottom: '48px' }}>
        {S.concerts.title}
      </h1>

      {proximos.length > 0 && (
        <section style={{ marginBottom: '64px' }}>
          <h2 className="t-label" style={{ marginBottom: '24px' }}>
            {S.concerts.upcoming}
          </h2>
          <ConcertList eventos={proximos} />
        </section>
      )}

      {pasados.length > 0 && (
        <section>
          <ConcertList eventos={pasados} />
        </section>
      )}
    </div>
  )
}
