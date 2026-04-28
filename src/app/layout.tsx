export const runtime = 'edge'

import type { Metadata } from 'next'
import { Space_Mono, IBM_Plex_Sans } from 'next/font/google'
import './globals.css'
import { themeBootstrapScript } from '@/components/layout/ThemeToggle'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ExclusivePlayback } from '@/components/audio/ExclusivePlayback'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before paint so the chosen theme is on <html> the first frame. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className={`${spaceMono.variable} ${ibmPlexSans.variable} antialiased`}>
        <ExclusivePlayback />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
