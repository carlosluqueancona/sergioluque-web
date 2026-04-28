'use client'

import { useEffect, useRef, useState, type DragEvent } from 'react'

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

const KIND_ACCEPT: Record<Kind, string> = {
  image: 'image/*',
  audio: 'audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/m4a,audio/aac,.mp3,.m4a,.mp4,.aac',
  pdf: 'application/pdf',
}

const KIND_HINT: Record<Kind, string> = {
  image: 'JPG · PNG · WebP — drag, click, or browse',
  audio: 'MP3 · M4A · MP4 · AAC — drag, click, or browse',
  pdf: 'PDF — drag, click, or browse',
}

const KIND_ICON: Record<Kind, string> = {
  image: '▣',
  audio: '♪',
  pdf: '▤',
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
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  async function handleUpload(file: File) {
    setUploadError('')
    setUploading(true)
    setUploadProgress(20)
    const tick = setInterval(() => {
      setUploadProgress((p) => (p < 85 ? p + 5 : p))
    }, 150)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      clearInterval(tick)
      setUploadProgress(100)
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setUploadError(data.error ?? 'Upload failed')
      } else {
        await load(kind)
      }
    } catch {
      clearInterval(tick)
      setUploadError('Upload failed (connection)')
    } finally {
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
      }, 300)
    }
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void handleUpload(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void handleUpload(file)
  }

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

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{
          border: `1px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
          background: dragOver ? 'var(--surface-hover)' : 'var(--surface)',
          padding: '20px',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          transition: 'background 120ms ease, border-color 120ms ease',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '16px',
        }}
      >
        <div style={{ fontSize: '20px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          {KIND_ICON[kind]}
        </div>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '12px',
            color: 'var(--text-primary)',
            letterSpacing: '0.05em',
            marginBottom: '4px',
          }}
        >
          {uploading
            ? `Uploading… ${uploadProgress}%`
            : `Upload ${KIND_LABEL[kind].toLowerCase()}`}
        </div>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '10px',
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
          }}
        >
          {KIND_HINT[kind]}
        </div>
        {uploading && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              height: '2px',
              width: `${uploadProgress}%`,
              background: 'var(--accent)',
              transition: 'width 150ms ease',
            }}
          />
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={KIND_ACCEPT[kind]}
        onChange={onPickFile}
        style={{ display: 'none' }}
      />
      {uploadError && (
        <p style={{ color: 'var(--error)', fontSize: '11px', marginBottom: '12px', fontFamily: 'monospace' }}>
          {uploadError}
        </p>
      )}

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
