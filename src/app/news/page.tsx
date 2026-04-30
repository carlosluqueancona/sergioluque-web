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

  const total = proximos.length + pasados.length
  const countLabel =
    total === 1 ? '1 entry' : `${total} entries`
  return (
    <div className="page-shell">
      <h1 className="t-h1">{S.concerts.title}</h1>
      <p className="t-label" style={{ marginBottom: '48px' }}>
        {countLabel}
      </p>

      {proximos.length > 0 && (
        <section style={{ marginBottom: '64px' }}>
          <h2 className="t-label" style={{ marginBottom: '24px' }}>
            {S.concerts.upcoming}
          </h2>
          <ConcertList eventos={proximos} />
        </section>
      )}

      {pasados.length > 0 && (
        <section>
          <h2 className="t-label" style={{ marginBottom: '24px' }}>
            {S.concerts.past}
          </h2>
          <ConcertList eventos={pasados} />
        </section>
      )}
    </div>
  )
}
