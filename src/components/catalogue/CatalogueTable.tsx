'use client'

import { useMemo, useState } from 'react'
import { S } from '@/lib/strings'
import type { CatalogueEntry, CatalogueCategory } from '@/types'

interface CatalogueTableProps {
  entries: CatalogueEntry[]
}

type Filter = 'all' | CatalogueCategory

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: S.catalogue.filterAll },
  { key: 'vocal_instrumental_mixed', label: S.catalogue.filterMixed },
  { key: 'electroacoustic', label: S.catalogue.filterElectro },
]

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-space-mono)',
  fontSize: '10px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
}

export function CatalogueTable({ entries }: CatalogueTableProps) {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? entries
        : entries.filter((e) => e.category === filter),
    [entries, filter]
  )

  return (
    <div>
      {/* Header row: title left, filter tabs right (mirrors the brief). */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        <h2 className="t-h2" style={{ margin: 0 }}>
          {S.catalogue.title}
        </h2>
        <ul
          role="tablist"
          aria-label={S.catalogue.title}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}
        >
          {FILTERS.map((f) => {
            const active = f.key === filter
            return (
              <li key={f.key}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f.key)}
                  className="catalogue-filter"
                  data-active={active}
                  style={{
                    // Pill: each option gets its own bounded box so the
                    // multi-word label (Vocal · Instrumental · Mixed)
                    // reads as one chip rather than three loose words.
                    display: 'inline-flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '10px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '6px 12px',
                    border: '1px solid',
                    borderColor: active ? 'var(--text-primary)' : 'var(--border)',
                    background: active ? 'var(--text-primary)' : 'transparent',
                    color: active ? 'var(--bg)' : 'var(--text-muted)',
                    transition:
                      'color 180ms ease, background 180ms ease, border-color 180ms ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {f.label}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Column headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '80px 1fr 1.4fr 130px',
          gap: '24px',
          padding: '16px 0',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span style={labelStyle}>{S.catalogue.columnYear}</span>
        <span style={labelStyle}>{S.catalogue.columnTitle}</span>
        <span style={labelStyle}>{S.catalogue.columnInstrumentation}</span>
        <span style={{ ...labelStyle, textAlign: 'right' }}>
          {S.catalogue.columnReference}
        </span>
      </div>

      {/* Rows */}
      {filtered.length === 0 ? (
        <p className="t-meta" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>
          {S.catalogue.empty}
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {filtered.map((entry) => (
            <CatalogueRow key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </div>
  )
}

function CatalogueRow({ entry }: { entry: CatalogueEntry }) {
  return (
    <li
      className="catalogue-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr 1.4fr 130px',
        gap: '24px',
        alignItems: 'baseline',
        padding: '20px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: '12px',
          color: 'var(--text-muted)',
          letterSpacing: '0.05em',
        }}
      >
        {entry.yearText ?? (entry.yearSort ? String(entry.yearSort) : '')}
      </span>
      <h3
        className="catalogue-row-title"
        style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: '15px',
          fontWeight: 700,
          color: 'var(--heading)',
          margin: 0,
          letterSpacing: '-0.01em',
          transition: 'color 180ms ease',
        }}
      >
        {entry.title}
      </h3>
      <p
        className="t-meta"
        style={{
          margin: 0,
          color: 'var(--text-secondary)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {entry.instrumentation ?? ''}
      </p>
      <ResourceIcons entry={entry} />
    </li>
  )
}

// ── Resource icons (right-aligned in the row) ───────────────────────────

function ResourceIcons({ entry }: { entry: CatalogueEntry }) {
  const items = [
    entry.listenUrl
      ? { url: entry.listenUrl, label: S.catalogue.listen, icon: <ListenIcon /> }
      : null,
    entry.scoreUrl
      ? { url: entry.scoreUrl, label: S.catalogue.viewScore, icon: <ScoreIcon /> }
      : null,
    entry.patchUrl
      ? { url: entry.patchUrl, label: S.catalogue.viewPatch, icon: <PatchIcon /> }
      : null,
    entry.videoUrl
      ? { url: entry.videoUrl, label: S.catalogue.watchVideo, icon: <VideoIcon /> }
      : null,
    entry.losslessUrl
      ? { url: entry.losslessUrl, label: S.catalogue.downloadLossless, icon: <LosslessIcon /> }
      : null,
  ].filter(<T,>(x: T | null): x is T => x !== null)

  if (items.length === 0) {
    return <span aria-hidden style={{ display: 'block', textAlign: 'right', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '11px' }}>—</span>
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
      {items.map((it) => (
        <a
          key={it.url}
          href={it.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={it.label}
          title={it.label}
          className="catalogue-ref-link"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            transition: 'color 180ms ease, transform 180ms ease',
          }}
        >
          {it.icon}
        </a>
      ))}
    </div>
  )
}

// 14×14 monoline glyphs, currentColor stroke/fill so they pick up theme.
function ListenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 4 L5 10 L9.5 7 Z" fill="currentColor" stroke="none" />
      <circle cx="7" cy="7" r="6" />
    </svg>
  )
}
function ScoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 1.5 H8.5 L11 4 V12.5 H3 Z" />
      <path d="M8.5 1.5 V4 H11" />
      <line x1="5" y1="6.5" x2="9" y2="6.5" />
      <line x1="5" y1="9" x2="9" y2="9" />
    </svg>
  )
}
function PatchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="5,4 2,7 5,10" />
      <polyline points="9,4 12,7 9,10" />
    </svg>
  )
}
function VideoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="1.5" y="3" width="8" height="8" />
      <polygon points="9.5,5 12.5,3.5 12.5,10.5 9.5,9" fill="currentColor" stroke="none" />
    </svg>
  )
}
function LosslessIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 6 V8 a1 1 0 0 0 1 1 H5 V5 H4 a1 1 0 0 0 -1 1 Z" fill="currentColor" stroke="none" />
      <path d="M9 6 V8 a1 1 0 0 0 1 1 H11 V5 H10 a1 1 0 0 0 -1 1 Z" fill="currentColor" stroke="none" />
      <path d="M5 7 a2 2 0 0 1 4 0" />
    </svg>
  )
}
