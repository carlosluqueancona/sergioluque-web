import { getEventosProximos, getEventosPasados } from '@/lib/db/queries'
import { ConcertList } from '@/components/concerts'
import { S } from '@/lib/strings'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = { title: S.concerts.title }

export default async function ConciertosPage() {
  const [proximos, pasados] = await Promise.all([
    getEventosProximos(),
    getEventosPasados(),
  ])

  return (
    <div className="page-shell">
      <h1 className="t-h1" style={{ marginBottom: '64px' }}>
        {S.concerts.title}
      </h1>

      <section style={{ marginBottom: '64px' }}>
        <h2 className="t-label" style={{ marginBottom: '24px' }}>
          {S.concerts.upcoming}
        </h2>
        {proximos.length > 0 ? (
          <ConcertList eventos={proximos} />
        ) : (
          <p className="t-meta">{S.concerts.noUpcoming}</p>
        )}
      </section>

      <section>
        <h2 className="t-label" style={{ marginBottom: '24px' }}>
          {S.concerts.past}
        </h2>
        {pasados.length > 0 ? (
          <ConcertList eventos={pasados} />
        ) : (
          <p className="t-meta">{S.concerts.noPast}</p>
        )}
      </section>
    </div>
  )
}
