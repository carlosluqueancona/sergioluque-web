'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

interface ListColumn {
  key: string
  label: string
}

interface EntityListTableProps {
  rows: Record<string, unknown>[]
  route: string
  /** Columns shown in the table (driven by schema.listColumns). */
  listColumns: ListColumn[]
  /**
   * Extra column keys that participate in search but aren't shown.
   * For news this means we still match on venue/city/country/body
   * even though the table only renders title + event_date + city.
   */
  searchableExtraKeys?: string[]
}

type SortDir = 'asc' | 'desc'

interface SortState {
  key: string
  dir: SortDir
}

const labelStyle = {
  textAlign: 'left' as const,
  padding: '8px 12px',
  color: 'var(--text-muted)',
  fontWeight: 400 as const,
  fontSize: '10px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
}

const cellStyle = { padding: '12px' }

/**
 * Build a single lowercase haystack from a row across the given keys.
 * Numbers, booleans, JSON-stringified arrays — everything coerces to
 * lowercase string, so the search matches on whatever the operator
 * sees in any column or in the freeform body of an entity.
 */
function buildHaystack(row: Record<string, unknown>, keys: string[]): string {
  const parts: string[] = []
  for (const k of keys) {
    const v = row[k]
    if (v == null) continue
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      parts.push(String(v))
    } else {
      try {
        parts.push(JSON.stringify(v))
      } catch {
        // ignore unserializable values
      }
    }
  }
  parts.push(String(row.id ?? ''))
  return parts.join(' ').toLowerCase()
}

function compareValues(a: unknown, b: unknown): number {
  // Push nulls/undefineds to the bottom regardless of direction —
  // a missing year shouldn't outrank a real one.
  const aNil = a === null || a === undefined || a === ''
  const bNil = b === null || b === undefined || b === ''
  if (aNil && bNil) return 0
  if (aNil) return 1
  if (bNil) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return (a === b ? 0 : a ? -1 : 1)
  }
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

export function EntityListTable({
  rows,
  route,
  listColumns,
  searchableExtraKeys = [],
}: EntityListTableProps) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortState>({ key: 'id', dir: 'desc' })

  const searchKeys = useMemo(
    () => Array.from(new Set([...listColumns.map((c) => c.key), ...searchableExtraKeys])),
    [listColumns, searchableExtraKeys]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => buildHaystack(r, searchKeys).includes(q))
  }, [rows, query, searchKeys])

  const sorted = useMemo(() => {
    const copy = [...filtered]
    copy.sort((a, b) => {
      const cmp = compareValues(a[sort.key], b[sort.key])
      return sort.dir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [filtered, sort])

  function toggleSort(key: string) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    )
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <input
          type="search"
          placeholder="Find — title, venue, city, body…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: '1 1 auto',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            fontFamily: 'monospace',
            fontSize: '13px',
            padding: '8px 12px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          aria-label="Find records"
        />
        <span
          style={{
            color: 'var(--text-muted)',
            fontFamily: 'monospace',
            fontSize: '11px',
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap',
          }}
        >
          {sorted.length} / {rows.length}
        </span>
      </div>

      {sorted.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          {query ? 'No matches.' : 'No records yet. Create the first one.'}
        </p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'monospace',
            fontSize: '12px',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <SortableHeader
                column={{ key: 'id', label: 'ID' }}
                sort={sort}
                onSort={toggleSort}
                width="60px"
              />
              {listColumns.map((col) => (
                <SortableHeader
                  key={col.key}
                  column={col}
                  sort={sort}
                  onSort={toggleSort}
                />
              ))}
              <th style={{ width: '80px' }} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={String(row.id)} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ ...cellStyle, color: 'var(--text-muted)' }}>{String(row.id)}</td>
                {listColumns.map((col) => {
                  const v = row[col.key]
                  let display = ''
                  if (v == null || v === '') display = '—'
                  else if (typeof v === 'number' && col.key === 'is_featured') {
                    display = v === 1 ? '✓' : '—'
                  } else {
                    display = String(v).slice(0, 80)
                  }
                  return (
                    <td key={col.key} style={cellStyle}>
                      {display}
                    </td>
                  )
                })}
                <td style={{ ...cellStyle, textAlign: 'right' }}>
                  <Link
                    href={`/admin/${route}/${row.id}`}
                    style={{ color: 'var(--accent)', fontSize: '11px' }}
                  >
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}

function SortableHeader({
  column,
  sort,
  onSort,
  width,
}: {
  column: ListColumn
  sort: SortState
  onSort: (key: string) => void
  width?: string
}) {
  const active = sort.key === column.key
  const arrow = active ? (sort.dir === 'asc' ? '↑' : '↓') : ''
  return (
    <th style={{ ...labelStyle, width }}>
      <button
        type="button"
        onClick={() => onSort(column.key)}
        style={{
          background: 'none',
          border: 0,
          padding: 0,
          margin: 0,
          color: active ? 'var(--text-primary)' : 'var(--text-muted)',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          letterSpacing: 'inherit',
          textTransform: 'inherit',
          fontWeight: 'inherit',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }}
        aria-label={`Sort by ${column.label}`}
      >
        {column.label}
        <span style={{ width: '10px', display: 'inline-block', textAlign: 'left' }}>
          {arrow}
        </span>
      </button>
    </th>
  )
}
