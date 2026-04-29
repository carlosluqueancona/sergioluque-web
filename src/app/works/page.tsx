import { getObras, getSettings } from '@/lib/db/queries'
import { WorkGrid } from '@/components/works'
import { S } from '@/lib/strings'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = { title: S.works.title }

export default async function ObrasPage() {
  // Fetch obras + settings in parallel — both come from the same Worker
  // and we need the operator-picked fallback cover for cards without an
  // image.
  const [obras, settings] = await Promise.all([getObras(), getSettings()])
  return (
    <div className="page-shell">
      <h1 className="t-h1">{S.works.title}</h1>
      <p className="t-label" style={{ marginBottom: '48px' }}>
        {obras.length} {obras.length === 1 ? S.works.countOne : S.works.countOther}
      </p>
      <WorkGrid obras={obras} fallbackCoverUrl={settings?.worksFallbackCoverUrl} />
    </div>
  )
}
