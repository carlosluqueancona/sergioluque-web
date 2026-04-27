'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { FileUpload } from './FileUpload'

interface SettingsFormProps {
  initial: Record<string, string>
}

interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'textarea' | 'image' | 'pdf' | 'email' | 'url'
  rows?: number
}

const SECTIONS: { title: string; fields: FieldConfig[] }[] = [
  {
    title: 'Biografía',
    fields: [
      { key: 'bio_short_es', label: 'Bio corta (ES)', type: 'textarea', rows: 3 },
      { key: 'bio_short_en', label: 'Bio corta (EN)', type: 'textarea', rows: 3 },
      { key: 'bio_long_es', label: 'Bio larga (ES)', type: 'textarea', rows: 10 },
      { key: 'bio_long_en', label: 'Bio larga (EN)', type: 'textarea', rows: 10 },
    ],
  },
  {
    title: 'Imagen y CV',
    fields: [
      { key: 'profile_image_url', label: 'Foto de perfil', type: 'image' },
      { key: 'cv_pdf_url', label: 'CV (PDF)', type: 'pdf' },
    ],
  },
  {
    title: 'Contacto',
    fields: [{ key: 'email', label: 'Email de contacto', type: 'email' }],
  },
  {
    title: 'Redes sociales',
    fields: [
      { key: 'social_twitter', label: 'Twitter / X', type: 'url' },
      { key: 'social_instagram', label: 'Instagram', type: 'url' },
      { key: 'social_youtube', label: 'YouTube', type: 'url' },
      { key: 'social_soundcloud', label: 'SoundCloud', type: 'url' },
      { key: 'social_bandcamp', label: 'Bandcamp', type: 'url' },
      { key: 'social_facebook', label: 'Facebook', type: 'url' },
      { key: 'social_linkedin', label: 'LinkedIn', type: 'url' },
    ],
  },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  fontFamily: 'monospace',
  fontSize: '13px',
  padding: '8px 12px',
  boxSizing: 'border-box',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  letterSpacing: '0.1em',
  color: 'var(--text-muted)',
  marginBottom: '4px',
  textTransform: 'uppercase',
}

const smallButton: React.CSSProperties = {
  background: 'var(--surface-hover)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  fontFamily: 'monospace',
  fontSize: '11px',
  padding: '6px 12px',
  cursor: 'pointer',
  letterSpacing: '0.05em',
}

export function SettingsForm({ initial }: SettingsFormProps) {
  const router = useRouter()
  const allKeys = SECTIONS.flatMap((s) => s.fields.map((f) => f.key))
  const [form, setForm] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {}
    for (const k of allKeys) out[k] = initial[k] ?? ''
    return out
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSuccess(false)
  }

  async function uploadFile(file: File): Promise<string | null> {
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setError(data.error ?? 'Error al subir archivo')
        return null
      }
      const { url } = (await res.json()) as { url: string }
      return url
    } catch {
      setError('Error de conexión al subir archivo')
      return null
    }
  }

  async function deleteFile(url: string): Promise<boolean> {
    if (!url || !/\/media\//.test(url)) return true
    try {
      const res = await fetch(`/api/admin/upload?url=${encodeURIComponent(url)}`, {
        method: 'DELETE',
      })
      return res.ok
    } catch {
      return false
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSuccess(true)
        router.refresh()
      } else {
        const data = (await res.json()) as { error?: string }
        setError(data.error ?? 'Error al guardar')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {SECTIONS.map((section) => (
        <section
          key={section.title}
          style={{
            marginBottom: '40px',
            padding: '24px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              margin: '0 0 20px',
              color: 'var(--text-secondary)',
            }}
          >
            {section.title}
          </h2>
          {section.fields.map((field) => (
            <SettingField
              key={field.key}
              field={field}
              value={form[field.key] ?? ''}
              onChange={(v) => set(field.key, v)}
              uploadFile={uploadFile}
              deleteFile={deleteFile}
            />
          ))}
        </section>
      ))}

      {error && (
        <p style={{ color: 'var(--error)', fontSize: '12px', marginBottom: '12px' }}>{error}</p>
      )}
      {success && (
        <p style={{ color: 'var(--success)', fontSize: '12px', marginBottom: '12px' }}>
          Guardado ✓
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          background: 'var(--text-primary)',
          color: 'var(--bg)',
          border: 'none',
          padding: '12px 28px',
          fontFamily: 'monospace',
          fontSize: '12px',
          letterSpacing: '0.1em',
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.5 : 1,
        }}
      >
        {loading ? 'GUARDANDO…' : 'GUARDAR CONFIGURACIÓN'}
      </button>
    </form>
  )
}

function SettingField({
  field,
  value,
  onChange,
  uploadFile,
  deleteFile,
}: {
  field: FieldConfig
  value: string
  onChange: (v: string) => void
  uploadFile: (f: File) => Promise<string | null>
  deleteFile: (url: string) => Promise<boolean>
}) {
  if (field.type === 'image') {
    return (
      <FileUpload
        label={field.label}
        kind="image"
        value={value}
        onChange={onChange}
        uploadFile={uploadFile}
        deleteFile={deleteFile}
      />
    )
  }

  if (field.type === 'pdf') {
    return (
      <FileUpload
        label={field.label}
        kind="pdf"
        value={value}
        onChange={onChange}
        uploadFile={uploadFile}
        deleteFile={deleteFile}
      />
    )
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={labelStyle}>{field.label}</label>

      {field.type === 'textarea' && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={field.rows ?? 4}
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
        />
      )}

      {(field.type === 'text' || field.type === 'email' || field.type === 'url') && (
        <input
          type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
      )}
    </div>
  )
}
