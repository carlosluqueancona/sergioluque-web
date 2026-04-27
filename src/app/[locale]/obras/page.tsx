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
    <div className="page-shell">
      <h1 className="t-h1">{t('title')}</h1>
      <p className="t-label" style={{ marginBottom: '48px' }}>
        {obras.length} {obras.length === 1 ? t('count_one') : t('count_other')}
      </p>
      <WorkGrid obras={obras} locale={locale as Locale} />
    </div>
  )
}
