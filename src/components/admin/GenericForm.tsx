'use client'

import { useState, useRef, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { EntitySchema, FieldDef } from '@/lib/admin/schemas'
import { FileUpload } from './FileUpload'
import { MediaPicker } from './MediaPicker'

interface GenericFormProps {
  schema: EntitySchema
  initialData?: Record<string, unknown>
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

const fieldStyle: React.CSSProperties = { marginBottom: '20px' }

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

interface LinkItem {
  label: string
  url: string
}

type FormValue = string | boolean | string[] | LinkItem[]

function defaultValue(field: FieldDef, current?: unknown): FormValue {
  if (field.type === 'boolean') {
    if (typeof current === 'boolean') return current
    if (typeof current === 'number') return current === 1
    return false
  }
  if (field.type === 'image-list') {
    if (typeof current === 'string') {
      try {
        const parsed = JSON.parse(current)
        return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
      } catch {
        return []
      }
    }
    return Array.isArray(current) ? (current as string[]) : []
  }
  if (field.type === 'link-list') {
    if (typeof current === 'string') {
      try {
        const parsed = JSON.parse(current)
        return Array.isArray(parsed) ? (parsed as LinkItem[]) : []
      } catch {
        return []
      }
    }
    return Array.isArray(current) ? (current as LinkItem[]) : []
  }
  if (current == null) return ''
  return String(current)
}

export function GenericForm({ schema, initialData }: GenericFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<Record<string, FormValue>>(() => {
    const initial: Record<string, FormValue> = {}
    for (const field of schema.fields) {
      initial[field.key] = defaultValue(field, initialData?.[field.key])
    }
    return initial
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const id = initialData?.id as number | undefined

  function set(key: string, value: FormValue) {
    setForm((prev) => ({ ...prev, [key]: value }))
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
      setError('Upload failed (connection)')
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
    setLoading(true)

    const payload: Record<string, unknown> = { ...(id ? { id } : {}) }
    for (const field of schema.fields) {
      const v = form[field.key]
      if (field.type === 'boolean') {
        payload[field.key] = v ? 1 : 0
      } else if (field.type === 'number') {
        payload[field.key] = v ? Number(v) : null
      } else if (field.type === 'image-list' || field.type === 'link-list') {
        payload[field.key] = JSON.stringify(v ?? [])
      } else {
        payload[field.key] = v
      }
    }

    try {
      const method = id ? 'PUT' : 'POST'
      const res = await fetch(`/api/admin/${schema.route}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        router.push(`/admin/${schema.route}`)
        router.refresh()
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
    if (!id || !confirm('Delete this record?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/${schema.route}?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push(`/admin/${schema.route}`)
        router.refresh()
      } else {
        setError('Delete failed')
      }
    } catch {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {schema.fields.map((field) => (
        <FieldRenderer
          key={field.key}
          field={field}
          value={form[field.key]}
          onChange={(v) => set(field.key, v)}
          uploadFile={uploadFile}
          deleteFile={deleteFile}
        />
      ))}

      {error && (
        <p style={{ color: 'var(--error)', fontSize: '12px', marginBottom: '12px' }}>
          {error}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginTop: '24px',
          alignItems: 'center',
          paddingTop: '24px',
          borderTop: '1px solid var(--border)',
        }}
      >
        <button
          type="submit"
          disabled={loading}
          style={{
            background: 'var(--text-primary)',
            color: 'var(--bg)',
            border: 'none',
            padding: '10px 24px',
            fontFamily: 'monospace',
            fontSize: '12px',
            letterSpacing: '0.1em',
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? 'SAVING…' : id ? 'SAVE CHANGES' : 'CREATE'}
        </button>
        {id && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            style={{
              background: 'none',
              border: '1px solid var(--error)',
              color: 'var(--error)',
              padding: '10px 24px',
              fontFamily: 'monospace',
              fontSize: '12px',
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            DELETE
          </button>
        )}
      </div>
    </form>
  )
}

// ─── Field Renderer ──────────────────────────────────────────────────────

interface FieldRendererProps {
  field: FieldDef
  value: FormValue
  onChange: (v: FormValue) => void
  uploadFile: (file: File) => Promise<string | null>
  deleteFile: (url: string) => Promise<boolean>
}

function FieldRenderer({ field, value, onChange, uploadFile, deleteFile }: FieldRendererProps) {
  if (field.type === 'image-upload' || field.type === 'pdf-upload') {
    return (
      <FileUpload
        label={field.label}
        kind={field.type === 'image-upload' ? 'image' : 'pdf'}
        value={String(value ?? '')}
        onChange={(v) => onChange(v)}
        uploadFile={uploadFile}
        deleteFile={deleteFile}
      />
    )
  }

  if (field.type === 'image-list') {
    return (
      <ImageListField
        field={field}
        value={Array.isArray(value) ? (value as string[]) : []}
        onChange={(v) => onChange(v)}
        uploadFile={uploadFile}
        deleteFile={deleteFile}
      />
    )
  }

  if (field.type === 'link-list') {
    return (
      <LinkListField
        field={field}
        value={Array.isArray(value) ? (value as LinkItem[]) : []}
        onChange={(v) => onChange(v)}
      />
    )
  }

  if (field.type === 'textarea') {
    return (
      <div style={fieldStyle}>
        <label style={labelStyle}>{field.label}</label>
        <textarea
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          rows={field.rows ?? 4}
          required={field.required}
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>
    )
  }

  if (field.type === 'boolean') {
    return (
      <div style={fieldStyle}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            style={{ accentColor: 'var(--accent)' }}
          />
          <span style={{ ...labelStyle, marginBottom: 0 }}>{field.label}</span>
        </label>
      </div>
    )
  }

  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>
        {field.label}
        {field.required ? ' *' : ''}
      </label>
      <input
        type={
          field.type === 'date'
            ? 'date'
            : field.type === 'datetime'
              ? 'datetime-local'
              : field.type === 'number'
                ? 'number'
                : field.type === 'url'
                  ? 'url'
                  : 'text'
        }
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        placeholder={field.placeholder}
        style={inputStyle}
      />
    </div>
  )
}

// ─── Image List Field ────────────────────────────────────────────────────

function ImageListField({
  field,
  value,
  onChange,
  uploadFile,
}: {
  field: FieldDef
  value: string[]
  onChange: (v: string[]) => void
  uploadFile: (file: File) => Promise<string | null>
  deleteFile: (url: string) => Promise<boolean>
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [picking, setPicking] = useState(false)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    const urls: string[] = []
    for (const file of files) {
      const url = await uploadFile(file)
      if (url) urls.push(url)
    }
    if (urls.length) onChange([...value, ...urls])
    setUploading(false)
    if (ref.current) ref.current.value = ''
  }

  // UNLINK semantics: only remove from this list. File stays in R2.
  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx))
  }

  function move(idx: number, dir: -1 | 1) {
    const next = [...value]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target]!, next[idx]!]
    onChange(next)
  }

  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{field.label}</label>
      {value.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          {value.map((url, i) => (
            <div
              key={`${url}-${i}`}
              style={{
                border: '1px solid var(--border)',
                padding: '6px',
                background: 'var(--surface)',
              }}
            >
              <img
                src={url}
                alt=""
                style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '6px',
                  gap: '4px',
                }}
              >
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  style={{ ...smallButton, padding: '2px 8px', fontSize: '10px' }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === value.length - 1}
                  style={{ ...smallButton, padding: '2px 8px', fontSize: '10px' }}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  style={{
                    ...smallButton,
                    padding: '2px 8px',
                    fontSize: '10px',
                    color: 'var(--error)',
                    borderColor: 'var(--error)',
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          style={{ ...inputStyle, padding: '6px', fontSize: '11px', flex: '1 1 auto', minWidth: '200px' }}
        />
        <button
          type="button"
          onClick={() => setPicking(true)}
          style={{ ...smallButton, padding: '6px 12px', fontSize: '11px' }}
        >
          + From library
        </button>
      </div>
      {uploading && (
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Uploading images…
        </p>
      )}
      {picking && (
        <MediaPicker
          kind="image"
          onSelect={(url) => onChange([...value, url])}
          onClose={() => setPicking(false)}
        />
      )}
    </div>
  )
}

// ─── Link List Field ─────────────────────────────────────────────────────

function LinkListField({
  field,
  value,
  onChange,
}: {
  field: FieldDef
  value: LinkItem[]
  onChange: (v: LinkItem[]) => void
}) {
  function add() {
    onChange([...value, { label: '', url: '' }])
  }
  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx))
  }
  function update(idx: number, key: keyof LinkItem, val: string) {
    const next = [...value]
    next[idx] = { ...next[idx]!, [key]: val }
    onChange(next)
  }

  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{field.label}</label>
      {value.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr auto',
            gap: '8px',
            marginBottom: '8px',
            alignItems: 'center',
          }}
        >
          <input
            placeholder="Label"
            value={item.label}
            onChange={(e) => update(i, 'label', e.target.value)}
            style={inputStyle}
          />
          <input
            type="url"
            placeholder="https://…"
            value={item.url}
            onChange={(e) => update(i, 'url', e.target.value)}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            style={{
              ...smallButton,
              color: 'var(--error)',
              borderColor: 'var(--error)',
            }}
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" onClick={add} style={smallButton}>
        + Add link
      </button>
    </div>
  )
}
