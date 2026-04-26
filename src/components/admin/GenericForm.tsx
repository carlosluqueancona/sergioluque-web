'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { EntitySchema, FieldDef } from '@/lib/admin/schemas'

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

const fieldStyle: React.CSSProperties = { marginBottom: '16px' }

function defaultValue(field: FieldDef, current?: unknown): string | boolean {
  if (field.type === 'boolean') {
    if (typeof current === 'boolean') return current
    if (typeof current === 'number') return current === 1
    return false
  }
  if (current == null) return ''
  return String(current)
}

export function GenericForm({ schema, initialData }: GenericFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<Record<string, string | boolean>>(() => {
    const initial: Record<string, string | boolean> = {}
    for (const field of schema.fields) {
      initial[field.key] = defaultValue(field, initialData?.[field.key])
    }
    return initial
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const id = initialData?.id as number | undefined

  function set(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }))
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
        setError(data.error ?? 'Error al guardar')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!id || !confirm(`¿Eliminar este registro?`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/${schema.route}?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push(`/admin/${schema.route}`)
        router.refresh()
      } else {
        setError('Error al eliminar')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {schema.fields.map((field) => (
        <div key={field.key} style={fieldStyle}>
          <label style={labelStyle} htmlFor={field.key}>
            {field.label}
            {field.required ? ' *' : ''}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              id={field.key}
              value={String(form[field.key] ?? '')}
              onChange={(e) => set(field.key, e.target.value)}
              rows={field.rows ?? 4}
              required={field.required}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
          ) : field.type === 'boolean' ? (
            <input
              id={field.key}
              type="checkbox"
              checked={Boolean(form[field.key])}
              onChange={(e) => set(field.key, e.target.checked)}
              style={{ width: 'auto', accentColor: 'var(--accent)' }}
            />
          ) : (
            <input
              id={field.key}
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
              value={String(form[field.key] ?? '')}
              onChange={(e) => set(field.key, e.target.value)}
              required={field.required}
              placeholder={field.placeholder}
              style={inputStyle}
            />
          )}
        </div>
      ))}

      {error && (
        <p style={{ color: 'var(--error)', fontSize: '12px', marginBottom: '12px' }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px', alignItems: 'center' }}>
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
          {loading ? 'GUARDANDO…' : id ? 'GUARDAR CAMBIOS' : 'CREAR'}
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
            ELIMINAR
          </button>
        )}
      </div>
    </form>
  )
}
