import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getPostBySlug } from '@/lib/db/queries'
import { PostBody } from '@/components/blog/PostBody'
import { S } from '@/lib/strings'
import { PUBLIC_SECTIONS } from '@/lib/feature-flags'
import type { Metadata } from 'next'

// Render on-demand. See works/[slug] for the rationale.
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const isHttpUrl = (s: string | undefined): s is string =>
  !!s && /^https?:\/\//i.test(s)

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return { title: post.title, description: post.excerpt }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!PUBLIC_SECTIONS.blog) notFound()
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

      <h1 style={{ fontFamily: 'var(--font-space-mono)', fontSize: '28px', fontWeight: 700, color: 'var(--heading)', marginBottom: '16px', letterSpacing: '-0.02em' }}>
        {title}
      </h1>

      {dateFormatted && (
        <p style={{ fontFamily: 'var(--font-space-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '48px', letterSpacing: '0.1em' }}>
          {S.blog.publishedAt} {dateFormatted}
        </p>
      )}

      {isHttpUrl(post.imageUrl) && (
        <div style={{ marginBottom: '48px' }}>
          <Image
            src={post.imageUrl}
            alt={title}
            width={1600}
            height={900}
            style={{ display: 'block', width: '100%', height: 'auto' }}
          />
        </div>
      )}

      {body && <PostBody value={body} />}
    </div>
  )
}
