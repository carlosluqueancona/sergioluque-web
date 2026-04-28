export const runtime = 'edge'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ObraForm } from '../ObraForm'

const COOKIE_NAME = 'sl_admin_jwt'

export default async function NewWorkPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) redirect('/admin/login')

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <Link
        href="/admin/obras"
        style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        ← Back to works
      </Link>
      <h1
        style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: '20px',
          fontWeight: 700,
          margin: '12px 0 32px',
          letterSpacing: '0.05em',
        }}
      >
        New work
      </h1>
      <ObraForm />
    </main>
  )
}
