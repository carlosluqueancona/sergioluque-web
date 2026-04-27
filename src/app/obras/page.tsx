import { getObras } from '@/lib/db/queries'
import { WorkGrid } from '@/components/works'
import { S } from '@/lib/strings'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = { title: S.works.title }

export default async function ObrasPage() {
  const obras = await getObras()
  return (
    <div className="page-shell">
      <h1 className="t-h1">{S.works.title}</h1>
      <p className="t-label" style={{ marginBottom: '48px' }}>
        {obras.length} {obras.length === 1 ? S.works.countOne : S.works.countOther}
      </p>
      <WorkGrid obras={obras} />
    </div>
  )
}
