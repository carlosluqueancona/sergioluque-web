import { getPublicaciones } from '@/lib/db/queries'
import { S } from '@/lib/strings'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = { title: S.publications.title }

export default async function PublicacionesPage() {
  const publicaciones = await getPublicaciones()

  return (
    <div className="page-shell">
      <h1 className="t-h1" style={{ marginBottom: '48px' }}>
        {S.publications.title}
      </h1>

      {publicaciones.map((pub) => (
        <article key={pub.id} style={{ borderBottom: '1px solid var(--border)', padding: '24px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '16px', marginBottom: '4px' }}>
            <h2 style={{ fontFamily: 'var(--font-space-mono)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {pub.title}
            </h2>
            {pub.year && (
              <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>
                {pub.year}
              </span>
            )}
          </div>

          {pub.journal && (
            <p style={{ fontFamily: 'var(--font-space-mono)', fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 8px', letterSpacing: '0.05em' }}>
              {pub.journal}
            </p>
          )}

          {pub.abstract && (
            <p style={{ fontFamily: 'var(--font-ibm-plex-sans)', fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.6 }}>
              {pub.abstract}
            </p>
          )}

          <div style={{ display: 'flex', gap: '16px' }}>
            {pub.doi && (
              <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: 'var(--font-space-mono)', fontSize: '10px', color: 'var(--accent)', textDecoration: 'none', letterSpacing: '0.1em' }}>
                {S.publications.doi} ↗
              </a>
            )}
            {pub.pdfUrl && (
              <a href={pub.pdfUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: 'var(--font-space-mono)', fontSize: '10px', color: 'var(--accent)', textDecoration: 'none', letterSpacing: '0.1em' }}>
                {S.publications.download} ↓
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
