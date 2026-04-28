export const runtime = 'edge'

import type { Metadata } from 'next'
import { Space_Mono, IBM_Plex_Sans } from 'next/font/google'
import './globals.css'
import { themeBootstrapScript } from '@/components/layout/ThemeToggle'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CookieBanner } from '@/components/layout/CookieBanner'
import { GoogleAnalytics } from '@/components/layout/GoogleAnalytics'
import { ExclusivePlayback } from '@/components/audio/ExclusivePlayback'
import { getSettings } from '@/lib/db/queries'

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
})

const ibmPlexSans = IBM_Plex_Sans({
  weight: ['400', '500'],
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Sergio Luque',
    template: '%s — Sergio Luque',
  },
  description: 'Composer and researcher. Works catalog, projects and publications.',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'Sergio Luque',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  metadataBase: new URL('https://sergioluque.com'),
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read the global appearance toggle from settings so we can paint orange
  // CTAs server-side. Tolerant of Worker outages — falls through to the
  // default monochrome accent when the fetch fails.
  // Lissajous KV is also read here once and stuffed into a global the Hero
  // component picks up — saves a second fetch on the home page.
  let ctaOrange = false
  let lissajousJson = '{}'
  try {
    const settings = await getSettings()
    ctaOrange = !!settings?.ctaOrange
    if (settings?.lissajous) {
      // Escape `<` so the inline JSON can't close the <script> tag.
      // All lis_* values are constrained (numbers, hex colours, enum
      // strings, CSV ratios) so this is the only character that can
      // realistically appear and break the inline script.
      lissajousJson = JSON.stringify(settings.lissajous).replace(/</g, '\\u003c')
    }
  } catch {
    /* ignore — keep default accent + default Lissajous look */
  }

  return (
    <html lang="en" data-cta={ctaOrange ? 'orange' : 'default'} suppressHydrationWarning>
      <head>
        {/* Runs before paint so the chosen theme is on <html> the first frame. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        {/*
          Stash the Lissajous config on window before the Hero component
          mounts. Read by HeroLissajous which is a client component without
          access to server data otherwise. JSON-encoded literal — safe.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__LIS_CFG__ = ${lissajousJson};`,
          }}
        />
      </head>
      <body className={`${spaceMono.variable} ${ibmPlexSans.variable} antialiased`}>
        <ExclusivePlayback />
        <Header />
        <main>{children}</main>
        <Footer />
        <CookieBanner />
        <GoogleAnalytics />
      </body>
    </html>
  )
}
