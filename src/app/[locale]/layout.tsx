import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/lib/i18n/routing'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SetLang } from '@/components/layout/SetLang'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return {
    title: {
      default: 'Sergio Luque',
      template: '%s — Sergio Luque',
    },
    description:
      locale === 'es'
        ? 'Compositor e investigador. Catálogo de obras, proyectos y publicaciones.'
        : 'Composer and researcher. Works catalog, projects and publications.',
    openGraph: {
      type: 'website',
      locale: locale === 'es' ? 'es_ES' : 'en_GB',
      siteName: 'Sergio Luque',
      images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
    metadataBase: new URL('https://sergioluque.com'),
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'es' | 'en')) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <SetLang />
      <Header />
      <main>{children}</main>
      <Footer />
    </NextIntlClientProvider>
  )
}
