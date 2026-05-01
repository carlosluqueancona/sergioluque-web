import Image from 'next/image'
// import Link from 'next/link'  // re-enable together with the <Link> below
import { AudioPlayerMini, AudioFormatTag } from '@/components/audio'
import { S } from '@/lib/strings'
import { detectAudioFormat } from '@/lib/audio-format'
import type { Obra } from '@/types'

const isHttpUrl = (s: string | undefined): s is string =>
  !!s && /^https?:\/\//i.test(s)

interface WorkCardProps {
  obra: Obra
  /** Picked from admin → Settings → Works fallback cover. */
  fallbackCoverUrl?: string
}

// Strip HTML tags + collapse whitespace, then trim to a card-sized excerpt.
// `description` can be authored as rich text (PostBody renders it on the
// detail page); on the listing we just want a teaser.
function descriptionExcerpt(raw: string | undefined, max = 220): string | null {
  if (!raw) return null
  const plain = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!plain) return null
  if (plain.length <= max) return plain
  // Cut on a word boundary close to the limit so we don't slice mid-word.
  const slice = plain.slice(0, max)
  const lastSpace = slice.lastIndexOf(' ')
  return (lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice).trimEnd() + '…'
}

const metaRowStyle: React.CSSProperties = {
  display: 'grid',
  // Tightened from 132 px → 110 px and gap 12 px → 6 px so the value
  // sits closer to the label. 110 px is the rendered width of
  // "COMMISSIONED BY" at Space Mono 10px with 0.1em letter-spacing
  // (no wrap thanks to `metaLabelStyle`) — anything tighter would
  // crash the longest label. The two long labels stay vertically
  // aligned because both rows use the same fixed track.
  gridTemplateColumns: '110px 1fr',
  gap: '6px',
  alignItems: 'baseline',
  margin: '0 0 4px',
}

const metaLabelStyle: React.CSSProperties = {
  whiteSpace: 'nowrap',
}

interface MetaRowProps {
  label: string
  value: string
}

function MetaRow({ label, value }: MetaRowProps) {
  return (
    <div style={metaRowStyle}>
      <span className="t-label" style={metaLabelStyle}>
        {label}
      </span>
      <span
        className="t-meta"
        style={{ color: 'var(--text-secondary)', margin: 0 }}
      >
        {value}
      </span>
    </div>
  )
}

export function WorkCard({ obra, fallbackCoverUrl }: WorkCardProps) {
  const title = obra.title
  const slug = obra.slug
  // Per-obra image wins; otherwise fall back to the cover the operator
  // picked in admin → Settings; otherwise hide the image cell entirely.
  const imageSrc = isHttpUrl(obra.imageUrl)
    ? obra.imageUrl
    : isHttpUrl(fallbackCoverUrl)
      ? fallbackCoverUrl
      : null
  const showAudio = isHttpUrl(obra.audioUrl)
  const audioFormat = showAudio ? detectAudioFormat(obra.audioUrl) : null
  const href = `/listen/${slug}`

  const premiereInfo = [obra.premiereDate, obra.premiereVenue, obra.premiereCity]
    .filter(Boolean)
    .join(', ')
  const excerpt = descriptionExcerpt(obra.description)

  // Decide if there's any auxiliary metadata worth rendering — used to keep
  // the meta block from collapsing to an empty <div> when none of these
  // fields are populated for a given obra.
  const hasMeta =
    Boolean(premiereInfo) ||
    Boolean(obra.commissions) ||
    Boolean(obra.ensembles) ||
    Boolean(excerpt)

  return (
    <article
      className="work-card"
      style={{
        position: 'relative',
        borderBottom: '1px solid var(--border)',
        padding: '24px 16px',
        marginInline: '-16px',
        display: 'grid',
        // `minmax(0, 1fr)` not bare `1fr` — without it the content
        // column's min-content (long titles or the wide waveform inside
        // the audio player) blows the track wider than the viewport
        // when the window is narrow. The track then refuses to shrink
        // even after the viewport gets smaller.
        gridTemplateColumns: imageSrc ? '120px minmax(0, 1fr)' : 'minmax(0, 1fr)',
        gap: '24px',
        alignItems: 'start',
      }}
    >
      {/* Card-wide click target temporarily disabled per client direction.
         Re-enable by uncommenting; href is still computed above so the
         path stays in sync with the [slug] route.
      <Link
        href={href}
        aria-label={title}
        className="work-card-link"
        style={{ position: 'absolute', inset: 0, zIndex: 1 }}
      />
      */}

      {imageSrc && (
        <span className="work-card-image">
          <Image
            src={imageSrc}
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

      <div style={{ minWidth: 0 }}>
        {/* Title row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '16px',
            marginBottom: '8px',
          }}
        >
          <h3 className="t-card-title">{title}</h3>
          {obra.year != null && (
            <span className="t-caption" style={{ flexShrink: 0 }}>
              {obra.year}
            </span>
          )}
        </div>

        {/* Instrumentation + composed duration (e.g. "violin solo · 12'30") */}
        {(obra.instrumentation || obra.duration) && (
          <p className="t-meta" style={{ margin: '0 0 12px' }}>
            {obra.instrumentation}
            {obra.duration && (
              <span
                style={{
                  marginLeft: obra.instrumentation ? '16px' : 0,
                  color: 'var(--text-muted)',
                }}
              >
                {obra.duration}
              </span>
            )}
          </p>
        )}

        {/* Audio player */}
        {showAudio ? (
          <div style={{ position: 'relative', zIndex: 2, marginBottom: hasMeta ? '24px' : 0 }}>
            {audioFormat && (
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <AudioFormatTag format={audioFormat} />
              </div>
            )}
            <AudioPlayerMini audioUrl={obra.audioUrl as string} title={title} />
          </div>
        ) : (
          <p className="t-caption" style={{ marginBottom: hasMeta ? '24px' : 0 }}>
            {S.works.noAudio}
          </p>
        )}

        {/* Auxiliary metadata: premiere, commissions, performers */}
        {hasMeta && (
          <div>
            {premiereInfo && <MetaRow label={S.works.premiere} value={premiereInfo} />}
            {obra.commissions && <MetaRow label={S.works.commissions} value={obra.commissions} />}
            {obra.ensembles && <MetaRow label={S.works.ensembles} value={obra.ensembles} />}
            {excerpt && (
              <p
                className="t-meta"
                style={{ margin: '12px 0 0', lineHeight: 1.6 }}
              >
                {excerpt}
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
