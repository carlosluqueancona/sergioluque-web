import { getObras } from '@/lib/db/queries'
import { WorkGrid } from '@/components/works'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/types'

export const revalidate = 3600

export default async function ObrasPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('works')
  const obras = await getObras(locale as Locale)

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 48px' }}>
      <h1
        style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: '32px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '8px',
          letterSpacing: '-0.02em',
        }}
      >
        {t('title')}
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginBottom: '48px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        {obras.length} {obras.length === 1 ? t('count_one') : t('count_other')}
      </p>
      <WorkGrid obras={obras} locale={locale as Locale} />
    </div>
  )
}
