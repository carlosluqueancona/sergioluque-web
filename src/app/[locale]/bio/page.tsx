import Image from 'next/image'
import { getSettings } from '@/lib/db/queries'
import { PostBody } from '@/components/blog/PostBody'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  await params
  const t = await getTranslations('bio')
  return { title: `${t('title')} — Sergio Luque` }
}

export default async function BioPage({ params }: { params: Promise<{ locale: string }> }) {
  await params
  const t = await getTranslations('bio')
  const tCv = await getTranslations('cv')
  const settings = await getSettings()

  const bio = settings?.bio
  const profileImageUrl = settings?.profileImageUrl

  return (
    <div className="page-shell">
      <h1 className="t-h1" style={{ marginBottom: '48px' }}>
        {t('title')}
      </h1>

      <div className="aside-grid">
        <div>
          {bio ? (
            <PostBody value={bio} />
          ) : (
            <p style={{ fontFamily: 'var(--font-ibm-plex-sans)', fontSize: '17px', color: 'var(--text-secondary)' }}>—</p>
          )}

          {settings?.cvPdfUrl && (
            <a
              href={settings.cvPdfUrl}
              download
              className="btn-ghost"
              style={{ marginTop: '32px' }}
            >
              {tCv('download')} ↓
            </a>
          )}
        </div>

        {profileImageUrl && (
          <div style={{ position: 'sticky', top: '80px' }}>
            <Image
              src={profileImageUrl}
              alt="Sergio Luque"
              width={280}
              height={380}
              style={{ display: 'block', width: '100%', height: 'auto', objectFit: 'cover' }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
