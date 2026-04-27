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
    <div className="page-shell">
      <h1 className="t-h1" style={{ marginBottom: '48px' }}>
        {t('title')}
      </h1>
      <div className="cols-2" style={{ gap: 0 }}>
        {proyectos.map((proyecto) => (
          <ProjectCard key={proyecto.id} proyecto={proyecto} locale={locale as Locale} />
        ))}
      </div>
    </div>
  )
}
