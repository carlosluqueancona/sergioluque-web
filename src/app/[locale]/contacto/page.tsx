import { ContactForm } from '@/components/contact/ContactForm'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  void locale
  const t = await getTranslations('contact')
  return { title: `${t('title')} — Sergio Luque` }
}

export default async function ContactoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  void locale
  const t = await getTranslations('contact')

  return (
    <div className="page-shell">
      <h1 className="t-h1" style={{ marginBottom: '48px' }}>
        {t('title')}
      </h1>
      <ContactForm />
    </div>
  )
}
