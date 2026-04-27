import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getObrasDestacadas, getEventosProximos } from '@/lib/db/queries'
import { WorkCard } from '@/components/works'
import { ConcertItem } from '@/components/concerts'
import { Hero } from '@/components/home/Hero'
import type { Locale } from '@/types'

export const revalidate = 3600

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('home')

  const [obras, eventos] = await Promise.all([
    getObrasDestacadas(locale as Locale),
    getEventosProximos(locale as Locale),
  ])

  return (
    <>
      <Hero locale={locale as Locale} />

      {/* Obras destacadas */}
      {obras.length > 0 && (
        <section
          className="page-shell"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '32px',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '11px',
                fontWeight: 400,
                color: 'var(--text-muted)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              {t('featuredWorks')}
            </h2>
            <Link
              href={`/${locale}/obras`}
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '11px',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                letterSpacing: '0.1em',
              }}
            >
              {t('viewAll')} →
            </Link>
          </div>

          {obras.map((obra) => (
            <WorkCard key={obra.id} obra={obra} locale={locale as Locale} />
          ))}
        </section>
      )}

      {/* Próximos conciertos */}
      {eventos.length > 0 && (
        <section
          className="page-shell"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '32px',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '11px',
                fontWeight: 400,
                color: 'var(--text-muted)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              {t('upcomingConcerts')}
            </h2>
            <Link
              href={`/${locale}/conciertos`}
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '11px',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                letterSpacing: '0.1em',
              }}
            >
              {t('viewAll')} →
            </Link>
          </div>

          {eventos.slice(0, 3).map((evento) => (
            <ConcertItem key={evento.id} evento={evento} locale={locale as Locale} />
          ))}
        </section>
      )}
    </>
  )
}
