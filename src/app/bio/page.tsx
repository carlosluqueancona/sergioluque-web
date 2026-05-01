import Image from 'next/image'
import { getSettings } from '@/lib/db/queries'
import { PostBody } from '@/components/blog/PostBody'
import { S } from '@/lib/strings'
import { TrackedExternalLink } from '@/components/analytics/TrackedExternalLink'
import type { Metadata } from 'next'

export const runtime = 'edge'
export const revalidate = 3600

export const metadata: Metadata = {
  title: S.bio.title,
  description:
    'Biography of composer and researcher Sergio Luque — education, residencies, premieres, and selected works.',
  alternates: { canonical: '/bio' },
}

const FALLBACK_PORTRAIT = '/bio/portrait.jpg'
const STAGE_PHOTOS = [
  { src: '/bio/stage-1.jpg', alt: S.bio.archiveAlt.stage1 },
  { src: '/bio/stage-2.jpg', alt: S.bio.archiveAlt.stage2 },
  { src: '/bio/stage-3.jpg', alt: S.bio.archiveAlt.stage3 },
] as const

// Visually trim the hero intro to its first sentence. Operators tend to
// paste a richer multi-sentence summary into the Short bio admin field
// (good for SEO), but on the page that becomes a wall of text right next
// to a body that re-narrates the same sentences. Showing only the lead
// sentence in the hero lets the body open with fresh information.
function firstSentence(s: string): string {
  const trimmed = s.trim()
  const match = trimmed.match(/^[^.!?]*[.!?]/)
  return (match ? match[0] : trimmed).trim()
}

// Strip leading paragraphs of the long bio that are already covered by the
// hero intro. Operators copy/paste the full bio into the long field
// starting with the same opening sentence the intro shows, which would
// otherwise render twice. Comparison is whitespace- and case-insensitive,
// and only paragraphs FULLY contained in the intro are dropped — anything
// with extra detail beyond the intro is kept.
function dedupeBody(full: string, intro: string): string {
  const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase()
  const introNorm = norm(intro)
  if (!introNorm) return full

  const paras = full.split(/\n{2,}/)
  let i = 0
  while (i < paras.length) {
    const p = norm(paras[i])
    if (p && introNorm.includes(p)) {
      i++
    } else {
      break
    }
  }
  return paras.slice(i).join('\n\n')
}

export default async function BioPage() {
  const settings = await getSettings()
  const bio = settings?.bio
  const bioShort = settings?.bioShort
  const profileImageUrl = settings?.profileImageUrl ?? FALLBACK_PORTRAIT
  const cvPdfUrl = settings?.cvPdfUrl

  const introRaw = bioShort?.trim() || S.bio.introFallback
  const intro = firstSentence(introRaw)
  const rawBody = bio?.trim() || S.bio.bodyFallback
  const body = dedupeBody(rawBody, intro)

  return (
    <div className="page-shell">
      {/* ── Hero: display name + intro · portrait (small, no offset frame) ── */}
      <section className="bio-hero" aria-labelledby="bio-display-name">
        <div>
          <h1 id="bio-display-name" className="bio-display" style={{ whiteSpace: 'pre-line' }}>
            {S.bio.displayName}
          </h1>
          <p className="bio-intro">{intro}</p>
        </div>

        <div className="bio-portrait-frame">
          <Image
            src={profileImageUrl}
            alt={S.bio.portraitAlt}
            width={1200}
            height={1500}
            priority
            sizes="(max-width: 900px) 60vw, 280px"
          />
        </div>
      </section>

      {/* ── Detail: sticky role on left · biography body + CV CTA on right ── */}
      <section className="bio-detail">
        <h2 className="bio-role">{S.bio.role}</h2>

        <div className="bio-blocks">
          <div className="bio-block">
            <span className="t-label">{S.bio.bodyLabel}</span>
            <PostBody value={body} />
          </div>

          {cvPdfUrl && (
            <>
              <hr className="divider-hairline" />
              <div className="bio-block">
                <span className="t-label">{S.bio.cvLabel}</span>
                <TrackedExternalLink
                  href={cvPdfUrl}
                  download
                  className="btn-ghost"
                  eventName="download_cv"
                >
                  {S.cv.download} ↓
                </TrackedExternalLink>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Stage gallery — three performance shots, hidden on the hero hover for grayscale-on-default. ── */}
      <section className="bio-archive" aria-label={S.bio.archiveTag}>
        <span className="t-label">{S.bio.archiveTag}</span>
        <div className="stage-grid">
          {STAGE_PHOTOS.map((photo) => (
            <figure key={photo.src} className="stage-tile">
              <Image
                src={photo.src}
                alt={photo.alt}
                width={1000}
                height={1333}
                sizes="(max-width: 700px) 90vw, 33vw"
                style={{ objectPosition: 'center' }}
              />
            </figure>
          ))}
        </div>
      </section>
    </div>
  )
}
