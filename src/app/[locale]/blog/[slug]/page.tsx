import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostBySlug, getPosts } from '@/lib/db/queries'
import { PostBody } from '@/components/blog/PostBody'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/types'
import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateStaticParams() {
  const [postsEs, postsEn] = await Promise.allSettled([getPosts('es'), getPosts('en')])

  const params: Array<{ locale: string; slug: string }> = []
  if (postsEs.status === 'fulfilled') {
    for (const p of postsEs.value) {
      if (p.slug) params.push({ locale: 'es', slug: p.slug })
    }
  }
  if (postsEn.status === 'fulfilled') {
    for (const p of postsEn.value) {
      if (p.slug) params.push({ locale: 'en', slug: p.slug })
    }
  }

  return params
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await getPostBySlug(slug, locale as Locale)
  if (!post) return {}
  return { title: `${post.title} — Sergio Luque`, description: post.excerpt }
}

export default async function PostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const t = await getTranslations('common')
  const tBlog = await getTranslations('blog')
  const post = await getPostBySlug(slug, locale as Locale)
  if (!post) notFound()

  const title = post.title
  const body = post.body

  const dateFormatted = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="page-shell-narrow">
      <Link
        href={`/${locale}/blog`}
        className="back-link"
        style={{ marginBottom: '32px' }}
      >
        ← {t('backToList')}
      </Link>

      <h1 style={{ fontFamily: 'var(--font-space-mono)', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.02em' }}>
        {title}
      </h1>

      {dateFormatted && (
        <p style={{ fontFamily: 'var(--font-space-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '48px', letterSpacing: '0.1em' }}>
          {tBlog('publishedAt')} {dateFormatted}
        </p>
      )}

      {body && <PostBody value={body} />}
    </div>
  )
}
