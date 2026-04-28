import Image from 'next/image'
import Link from 'next/link'
import type { Proyecto } from '@/types'

interface ProjectCardProps {
  proyecto: Proyecto
}

export function ProjectCard({ proyecto }: ProjectCardProps) {
  const title = proyecto.title
  const slug = proyecto.slug
  const coverImage = proyecto.images?.[0]

  return (
    <article style={{ borderBottom: '1px solid var(--border)', padding: '24px 0' }}>
      <Link href={`/projects/${slug}`} style={{ textDecoration: 'none', display: 'block' }}>
        {coverImage && (
          <Image
            src={coverImage}
            alt={title}
            width={600}
            height={300}
            style={{ display: 'block', width: '100%', height: '200px', objectFit: 'cover', marginBottom: '16px' }}
          />
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 style={{ fontFamily: 'var(--font-space-mono)', fontSize: '15px', fontWeight: 700, color: 'var(--heading)', margin: 0 }}>
            {title}
          </h2>
          {proyecto.year && (
            <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '16px' }}>
              {proyecto.year}
            </span>
          )}
        </div>
      </Link>
    </article>
  )
}
