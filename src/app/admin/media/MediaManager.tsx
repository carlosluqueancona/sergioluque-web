'use client'

import { useEffect, useState } from 'react'

type Kind = 'image' | 'audio' | 'pdf'

interface MediaItem {
  key: string
  url: string
  size: number
  uploadedAt: string
  contentType: string
}

const KIND_LABEL: Record<Kind, string> = {
  image: 'Images',
  audio: 'Audio',
  pdf: 'PDFs',
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' })
}

const tabStyle = (active: boolean): React.CSSProperties => ({
  background: active ? 'var(--text-primary)' : 'none',
  color: active ? 'var(--bg)' : 'var(--text-secondary)',
  border: '1px solid var(--border)',
  fontFamily: 'monospace',
  fontSize: '11px',
  padding: '6px 14px',
  cursor: 'pointer',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
})

export function MediaManager() {
  const [kind, setKind] = useState<Kind>('image')
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  async function load(k: Kind) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/media?kind=${k}`)
      const data = (await res.json()) as { items?: MediaItem[]; error?: string }
      if (data.error) setError(data.error)
      else setItems(data.items ?? [])
    } catch {
      setError('Failed to load library')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(kind)
  }, [kind])

  async function purge(item: MediaItem) {
    if (!confirm(`Delete ${item.key.split('/').pop()} from R2? This cannot be undone, and any entry still pointing to it will break.`))
      return
    setDeleting(item.key)
    try {
      const res = await fetch(`/api/admin/upload?url=${encodeURIComponent(item.url)}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setItems((prev) => prev.filter((x) => x.key !== item.key))
      } else {
        const j = (await res.json()) as { error?: string }
        alert(`Delete failed: ${j.error ?? 'unknown error'}`)
      }
    } catch {
      alert('Delete failed (connection)')
    } finally {
      setDeleting(null)
    }
  }

  const q = filter.trim().toLowerCase()
  const filtered = q ? items.filter((it) => it.key.toLowerCase().includes(q)) : items

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {(['image', 'audio', 'pdf'] as Kind[]).map((k) => (
          <button key={k} type="button" onClick={() => setKind(k)} style={tabStyle(k === kind)}>
            {KIND_LABEL[k]}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by filename…"
          style={{
            flex: 1,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            fontFamily: 'monospace',
            fontSize: '12px',
            padding: '8px 12px',
            outline: 'none',
          }}
        />
        <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '11px' }}>
          {filtered.length} of {items.length}
        </span>
      </div>

      {loading && <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Loading…</p>}
      {error && <p style={{ color: 'var(--error)', fontSize: '12px' }}>{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          No {kind} files in R2.
        </p>
      )}

      {!loading && !error && kind === 'image' && filtered.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '12px',
          }}
        >
          {filtered.map((item) => (
            <div
              key={item.key}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt=""
                loading="lazy"
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  objectFit: 'cover',
                  background: 'var(--bg)',
                }}
              />
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.key.split('/').pop()}
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                {fmtSize(item.size)} · {fmtDate(item.uploadedAt)}
              </div>
              <button
                type="button"
                onClick={() => purge(item)}
                disabled={deleting === item.key}
                style={{
                  background: 'none',
                  border: '1px solid var(--error)',
                  color: 'var(--error)',
                  fontFamily: 'monospace',
                  fontSize: '10px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {deleting === item.key ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && kind !== 'image' && filtered.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {filtered.map((item) => (
            <li
              key={item.key}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: '12px',
                alignItems: 'center',
                padding: '12px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.key.split('/').pop()}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {fmtSize(item.size)} · {fmtDate(item.uploadedAt)}
                </div>
                {kind === 'audio' && (
                  <audio src={item.url} controls preload="metadata" style={{ width: '100%', height: '32px', marginTop: '6px' }} />
                )}
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener"
                style={{ color: 'var(--accent)', fontSize: '11px', fontFamily: 'monospace', textDecoration: 'none' }}
              >
                OPEN ↗
              </a>
              <button
                type="button"
                onClick={() => purge(item)}
                disabled={deleting === item.key}
                style={{
                  background: 'none',
                  border: '1px solid var(--error)',
                  color: 'var(--error)',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  padding: '6px 14px',
                  cursor: 'pointer',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {deleting === item.key ? 'Deleting…' : 'Delete'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
