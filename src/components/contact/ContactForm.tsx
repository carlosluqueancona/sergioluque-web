'use client'

import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { z } from 'zod'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1).max(2000),
  _hp: z.string(),
})

type FormData = z.infer<typeof schema>

type Status = 'idle' | 'loading' | 'success' | 'error'

export function ContactForm() {
  const t = useTranslations('contact')
  const [status, setStatus] = useState<Status>('idle')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { _hp: '' },
  })

  async function onSubmit(data: FormData) {
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.success) {
        setStatus('success')
        reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-ibm-plex-sans)',
    fontSize: '15px',
    padding: '12px 16px',
    outline: 'none',
    boxSizing: 'border-box',
    borderRadius: 0,
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--font-space-mono)',
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: 'var(--text-secondary)',
    marginBottom: '8px',
  }

  const errorStyle: React.CSSProperties = {
    fontFamily: 'var(--font-space-mono)',
    fontSize: '11px',
    color: 'var(--error)',
    marginTop: '4px',
  }

  const fieldStyle: React.CSSProperties = {
    marginBottom: '24px',
  }

  if (status === 'success') {
    return (
      <p style={{ fontFamily: 'var(--font-space-mono)', fontSize: '14px', color: 'var(--success)', padding: '24px 0' }}>
        {t('success')}
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ maxWidth: '600px' }}>
      <input type="text" {...register('_hp')} style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />

      <div style={fieldStyle}>
        <label htmlFor="name" style={labelStyle}>{t('name')}</label>
        <input
          id="name"
          type="text"
          placeholder={t('namePlaceholder')}
          style={{ ...inputStyle, borderColor: errors.name ? 'var(--error)' : 'var(--border)' }}
          aria-describedby={errors.name ? 'name-error' : undefined}
          {...register('name')}
        />
        {errors.name && <p id="name-error" style={errorStyle}>—</p>}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="email" style={labelStyle}>{t('email')}</label>
        <input
          id="email"
          type="email"
          placeholder={t('emailPlaceholder')}
          style={{ ...inputStyle, borderColor: errors.email ? 'var(--error)' : 'var(--border)' }}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
        {errors.email && <p id="email-error" style={errorStyle}>—</p>}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="subject" style={labelStyle}>{t('subject')}</label>
        <input
          id="subject"
          type="text"
          placeholder={t('subjectPlaceholder')}
          style={{ ...inputStyle, borderColor: errors.subject ? 'var(--error)' : 'var(--border)' }}
          aria-describedby={errors.subject ? 'subject-error' : undefined}
          {...register('subject')}
        />
        {errors.subject && <p id="subject-error" style={errorStyle}>—</p>}
      </div>

      <div style={fieldStyle}>
        <label htmlFor="message" style={labelStyle}>{t('message')}</label>
        <textarea
          id="message"
          rows={6}
          placeholder={t('messagePlaceholder')}
          style={{ ...inputStyle, resize: 'vertical', borderColor: errors.message ? 'var(--error)' : 'var(--border)' }}
          aria-describedby={errors.message ? 'message-error' : undefined}
          {...register('message')}
        />
        {errors.message && <p id="message-error" style={errorStyle}>—</p>}
      </div>

      {status === 'error' && (
        <p style={{ fontFamily: 'var(--font-space-mono)', fontSize: '13px', color: 'var(--error)', marginBottom: '16px' }}>
          {t('error')}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        style={{
          background: 'none',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-space-mono)',
          fontSize: '12px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          padding: '14px 32px',
          cursor: status === 'loading' ? 'wait' : 'pointer',
          transition: 'border-color 150ms ease-out',
        }}
      >
        {status === 'loading' ? t('sending') : t('send')}
      </button>
    </form>
  )
}
