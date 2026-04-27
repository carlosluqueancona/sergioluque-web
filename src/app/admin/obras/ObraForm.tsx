'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { FileUpload } from '@/components/admin/FileUpload'

interface ObraData {
  id?: number
  title: string
  slug: string
  year: string
  instrumentation: string
  duration: string
  description: string
  audio_url: string
  audio_duration: string
  image_url: string
  premiere_date: string
  premiere_venue: string
  premiere_city: string
  commissions: string
  ensembles: string
  is_featured: boolean
  sort_order: string
}

interface ObraFormProps {
  initialData?: Partial<ObraData> & {
    // Legacy bilingual fields tolerated when loading existing rows pre-migration.
    title_es?: string
    title_en?: string
    slug_es?: string
    slug_en?: string
    instrumentation_es?: string
    instrumentation_en?: string
    description_es?: string
    description_en?: string
  }
}

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

const fieldStyle: React.CSSProperties = { marginBottom: '16px' }

const pickFlat = (
  flat: string | undefined,
  en: string | undefined,
  es: string | undefined
): string => flat ?? en ?? es ?? ''

export function ObraForm({ initialData }: ObraFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<ObraData>({
    title: pickFlat(initialData?.title, initialData?.title_en, initialData?.title_es),
    slug: pickFlat(initialData?.slug, initialData?.slug_en, initialData?.slug_es),
    year: initialData?.year ?? '',
    instrumentation: pickFlat(
      initialData?.instrumentation,
      initialData?.instrumentation_en,
      initialData?.instrumentation_es
    ),
    duration: initialData?.duration ?? '',
    description: pickFlat(
      initialData?.description,
      initialData?.description_en,
      initialData?.description_es
    ),
    audio_url: initialData?.audio_url ?? '',
    audio_duration: initialData?.audio_duration ?? '',
    image_url: initialData?.image_url ?? '',
    premiere_date: initialData?.premiere_date ?? '',
    premiere_venue: initialData?.premiere_venue ?? '',
    premiere_city: initialData?.premiere_city ?? '',
    commissions: initialData?.commissions ?? '',
    ensembles: initialData?.ensembles ?? '',
    is_featured: initialData?.is_featured ?? false,
    sort_order: initialData?.sort_order ?? '0',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(key: keyof ObraData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        ...form,
        ...(initialData?.id != null ? { id: initialData.id } : {}),
        year: form.year ? parseInt(form.year) : null,
        audio_duration: form.audio_duration ? parseInt(form.audio_duration) : 0,
        sort_order: parseInt(form.sort_order) || 0,
        is_featured: form.is_featured ? 1 : 0,
      }

      const method = initialData?.id != null ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/obras', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.push('/admin/obras')
      } else {
        const data = (await res.json()) as { error?: string }
        setError(data.error ?? 'Save failed')
      }
    } catch {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!initialData?.id || !confirm('Delete this work?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/obras?id=${initialData.id}`, { method: 'DELETE' })
      if (res.ok) router.push('/admin/obras')
    } catch {
      setError('Delete failed')
    } finally {
      setLoading(false)
    }
  }

  async function uploadFile(file: File): Promise<string | null> {
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setError(data.error ?? 'Upload failed')
        return null
      }
      const { url } = (await res.json()) as { url: string }
      return url
    } catch {
      setError('Upload failed')
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

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Title *</label>
          <input style={inputStyle} value={form.title} onChange={(e) => set('title', e.target.value)} required />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Slug *</label>
          <input style={inputStyle} value={form.slug} onChange={(e) => set('slug', e.target.value)} required />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Year</label>
          <input style={inputStyle} type="number" value={form.year} onChange={(e) => set('year', e.target.value)} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Duration</label>
          <input style={inputStyle} value={form.duration} onChange={(e) => set('duration', e.target.value)} placeholder="12'" />
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Instrumentation</label>
        <input
          style={inputStyle}
          value={form.instrumentation}
          onChange={(e) => set('instrumentation', e.target.value)}
        />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Description</label>
        <textarea
          style={{ ...inputStyle, height: '120px', resize: 'vertical' }}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FileUpload
          label="Audio"
          kind="audio"
          value={form.audio_url}
          onChange={(v) => set('audio_url', v)}
          uploadFile={uploadFile}
          deleteFile={deleteFile}
        />
        <div style={fieldStyle}>
          <label style={labelStyle}>Audio duration (sec)</label>
          <input
            style={inputStyle}
            type="number"
            value={form.audio_duration}
            onChange={(e) => set('audio_duration', e.target.value)}
          />
        </div>
        <FileUpload
          label="Image"
          kind="image"
          value={form.image_url}
          onChange={(v) => set('image_url', v)}
          uploadFile={uploadFile}
          deleteFile={deleteFile}
        />
        <div style={fieldStyle}>
          <label style={labelStyle}>Premiere date</label>
          <input
            style={inputStyle}
            type="date"
            value={form.premiere_date}
            onChange={(e) => set('premiere_date', e.target.value)}
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Premiere venue</label>
          <input
            style={inputStyle}
            value={form.premiere_venue}
            onChange={(e) => set('premiere_venue', e.target.value)}
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Premiere city</label>
          <input
            style={inputStyle}
            value={form.premiere_city}
            onChange={(e) => set('premiere_city', e.target.value)}
          />
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Commissions</label>
        <input
          style={inputStyle}
          value={form.commissions}
          onChange={(e) => set('commissions', e.target.value)}
        />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Performers</label>
        <input
          style={inputStyle}
          value={form.ensembles}
          onChange={(e) => set('ensembles', e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Sort order</label>
          <input
            style={inputStyle}
            type="number"
            value={form.sort_order}
            onChange={(e) => set('sort_order', e.target.value)}
          />
        </div>
        <div style={{ ...fieldStyle, display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '20px' }}>
          <input
            type="checkbox"
            id="is_featured"
            checked={form.is_featured}
            onChange={(e) => set('is_featured', e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          <label htmlFor="is_featured" style={{ ...labelStyle, marginBottom: 0 }}>
            Featured work
          </label>
        </div>
      </div>

      {error && (
        <p style={{ color: 'var(--error)', fontSize: '12px', marginBottom: '16px' }}>{error}</p>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            background: 'var(--text-primary)',
            color: 'var(--bg)',
            border: 'none',
            fontFamily: 'monospace',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            padding: '10px 24px',
            cursor: loading ? 'not-allowed' : 'pointer',
            textTransform: 'uppercase',
          }}
        >
          {loading ? 'SAVING…' : 'SAVE'}
        </button>
        {initialData?.id != null && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            style={{
              background: 'none',
              color: 'var(--error)',
              border: '1px solid var(--error)',
              fontFamily: 'monospace',
              fontSize: '11px',
              letterSpacing: '0.1em',
              padding: '10px 24px',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            DELETE
          </button>
        )}
      </div>
    </form>
  )
}
