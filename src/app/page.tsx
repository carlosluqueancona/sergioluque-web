import Link from 'next/link'
import {
  getObrasDestacadas,
  getEventosLatest,
  getPostsDestacados,
  getSettings,
} from '@/lib/db/queries'
import { WorkCard } from '@/components/works'
import { PostCard } from '@/components/blog/PostCard'
import { ConcertItem } from '@/components/concerts'
import { Hero } from '@/components/home/Hero'
import { S } from '@/lib/strings'
import { PUBLIC_SECTIONS } from '@/lib/feature-flags'

export const revalidate = 3600

export default async function HomePage() {
  // Settings carries the operator-picked Works fallback cover used on
  // any featured obra without an image of its own.
  const [obras, eventos, posts, settings] = await Promise.all([
    getObrasDestacadas(),
    getEventosLatest(),
    getPostsDestacados(),
    getSettings(),
  ])
  const fallbackCoverUrl = settings?.worksFallbackCoverUrl

  return (
    <>
      <Hero />

      {obras.length > 0 && (
        <section
          className="page-shell"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '32px',
            }}
          >
            <h2 className="t-label" style={{ margin: 0 }}>
              {S.home.featuredWorks}
            </h2>
            <Link
              href="/works"
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '11px',
                color: 'var(--accent)',
                textDecoration: 'none',
                letterSpacing: '0.1em',
              }}
            >
              {S.home.viewAll} →
            </Link>
          </div>

          {obras.map((obra) => (
            <WorkCard key={obra.id} obra={obra} fallbackCoverUrl={fallbackCoverUrl} />
          ))}
        </section>
      )}

      {eventos.length > 0 && (
        <section
          className="page-shell"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '32px',
            }}
          >
            <h2 className="t-label" style={{ margin: 0 }}>
              {S.home.upcomingConcerts}
            </h2>
            <Link
              href="/news"
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '11px',
                color: 'var(--accent)',
                textDecoration: 'none',
                letterSpacing: '0.1em',
              }}
            >
              {S.home.viewAll} →
            </Link>
          </div>

          {eventos.slice(0, 3).map((evento) => (
            <ConcertItem key={evento.id} evento={evento} />
          ))}
        </section>
      )}

      {PUBLIC_SECTIONS.blog && posts.length > 0 && (
        <section
          className="page-shell"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '32px',
            }}
          >
            <h2 className="t-label" style={{ margin: 0 }}>
              {S.home.featuredPosts}
            </h2>
            <Link
              href="/blog"
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '11px',
                color: 'var(--accent)',
                textDecoration: 'none',
                letterSpacing: '0.1em',
              }}
            >
              {S.home.viewAll} →
            </Link>
          </div>

          {posts.slice(0, 4).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      )}
    </>
  )
}
