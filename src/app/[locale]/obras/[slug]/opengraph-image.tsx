import { ImageResponse } from 'next/og'
import { getObraBySlug } from '@/lib/db/queries'
import type { Locale } from '@/types'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const obra = await getObraBySlug(slug, locale as Locale)

  const title = obra ? obra.title : 'Sergio Luque'
  const instrumentation = obra?.instrumentation ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0A0A0A',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '64px',
        }}
      >
        <div style={{ fontSize: '14px', color: '#555555', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'monospace' }}>
          SERGIO LUQUE
        </div>
        <div style={{ fontSize: '48px', fontWeight: 700, color: '#F0F0F0', lineHeight: 1.1, fontFamily: 'monospace' }}>
          {title}
        </div>
        {instrumentation && (
          <div style={{ fontSize: '18px', color: '#888888', marginTop: '16px', fontFamily: 'monospace' }}>
            {instrumentation}
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
