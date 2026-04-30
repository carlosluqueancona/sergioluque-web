import type { Metadata } from 'next'
import { LissajousPlayground } from '@/components/lissajous/LissajousPlayground'
import { S } from '@/lib/strings'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: S.lissajous.title,
  description: S.lissajous.subtitle,
}

export default function LissajousPage() {
  return (
    <div className="page-shell">
      <h1 className="t-h1">{S.lissajous.title}</h1>
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
    </div>
  )
}
