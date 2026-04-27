'use client'

import { useRef, useState, type DragEvent } from 'react'

type FileKind = 'audio' | 'image' | 'pdf'

interface FileUploadProps {
  label?: string
  kind: FileKind
  value: string
  onChange: (url: string) => void
  uploadFile: (file: File) => Promise<string | null>
  deleteFile: (url: string) => Promise<boolean>
}

const ACCEPT: Record<FileKind, string> = {
  audio: 'audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/m4a,audio/aac,.mp3,.m4a,.mp4,.aac',
  image: 'image/*',
  pdf: 'application/pdf',
}

const HINT: Record<FileKind, string> = {
  audio: 'MP3 · M4A · MP4 · AAC',
  image: 'JPG · PNG · WebP',
  pdf: 'PDF',
}

const ICON: Record<FileKind, string> = {
  audio: '♪',
  image: '▣',
  pdf: '▤',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  letterSpacing: '0.1em',
  color: 'var(--text-muted)',
  marginBottom: '6px',
  textTransform: 'uppercase',
}

export function FileUpload({
  label,
  kind,
  value,
  onChange,
  uploadFile,
  deleteFile,
}: FileUploadProps) {
  const ref = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file: File) {
    setError('')
    setUploading(true)
    setProgress(20)
    const tick = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 5 : p))
    }, 150)
    const url = await uploadFile(file)
    clearInterval(tick)
    setProgress(100)
    if (url) onChange(url)
    else setError('No se pudo subir')
    setTimeout(() => {
      setUploading(false)
      setProgress(0)
    }, 300)
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
    if (ref.current) ref.current.value = ''
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  async function handleRemove() {
    if (!value) return
    if (/\/media\//.test(value)) {
      if (!confirm('¿Eliminar el archivo del servidor? Esta acción no se puede deshacer.')) return
      await deleteFile(value)
    }
    onChange('')
  }

  // ── Loaded state ─────────────────────────────────────────────
  if (value && !uploading) {
    return (
      <div style={{ marginBottom: '20px' }}>
        {label && <label style={labelStyle}>{label}</label>}
        <div
          style={{
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {kind === 'image' ? (
            <img
              src={value}
              alt=""
              style={{
                width: '64px',
                height: '64px',
                objectFit: 'cover',
                border: '1px solid var(--border)',
                flexShrink: 0,
              }}
            />
          ) : (
            <span
              style={{
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: 'var(--text-secondary)',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                flexShrink: 0,
              }}
            >
              {ICON[kind]}
            </span>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {value.split('/').pop()}
            </div>
            {kind === 'audio' && (
              <audio
                controls
                src={value}
                style={{ width: '100%', height: '32px', marginTop: '6px' }}
              />
            )}
            {kind === 'pdf' && (
              <a
                href={value}
                target="_blank"
                rel="noopener"
                style={{
                  color: 'var(--accent)',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              >
                Abrir PDF →
              </a>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => ref.current?.click()}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontFamily: 'monospace',
                fontSize: '10px',
                padding: '4px 10px',
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
            >
              REEMPLAZAR
            </button>
            <button
              type="button"
              onClick={handleRemove}
              style={{
                background: 'none',
                border: '1px solid var(--error)',
                color: 'var(--error)',
                fontFamily: 'monospace',
                fontSize: '10px',
                padding: '4px 10px',
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
            >
              QUITAR
            </button>
          </div>
        </div>
        <input
          ref={ref}
          type="file"
          accept={ACCEPT[kind]}
          onChange={onPick}
          style={{ display: 'none' }}
        />
        {error && (
          <p style={{ color: 'var(--error)', fontSize: '11px', marginTop: '4px' }}>{error}</p>
        )}
      </div>
    )
  }

  // ── Empty / Uploading state ──────────────────────────────────
  return (
    <div style={{ marginBottom: '20px' }}>
      {label && <label style={labelStyle}>{label}</label>}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && ref.current?.click()}
        style={{
          border: `1px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
          background: dragOver ? 'var(--surface-hover)' : 'var(--surface)',
          padding: '24px',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          transition: 'background 120ms ease, border-color 120ms ease',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            fontSize: '24px',
            color: 'var(--text-secondary)',
            marginBottom: '6px',
          }}
        >
          {ICON[kind]}
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
          {uploading ? `Subiendo… ${progress}%` : 'SELECCIONAR ARCHIVO'}
        </div>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '10px',
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
          }}
        >
          {HINT[kind]}
        </div>
        {uploading && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              height: '2px',
              width: `${progress}%`,
              background: 'var(--accent)',
              transition: 'width 150ms ease',
            }}
          />
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept={ACCEPT[kind]}
        onChange={onPick}
        style={{ display: 'none' }}
      />
      {error && (
        <p style={{ color: 'var(--error)', fontSize: '11px', marginTop: '4px' }}>{error}</p>
      )}
    </div>
  )
}
