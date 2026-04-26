import { getEventosProximos, getEventosPasados } from '@/lib/db/queries'
import { ConcertList } from '@/components/concerts'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/types'
import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations('concerts')
  return { title: `${t('title')} — Sergio Luque` }
}

export default async function ConciertosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('concerts')

  const [proximos, pasados] = await Promise.all([
    getEventosProximos(locale as Locale),
    getEventosPasados(locale as Locale),
  ])

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 48px' }}>
      <h1 style={{ fontFamily: 'var(--font-space-mono)', fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '64px', letterSpacing: '-0.02em' }}>
        {t('title')}
      </h1>

      <section style={{ marginBottom: '64px' }}>
        <h2 style={{ fontFamily: 'var(--font-space-mono)', fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '24px' }}>
          {t('upcoming')}
        </h2>
        {proximos.length > 0 ? (
          <ConcertList eventos={proximos} locale={locale as Locale} />
        ) : (
          <p style={{ fontFamily: 'var(--font-space-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>{t('noUpcoming')}</p>
        )}
      </section>

      <section>
        <h2 style={{ fontFamily: 'var(--font-space-mono)', fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '24px' }}>
          {t('past')}
        </h2>
        {pasados.length > 0 ? (
          <ConcertList eventos={pasados} locale={locale as Locale} />
        ) : (
          <p style={{ fontFamily: 'var(--font-space-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>{t('noPast')}</p>
        )}
      </section>
    </div>
  )
}
