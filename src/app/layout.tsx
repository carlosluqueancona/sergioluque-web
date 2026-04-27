export const runtime = 'edge'

import type { Metadata } from 'next'
import { Space_Mono, IBM_Plex_Sans } from 'next/font/google'
import './globals.css'
import { themeBootstrapScript } from '@/components/layout/ThemeToggle'

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
  title: 'Sergio Luque',
  description: 'Compositor e investigador',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        {/* Runs before paint so the chosen theme is on <html> the first frame. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className={`${spaceMono.variable} ${ibmPlexSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
