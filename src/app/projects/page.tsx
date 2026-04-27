import { getProyectos } from '@/lib/db/queries'
import { ProjectCard } from '@/components/projects'
import { S } from '@/lib/strings'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = { title: S.projects.title }

export default async function ProyectosPage() {
  const proyectos = await getProyectos()
  return (
    <div className="page-shell">
      <h1 className="t-h1" style={{ marginBottom: '48px' }}>
        {S.projects.title}
      </h1>
      <div className="cols-2" style={{ gap: 0 }}>
        {proyectos.map((proyecto) => (
          <ProjectCard key={proyecto.id} proyecto={proyecto} />
        ))}
      </div>
    </div>
  )
}
