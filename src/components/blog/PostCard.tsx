import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import type { Post, Locale } from '@/types'

interface PostCardProps {
  post: Post
  locale: Locale
}

export async function PostCard({ post, locale }: PostCardProps) {
  await getTranslations('blog')
  const title = post.title
  const excerpt = post.excerpt
  const slug = post.slug

  const dateFormatted = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <article style={{ borderBottom: '1px solid var(--border)', padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '16px', marginBottom: '8px' }}>
        <Link
          href={`/${locale}/blog/${slug}`}
          style={{ fontFamily: 'var(--font-space-mono)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}
        >
          {title}
        </Link>
        {dateFormatted && (
          <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
            {dateFormatted}
          </span>
        )}
      </div>
      {excerpt && (
        <p style={{ fontFamily: 'var(--font-ibm-plex-sans)', fontSize: '15px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          {excerpt}
        </p>
      )}
    </article>
  )
}
