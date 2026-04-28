export const runtime = 'edge'

import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getSchema } from '@/lib/admin/schemas'
import { GenericForm } from '@/components/admin/GenericForm'

const COOKIE_NAME = 'sl_admin_jwt'

export default async function NewEntityPage({
  params,
}: {
  params: Promise<{ entity: string }>
}) {
  const { entity } = await params
  const schema = getSchema(entity)
  if (!schema) notFound()

  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) redirect('/admin/login')

  return (
    <main style={{ maxWidth: 800, margin: '0 auto' }}>
      <Link
        href={`/admin/${schema.route}`}
        style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        ← Back to {schema.label}
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
        New {schema.labelSingular.toLowerCase()}
      </h1>
      <GenericForm schema={schema} />
    </main>
  )
}
