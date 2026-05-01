import { ContactForm } from '@/components/contact/ContactForm'
import { SocialLinks } from '@/components/layout/SocialLinks'
import { getSettings } from '@/lib/db/queries'
import { S } from '@/lib/strings'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: S.contact.title,
  description:
    'Get in touch with composer Sergio Luque for commissions, performances, or research collaborations.',
  alternates: { canonical: '/contact' },
}

export default async function ContactoPage() {
  let settings = null
  try {
    settings = await getSettings()
  } catch {
    /* tolerate worker outage — page still renders without socials */
  }

  return (
    <div className="page-shell">
      <h1 className="t-h1">{S.contact.title}</h1>
      <p className="t-label" style={{ marginBottom: '48px' }}>
        {S.contact.subtitle}
      </p>
      <ContactForm />
      <div
        style={{
          marginTop: '64px',
          paddingTop: '32px',
          borderTop: '1px solid var(--border)',
        }}
      >
        <p className="t-label" style={{ marginBottom: '16px' }}>
          Find me online
        </p>
        <SocialLinks settings={settings} variant="contact" />
      </div>
    </div>
  )
}
