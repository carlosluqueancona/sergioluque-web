import Image from 'next/image'
import { getSettings } from '@/lib/db/queries'
import { PostBody } from '@/components/blog/PostBody'
import { S } from '@/lib/strings'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = {
  title: S.bio.title,
}

export default async function BioPage() {
  const settings = await getSettings()
  const bio = settings?.bio
  const profileImageUrl = settings?.profileImageUrl

  return (
    <div className="page-shell">
      <h1 className="t-h1" style={{ marginBottom: '48px' }}>
        {S.bio.title}
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
              {S.cv.download} ↓
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
