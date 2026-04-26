import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getProyectoBySlug, getProyectos } from '@/lib/db/queries'
import { PostBody } from '@/components/blog/PostBody'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/types'
import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateStaticParams() {
  const [proyectosEs, proyectosEn] = await Promise.allSettled([
    getProyectos('es'),
    getProyectos('en'),
  ])

  const params: Array<{ locale: string; slug: string }> = []

  if (proyectosEs.status === 'fulfilled') {
    for (const p of proyectosEs.value) {
      if (p.slug) params.push({ locale: 'es', slug: p.slug })
    }
  }
  if (proyectosEn.status === 'fulfilled') {
    for (const p of proyectosEn.value) {
      if (p.slug) params.push({ locale: 'en', slug: p.slug })
    }
  }

  return params
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params
  const proyecto = await getProyectoBySlug(slug, locale as Locale)
  if (!proyecto) return {}
  return { title: `${proyecto.title} — Sergio Luque` }
}

export default async function ProyectoPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const t = await getTranslations('common')
  const proyecto = await getProyectoBySlug(slug, locale as Locale)
  if (!proyecto) notFound()

  const title = proyecto.title
  const description = proyecto.description

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 48px' }}>
      <Link href={`/${locale}/proyectos`} style={{ fontFamily: 'var(--font-space-mono)', fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '0.1em', display: 'inline-block', marginBottom: '32px' }}>
        ← {t('backToList')}
      </Link>

      <h1 style={{ fontFamily: 'var(--font-space-mono)', fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
        {title}
      </h1>
      {proyecto.year && (
        <p style={{ fontFamily: 'var(--font-space-mono)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '48px' }}>
          {proyecto.year}
        </p>
      )}

      {proyecto.images && proyecto.images.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '48px' }}>
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
