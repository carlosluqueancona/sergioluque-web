import { getCatalogue, getSettings } from '@/lib/db/queries'
import { CatalogueTable, FeaturedWorkBlock } from '@/components/catalogue'
import { S } from '@/lib/strings'
import type { Metadata } from 'next'

export const runtime = 'edge'
export const revalidate = 3600

export const metadata: Metadata = {
  title: S.catalogue.title,
  description: S.catalogue.subtitle,
  alternates: { canonical: '/catalogue' },
}

export default async function CataloguePage() {
  // Pull catalogue + settings in parallel — settings carries the
  // operator-picked Works fallback cover used when the featured entry
  // has no image of its own.
  const [entries, settings] = await Promise.all([
    getCatalogue(),
    getSettings(),
  ])
  // Pick the most recently composed featured entry (yearSort already
  // backs the SQL order, so the first hit in `entries` is enough).
  const featured = entries.find((e) => e.isFeatured)

  return (
    <div className="page-shell">
      <h1 className="t-h1" style={{ marginBottom: '48px' }}>
        {S.catalogue.title}
      </h1>

      {featured && (
        <FeaturedWorkBlock
          entry={featured}
          fallbackCoverUrl={settings?.worksFallbackCoverUrl}
        />
      )}

      <CatalogueTable entries={entries} />
    </div>
  )
}
