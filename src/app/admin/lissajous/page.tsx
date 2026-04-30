import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { LissajousPlayground } from '@/components/lissajous/LissajousPlayground'
import { S } from '@/lib/strings'

export const runtime = 'edge'

const COOKIE_NAME = 'sl_admin_jwt'

export const metadata: Metadata = {
  title: S.lissajous.title,
  description: S.lissajous.subtitle,
}

export default async function AdminLissajousPage() {
  // Same auth gate as the rest of /admin: no JWT cookie → redirect to
  // login. The Worker still validates the token on each admin request,
  // so this is just a fast-path UI guard.
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) redirect('/admin/login')

  return (
    <>
      <h1
        style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: '24px',
          fontWeight: 700,
          margin: '0 0 8px',
          letterSpacing: '0.05em',
        }}
      >
        {S.lissajous.title}
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-ibm-plex-sans)',
          fontSize: '15px',
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
          margin: '0 0 32px',
          maxWidth: '60ch',
        }}
      >
        {S.lissajous.subtitle}
      </p>
      <LissajousPlayground />
    </>
  )
}
