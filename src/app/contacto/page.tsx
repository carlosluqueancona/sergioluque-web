import { ContactForm } from '@/components/contact/ContactForm'
import { S } from '@/lib/strings'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: S.contact.title }

export default function ContactoPage() {
  return (
    <div className="page-shell">
      <h1 className="t-h1" style={{ marginBottom: '48px' }}>
        {S.contact.title}
      </h1>
      <ContactForm />
    </div>
  )
}
