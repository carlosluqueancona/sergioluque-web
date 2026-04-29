import { notFound } from 'next/navigation'
import { getPosts } from '@/lib/db/queries'
import { PostCard } from '@/components/blog/PostCard'
import { S } from '@/lib/strings'
import { PUBLIC_SECTIONS } from '@/lib/feature-flags'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = { title: S.blog.title }

export default async function BlogPage() {
  if (!PUBLIC_SECTIONS.blog) notFound()
  const posts = await getPosts()
  return (
    <div className="page-shell">
      <h1 className="t-h1" style={{ marginBottom: '48px' }}>
        {S.blog.title}
      </h1>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
