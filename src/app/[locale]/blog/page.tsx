import { getPosts } from '@/lib/db/queries'
import { PostCard } from '@/components/blog/PostCard'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/types'
import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations('blog')
  return { title: `${t('title')} — Sergio Luque` }
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('blog')
  const posts = await getPosts(locale as Locale)

  return (
    <div className="page-shell">
      <h1 className="t-h1" style={{ marginBottom: '48px' }}>
        {t('title')}
      </h1>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} locale={locale as Locale} />
      ))}
    </div>
  )
}
