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
        <h2 className="t-label" style={{ margin: 0 }}>
          {S.catalogue.sectionLabel}
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

      {/* Column headers — hidden on mobile via .catalogue-header media rule. */}
      <div
        className="catalogue-header catalogue-grid"
        style={{
          padding: '16px 0',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span style={labelStyle}>{S.catalogue.columnTitle}</span>
        <span style={labelStyle}>{S.catalogue.columnInstrumentation}</span>
        <span style={{ ...labelStyle, textAlign: 'right' }}>
          {S.catalogue.columnYear}
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
      className="catalogue-row catalogue-grid"
      style={{
        padding: '20px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
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
        className="t-meta catalogue-row-instrumentation"
        style={{
          margin: 0,
          color: 'var(--text-secondary)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {entry.instrumentation ?? ''}
      </p>
      <span
        className="catalogue-row-year"
        style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: '12px',
          color: 'var(--text-muted)',
          letterSpacing: '0.05em',
          textAlign: 'right',
        }}
      >
        {entry.yearText ?? (entry.yearSort ? String(entry.yearSort) : '')}
      </span>
    </li>
  )
}

