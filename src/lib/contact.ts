import { Resend } from 'resend'

interface ContactPayload {
  name: string
  email: string
  subject: string
  message: string
}

// Default From address. `onboarding@resend.dev` is Resend's sandbox
// sender — works without verifying any domain BUT can only send TO
// the email address that owns the Resend account, and lands in spam
// most of the time. Override with RESEND_FROM in env once the
// operator has verified `sergioluque.com` (or a sub like `mail.`)
// in the Resend dashboard. Recommended production value:
//   "Sergio Luque <web@sergioluque.com>"
const DEFAULT_FROM = 'Sergio Luque Web <onboarding@resend.dev>'

export async function sendContactEmail(payload: ContactPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY not configured')

  const resend = new Resend(apiKey)

  const toEmail = process.env.CONTACT_EMAIL
  if (!toEmail) throw new Error('CONTACT_EMAIL not configured')

  const from = process.env.RESEND_FROM ?? DEFAULT_FROM

  await resend.emails.send({
    from,
    to: toEmail,
    replyTo: payload.email,
    subject: `[sergioluque.com] ${payload.subject}`,
    text: `Nombre: ${payload.name}\nEmail: ${payload.email}\n\n${payload.message}`,
  })
}
