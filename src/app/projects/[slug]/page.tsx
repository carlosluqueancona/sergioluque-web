import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getProyectoBySlug } from '@/lib/db/queries'
import { PostBody } from '@/components/blog/PostBody'
import { S } from '@/lib/strings'
import { PUBLIC_SECTIONS } from '@/lib/feature-flags'
import type { Metadata } from 'next'

// Render on-demand. See works/[slug] for the rationale.
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const proyecto = await getProyectoBySlug(slug)
  if (!proyecto) return {}
  return { title: proyecto.title }
}

export default async function ProyectoPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!PUBLIC_SECTIONS.projects) notFound()
  const { slug } = await params
  const proyecto = await getProyectoBySlug(slug)
  if (!proyecto) notFound()

  const title = proyecto.title
  const description = proyecto.description

  return (
    <div className="page-shell">
      <Link href="/projects" className="back-link" style={{ marginBottom: '32px' }}>
        ← {S.common.backToList}
      </Link>

      <h1 className="t-h1">{title}</h1>
      {proyecto.year && (
        <p className="t-caption" style={{ marginBottom: '48px' }}>
          {proyecto.year}
        </p>
      )}

      {proyecto.images && proyecto.images.length > 0 && (
        <div className="cols-2" style={{ gap: '8px', marginBottom: '48px' }}>
          {proyecto.images.map((imgUrl, i) => (
            <Image
              key={i}
              src={imgUrl}
              alt={`${title} — ${i + 1}`}
              width={600}
              height={400}
              style={{ display: 'block', width: '100%', height: 'auto', objectFit: 'cover' }}
            />
          ))}
        </div>
      )}

      {description && <PostBody value={description} />}

      {proyecto.links && proyecto.links.length > 0 && (
        <div style={{ marginTop: '32px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
          {proyecto.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', fontFamily: 'var(--font-space-mono)', fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', marginBottom: '8px' }}
            >
              → {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
