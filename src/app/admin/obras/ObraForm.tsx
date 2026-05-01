'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { FileUpload } from '@/components/admin/FileUpload'
import { uploadViaPresign } from '@/lib/admin/upload'

interface ObraData {
  id?: number
  title: string
  slug: string
  year: string
  instrumentation: string
  duration: string
  description: string
  audio_url: string
  image_url: string
  premiere_date: string
  premiere_venue: string
  premiere_city: string
  commissions: string
  ensembles: string
  recorded_at: string
  is_featured: boolean
  sort_order: string
}

interface ObraFormProps {
  initialData?: Partial<ObraData>
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

export function ObraForm({ initialData }: ObraFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<ObraData>({
    title: initialData?.title ?? '',
    slug: initialData?.slug ?? '',
    year: initialData?.year ?? '',
    instrumentation: initialData?.instrumentation ?? '',
    duration: initialData?.duration ?? '',
    description: initialData?.description ?? '',
    audio_url: initialData?.audio_url ?? '',
    image_url: initialData?.image_url ?? '',
    premiere_date: initialData?.premiere_date ?? '',
    premiere_venue: initialData?.premiere_venue ?? '',
    premiere_city: initialData?.premiere_city ?? '',
    commissions: initialData?.commissions ?? '',
    ensembles: initialData?.ensembles ?? '',
    recorded_at: initialData?.recorded_at ?? '',
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
    try {
      const { url } = await uploadViaPresign(file)
      return url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
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

      <FileUpload
        label="Audio"
        kind="audio"
        value={form.audio_url}
        onChange={(v) => set('audio_url', v)}
        uploadFile={uploadFile}
        deleteFile={deleteFile}
      />

      <FileUpload
        label="Image"
        kind="image"
        value={form.image_url}
        onChange={(v) => set('image_url', v)}
        uploadFile={uploadFile}
        deleteFile={deleteFile}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
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
      <div style={fieldStyle}>
        <label style={labelStyle}>Recorded at</label>
        <input
          style={inputStyle}
          value={form.recorded_at}
          onChange={(e) => set('recorded_at', e.target.value)}
          placeholder="e.g. Studio name, city — or any free text"
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
