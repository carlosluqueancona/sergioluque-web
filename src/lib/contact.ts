import { Resend } from 'resend'

interface ContactPayload {
  name: string
  email: string
  subject: string
  message: string
}

export async function sendContactEmail(payload: ContactPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY not configured')

  const resend = new Resend(apiKey)

  const toEmail = process.env.CONTACT_EMAIL
  if (!toEmail) throw new Error('CONTACT_EMAIL not configured')

  await resend.emails.send({
    from: 'Sergio Luque Web <onboarding@resend.dev>',
    to: toEmail,
    replyTo: payload.email,
    subject: `[sergioluque.com] ${payload.subject}`,
    text: `Nombre: ${payload.name}\nEmail: ${payload.email}\n\n${payload.message}`,
  })
}
