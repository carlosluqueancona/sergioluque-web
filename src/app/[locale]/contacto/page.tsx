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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 48px' }}>
      <h1 style={{ fontFamily: 'var(--font-space-mono)', fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '48px', letterSpacing: '-0.02em' }}>
        {t('title')}
      </h1>
      <ContactForm />
    </div>
  )
}
