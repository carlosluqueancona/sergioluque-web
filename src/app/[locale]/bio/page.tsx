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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 48px' }}>
      <h1 style={{ fontFamily: 'var(--font-space-mono)', fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '48px', letterSpacing: '-0.02em' }}>
        {t('title')}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '64px', alignItems: 'start' }}>
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
              style={{
                display: 'inline-block',
                marginTop: '32px',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '11px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                border: '1px solid var(--border)',
                padding: '12px 24px',
              }}
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
