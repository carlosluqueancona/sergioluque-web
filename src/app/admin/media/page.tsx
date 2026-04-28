export const runtime = 'edge'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MediaManager } from './MediaManager'

const COOKIE_NAME = 'sl_admin_jwt'

export default async function MediaPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) redirect('/admin/login')

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto' }}>
      <Link
        href="/admin"
        style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        ← Back to dashboard
      </Link>
      <h1
        style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: '20px',
          fontWeight: 700,
          margin: '12px 0 8px',
          letterSpacing: '0.05em',
        }}
      >
        Media library
      </h1>
      <p
        style={{
          color: 'var(--text-muted)',
          fontFamily: 'monospace',
          fontSize: '11px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '32px',
        }}
      >
        Upload, browse, and manage R2 files · UNLINK in form fields keeps the file · DELETE here purges it permanently
      </p>
      <MediaManager />
    </main>
  )
}
