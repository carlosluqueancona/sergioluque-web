import { getProyectos } from '@/lib/db/queries'
import { ProjectCard } from '@/components/projects'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/types'
import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations('projects')
  return { title: `${t('title')} — Sergio Luque` }
}

export default async function ProyectosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('projects')
  const proyectos = await getProyectos(locale as Locale)

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 48px' }}>
      <h1 style={{ fontFamily: 'var(--font-space-mono)', fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '48px', letterSpacing: '-0.02em' }}>
        {t('title')}
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0' }}>
        {proyectos.map((proyecto) => (
          <ProjectCard key={proyecto.id} proyecto={proyecto} locale={locale as Locale} />
        ))}
      </div>
    </div>
  )
}
