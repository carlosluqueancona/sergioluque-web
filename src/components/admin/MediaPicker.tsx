'use client'

import { useEffect, useState } from 'react'

export type MediaKind = 'image' | 'audio' | 'pdf'

interface MediaItem {
  key: string
  url: string
  size: number
  uploadedAt: string
  contentType: string
}

interface MediaPickerProps {
  kind: MediaKind
  onSelect: (url: string) => void
  onClose: () => void
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' })
}

const buttonStyle: React.CSSProperties = {
  background: 'var(--text-primary)',
  color: 'var(--bg)',
  border: 'none',
  fontFamily: 'monospace',
  fontSize: '11px',
  padding: '8px 14px',
  cursor: 'pointer',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
}

const ghostStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  fontFamily: 'monospace',
  fontSize: '11px',
  padding: '6px 12px',
  cursor: 'pointer',
  letterSpacing: '0.05em',
}

export function MediaPicker({ kind, onSelect, onClose }: MediaPickerProps) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    fetch(`/api/admin/media?kind=${kind}`)
      .then((r) => r.json())
      .then((data: { items?: MediaItem[]; error?: string }) => {
        if (!active) return
        if (data.error) setError(data.error)
        else setItems(data.items ?? [])
      })
      .catch(() => active && setError('Failed to load library'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [kind])

  // Esc closes
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const q = filter.trim().toLowerCase()
  const filtered = q ? items.filter((it) => it.key.toLowerCase().includes(q)) : items

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          width: 'min(960px, 100%)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'monospace',
        }}
      >
        <header
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--font-space-mono)',
              fontSize: '13px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {kind} library
          </h2>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by filename…"
            autoFocus
            style={{
              flex: 1,
              minWidth: '180px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: 'monospace',
              fontSize: '12px',
              padding: '6px 10px',
              outline: 'none',
            }}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
            {filtered.length} of {items.length}
          </span>
          <button onClick={onClose} style={ghostStyle}>
            CLOSE
          </button>
        </header>

        <div style={{ overflow: 'auto', padding: '16px 20px', flex: 1 }}>
          {loading && (
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Loading…</p>
          )}
          {error && (
            <p style={{ color: 'var(--error)', fontSize: '12px' }}>{error}</p>
          )}
          {!loading && !error && filtered.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              No {kind} files found.
            </p>
          )}

          {kind === 'image' && filtered.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '12px',
              }}
            >
              {filtered.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    onSelect(item.url)
                    onClose()
                  }}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    padding: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
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
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.key.split('/').pop()}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                    {fmtSize(item.size)} · {fmtDate(item.uploadedAt)}
                  </div>
                </button>
              ))}
            </div>
          )}

          {kind === 'audio' && filtered.length > 0 && (
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
                    gridTemplateColumns: '1fr auto',
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
                        fontSize: '12px',
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.key.split('/').pop()}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {fmtSize(item.size)} · {fmtDate(item.uploadedAt)}
                    </div>
                    <audio
                      src={item.url}
                      controls
                      preload="metadata"
                      style={{ width: '100%', height: '32px', marginTop: '6px' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(item.url)
                      onClose()
                    }}
                    style={buttonStyle}
                  >
                    Use
                  </button>
                </li>
              ))}
            </ul>
          )}

          {kind === 'pdf' && filtered.length > 0 && (
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
                        fontSize: '12px',
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.key.split('/').pop()}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {fmtSize(item.size)} · {fmtDate(item.uploadedAt)}
                    </div>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener"
                    style={{ color: 'var(--accent)', fontSize: '11px', fontFamily: 'monospace' }}
                  >
                    OPEN ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(item.url)
                      onClose()
                    }}
                    style={buttonStyle}
                  >
                    Use
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
