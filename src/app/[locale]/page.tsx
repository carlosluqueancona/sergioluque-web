import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getObrasDestacadas, getEventosProximos } from '@/lib/db/queries'
import { WorkCard } from '@/components/works'
import { ConcertItem } from '@/components/concerts'
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
      {/* Hero */}
      <section
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '0 48px 64px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: 'clamp(36px, 7vw, 80px)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 16px',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
          }}
        >
          SERGIO
          <br />
          LUQUE
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            margin: 0,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          {t('role')}
        </p>
      </section>

      {/* Obras destacadas */}
      {obras.length > 0 && (
        <section
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '64px 48px',
            borderTop: '1px solid var(--border)',
          }}
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
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '64px 48px',
            borderTop: '1px solid var(--border)',
          }}
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
