import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostBySlug } from '@/lib/db/queries'
import { PostBody } from '@/components/blog/PostBody'
import { S } from '@/lib/strings'
import type { Metadata } from 'next'

// Render on-demand. See works/[slug] for the rationale.
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return { title: post.title, description: post.excerpt }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const title = post.title
  const body = post.body

  const dateFormatted = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="page-shell-narrow">
      <Link href="/blog" className="back-link" style={{ marginBottom: '32px' }}>
        ← {S.common.backToList}
      </Link>

      <h1 style={{ fontFamily: 'var(--font-space-mono)', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.02em' }}>
        {title}
      </h1>

      {dateFormatted && (
        <p style={{ fontFamily: 'var(--font-space-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '48px', letterSpacing: '0.1em' }}>
          {S.blog.publishedAt} {dateFormatted}
        </p>
      )}

      {body && <PostBody value={body} />}
    </div>
  )
}
