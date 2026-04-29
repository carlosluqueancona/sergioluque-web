'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { FileUpload } from './FileUpload'
import { LISSAJOUS_PRESETS } from '@/lib/lissajous-presets'

interface SettingsFormProps {
  initial: Record<string, string>
}

interface FieldConfig {
  key: string
  label: string
  type:
    | 'text'
    | 'textarea'
    | 'image'
    | 'pdf'
    | 'email'
    | 'url'
    | 'switch'
    | 'color'
    | 'range'
    | 'select'
  rows?: number
  hint?: string
  min?: number
  max?: number
  step?: number
  options?: { value: string; label: string }[]
  /** Suffix shown after the slider value (e.g. 'px', '×') */
  suffix?: string
}

const SECTIONS: { title: string; fields: FieldConfig[] }[] = [
  {
    title: 'Biography',
    fields: [
      { key: 'bio_short', label: 'Short bio', type: 'textarea', rows: 3 },
      { key: 'bio', label: 'Long bio', type: 'textarea', rows: 10 },
    ],
  },
  {
    title: 'Image and CV',
    fields: [
      { key: 'profile_image_url', label: 'Profile picture', type: 'image' },
      { key: 'cv_pdf_url', label: 'CV (PDF)', type: 'pdf' },
      {
        key: 'works_fallback_cover_url',
        label: 'Works fallback cover',
        type: 'image',
        hint: 'Shown on /works for any work whose entry has no image of its own. Pick from the media library or upload a new one.',
      },
      {
        key: 'social_share_image_url',
        label: 'Social share image (WhatsApp, Twitter, Facebook…)',
        type: 'image',
        hint: 'Shown when the site URL is shared on social networks. Per-work pages override with their own cover when present. WhatsApp caches previews — replace + wait a few hours, or test in fresh chats.',
      },
    ],
  },
  {
    title: 'Contact',
    fields: [{ key: 'email', label: 'Contact email', type: 'email' }],
  },
  {
    title: 'Colour palette',
    fields: [
      // ── Accent (drives CTAs + Lissajous + headings by default) ──
      {
        key: 'cta_orange',
        label: 'Custom accent colours (apply to everything)',
        type: 'switch',
        hint: 'When ON, the two pickers below drive the whole site — links, buttons, audio progress, headings, AND the Lissajous curves on the home. When OFF, the site stays monochrome.',
      },
      {
        key: 'accent_color_dark',
        label: 'Accent — dark theme',
        type: 'color',
        hint: 'Default #FF6A1E.',
      },
      {
        key: 'accent_color_light',
        label: 'Accent — light theme',
        type: 'color',
        hint: 'Default #E55A00 (deeper orange — the brighter dark tone washes out against near-white).',
      },
      // ── Optional headings override ─────────────────────────────
      {
        key: 'headings_custom_enabled',
        label: 'Headings use a different colour from the accent',
        type: 'switch',
        hint: 'OFF (default): h2 / h3 follow the accent above — links and headings share a colour. ON: pick a separate colour pair for headings only (CTAs and Lissajous still follow the accent). Use sparingly — most coherent designs keep them in lock-step.',
      },
      {
        key: 'heading_color_dark',
        label: 'Headings — dark theme',
        type: 'color',
        hint: 'Active only when the headings override above is ON. Defaults to the accent dark colour when blank.',
      },
      {
        key: 'heading_color_light',
        label: 'Headings — light theme',
        type: 'color',
        hint: 'Active only when the headings override above is ON. Defaults to the accent light colour when blank.',
      },
    ],
  },
  {
    title: 'Hero — Lissajous curves',
    fields: [
      // Stroke colour is centralized — the curves automatically follow
      // the Appearance → Accent colours (or the monochrome default when
      // the toggle is off). The lis_color_mode / lis_color_dark /
      // lis_color_light keys still exist in the database and the
      // parser so presets (e.g. Psicodélico) can pin a specific palette
      // when applied, but they're not surfaced as separate manual
      // controls — the operator tunes one place: Appearance.

      // Geometry / count
      {
        key: 'lis_count',
        label: 'Number of figures',
        type: 'range',
        min: 1,
        max: 7,
        step: 1,
      },
      {
        key: 'lis_ratios',
        label: 'Frequency ratios (a:b, comma-separated, φ for golden)',
        type: 'text',
        hint: 'Used in order. e.g. 3:2, 4:3, 5:4, 2:1, 7:5, 8:5, φ. Extra ratios cycle if count > list length.',
      },
      {
        key: 'lis_segments',
        label: 'Segments per curve (smoothness)',
        type: 'range',
        min: 64,
        max: 2048,
        step: 32,
      },
      // Stroke
      {
        key: 'lis_line_width',
        label: 'Line thickness',
        type: 'range',
        min: 0.3,
        max: 3,
        step: 0.1,
        suffix: 'px',
      },
      {
        key: 'lis_dash',
        label: 'Stroke pattern',
        type: 'select',
        options: [
          { value: 'solid', label: 'Solid' },
          { value: 'dotted', label: 'Dotted (1·3)' },
          { value: 'dash-short', label: 'Dashed short (3·4)' },
          { value: 'dash-long', label: 'Dashed long (8·6)' },
          { value: 'dash-irregular', label: 'Irregular (12·3·2·3)' },
        ],
      },
      {
        key: 'lis_line_cap',
        label: 'Line cap',
        type: 'select',
        options: [
          { value: 'butt', label: 'Butt (sharp)' },
          { value: 'round', label: 'Round (soft)' },
        ],
      },
      // Motion
      {
        key: 'lis_drift',
        label: 'Irrational drift (how far a/b stray)',
        type: 'range',
        min: 0,
        max: 1.5,
        step: 0.05,
      },
      {
        key: 'lis_phase',
        label: 'Phase offset δ (degrees)',
        type: 'range',
        min: 0,
        max: 180,
        step: 1,
        suffix: '°',
      },
      {
        key: 'lis_speed',
        label: 'Animation speed',
        type: 'range',
        min: 0.25,
        max: 3,
        step: 0.05,
        suffix: '×',
      },
      {
        key: 'lis_rotation',
        label: 'Continuous rotation rate',
        type: 'range',
        min: 0,
        max: 0.005,
        step: 0.0001,
      },
      {
        key: 'lis_trails',
        label: 'Frame clear (1 = full clear, lower = trails)',
        type: 'range',
        min: 0.02,
        max: 1,
        step: 0.01,
        hint: 'Below ~0.3 the previous frames persist and the curves leave glowing trails.',
      },
      // Composition
      {
        key: 'lis_blend',
        label: 'Blend mode',
        type: 'select',
        options: [
          { value: 'source-over', label: 'Normal' },
          { value: 'lighter', label: 'Lighter (additive — bright at crossings)' },
          { value: 'screen', label: 'Screen (soft additive)' },
        ],
        hint: 'Lighter / Screen are designed for dark backgrounds. They auto-fall-back to Normal when the site is in light theme so strokes stay visible.',
      },
      {
        key: 'lis_size',
        label: 'Overall size',
        type: 'range',
        min: 0.4,
        max: 1.4,
        step: 0.02,
        suffix: '×',
      },
      {
        key: 'lis_center_x',
        label: 'Centre X (0 = left, 1 = right)',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
      },
      {
        key: 'lis_center_y',
        label: 'Centre Y (0 = top, 1 = bottom)',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
      },
      {
        key: 'lis_opacity',
        label: 'Opacity multiplier',
        type: 'range',
        min: 0.3,
        max: 2,
        step: 0.05,
        suffix: '×',
      },
      {
        key: 'lis_alpha_base',
        label: 'Alpha base (outer figure)',
        type: 'range',
        min: 0.05,
        max: 1,
        step: 0.01,
      },
      {
        key: 'lis_alpha_decay',
        label: 'Alpha decay (inner taper)',
        type: 'range',
        min: 0,
        max: 0.6,
        step: 0.01,
      },
      {
        key: 'lis_glow',
        label: 'Glow (shadow blur)',
        type: 'range',
        min: 0,
        max: 20,
        step: 1,
        suffix: 'px',
      },
      {
        key: 'lis_static',
        label: 'Freeze on first frame (no animation)',
        type: 'switch',
      },
    ],
  },
  {
    title: 'Social',
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

  function applyPreset(presetKey: string) {
    const preset = LISSAJOUS_PRESETS[presetKey]
    if (!preset) return
    setForm((prev) => ({ ...prev, ...preset }))
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
      setError('Connection error')
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

          {/* Preset dropdown only for the Lissajous section */}
          {section.title.startsWith('Hero') && (
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Preset (overwrites all values below)</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {Object.keys(LISSAJOUS_PRESETS).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => applyPreset(p)}
                    style={smallButton}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
              <p
                style={{
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  marginTop: '8px',
                }}
              >
                Click to populate the form. You still have to hit SAVE SETTINGS.
              </p>
            </div>
          )}

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
        {loading ? 'SAVING…' : 'SAVE SETTINGS'}
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

  if (field.type === 'switch') {
    const on = value === '1'
    return (
      <div style={{ marginBottom: '20px' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <input
            type="checkbox"
            checked={on}
            onChange={(e) => onChange(e.target.checked ? '1' : '')}
            style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
          />
          <span
            style={{
              fontSize: '13px',
              color: 'var(--text-primary)',
              fontFamily: 'monospace',
            }}
          >
            {field.label}
          </span>
        </label>
        {field.hint && (
          <p
            style={{
              fontFamily: 'monospace',
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginTop: '6px',
              marginLeft: '28px',
            }}
          >
            {field.hint}
          </p>
        )}
      </div>
    )
  }

  if (field.type === 'color') {
    return (
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>{field.label}</label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="color"
            value={value || '#D4D4D4'}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: '48px',
              height: '32px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              padding: 0,
              cursor: 'pointer',
            }}
          />
          <input
            type="text"
            value={value}
            placeholder="#D4D4D4"
            onChange={(e) => onChange(e.target.value)}
            style={{ ...inputStyle, width: '120px' }}
          />
        </div>
      </div>
    )
  }

  if (field.type === 'range') {
    const numeric = value === '' ? field.min ?? 0 : Number(value)
    return (
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>{field.label}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="range"
            min={field.min}
            max={field.max}
            step={field.step}
            value={Number.isFinite(numeric) ? numeric : field.min ?? 0}
            onChange={(e) => onChange(e.target.value)}
            style={{ flex: 1, accentColor: 'var(--accent)' }}
          />
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              color: 'var(--text-primary)',
              minWidth: '60px',
              textAlign: 'right',
            }}
          >
            {Number.isFinite(numeric) ? numeric : field.min}
            {field.suffix ?? ''}
          </span>
        </div>
        {field.hint && (
          <p
            style={{
              fontFamily: 'monospace',
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginTop: '6px',
            }}
          >
            {field.hint}
          </p>
        )}
      </div>
    )
  }

  if (field.type === 'select') {
    return (
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>{field.label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        >
          <option value="">— default —</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {field.hint && (
          <p
            style={{
              fontFamily: 'monospace',
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginTop: '6px',
            }}
          >
            {field.hint}
          </p>
        )}
      </div>
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

      {field.hint && (
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            color: 'var(--text-muted)',
            marginTop: '6px',
          }}
        >
          {field.hint}
        </p>
      )}
    </div>
  )
}
