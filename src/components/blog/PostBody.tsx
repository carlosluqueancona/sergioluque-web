// PostBody renders Markdown-like long-form content stored in D1 as a
// plain string. Used by /bio, /blog, /listen, /projects, and /news.
//
// Supported syntax (intentionally minimal, no external dependency):
//
//   ## Heading            → <h2>
//   ### Heading           → <h3>
//   - item                → <ul><li>
//   * item                → <ul><li>
//   1. item               → <ol><li>
//   > quote               → <blockquote>
//   --- (or ***)          → <hr>
//   **bold**              → <strong>
//   *italic*  _italic_    → <em>
//   `code`                → <code>
//   [label](url)          → <a> (target=_blank for absolute URLs)
//   bare http(s)://… URL  → autolinked <a>
//
// Blank lines split blocks. Single newlines inside a paragraph are
// preserved as <br/> so existing line-broken descriptions still
// render with the same shape.

import type { ReactNode, JSX } from 'react'

interface PostBodyProps {
  value: string
}

/**
 * Inline-token renderer. Walks the input string left-to-right,
 * matching the longest meaningful pattern at each position. Order
 * matters — code first so backticked **content** stays literal.
 */
function renderInline(input: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = []
  let i = 0
  let buf = ''
  let counter = 0

  const flushText = () => {
    if (!buf) return
    out.push(buf)
    buf = ''
  }
  const pushNode = (node: ReactNode) => {
    flushText()
    out.push(<span key={`${keyPrefix}-${counter++}`}>{node}</span>)
  }

  while (i < input.length) {
    const ch = input[i]
    const rest = input.slice(i)

    // Inline code
    if (ch === '`') {
      const end = input.indexOf('`', i + 1)
      if (end !== -1) {
        pushNode(<code>{input.slice(i + 1, end)}</code>)
        i = end + 1
        continue
      }
    }

    // Bold **text**
    if (ch === '*' && input[i + 1] === '*') {
      const end = input.indexOf('**', i + 2)
      if (end !== -1) {
        const inner = input.slice(i + 2, end)
        pushNode(<strong>{renderInline(inner, `${keyPrefix}-b${counter}`)}</strong>)
        i = end + 2
        continue
      }
    }

    // Italic *text* or _text_
    if (ch === '*' || ch === '_') {
      const marker = ch
      const end = input.indexOf(marker, i + 1)
      if (
        end !== -1 &&
        end > i + 1 &&
        // Avoid matching ** as italic
        !(marker === '*' && input[i + 1] === '*')
      ) {
        const inner = input.slice(i + 1, end)
        if (!/^\s|\s$/.test(inner)) {
          pushNode(<em>{renderInline(inner, `${keyPrefix}-i${counter}`)}</em>)
          i = end + 1
          continue
        }
      }
    }

    // Markdown link [text](url)
    if (ch === '[') {
      const labelEnd = input.indexOf(']', i + 1)
      if (labelEnd !== -1 && input[labelEnd + 1] === '(') {
        const urlEnd = input.indexOf(')', labelEnd + 2)
        if (urlEnd !== -1) {
          const label = input.slice(i + 1, labelEnd)
          const url = input.slice(labelEnd + 2, urlEnd).trim()
          const external = /^https?:\/\//i.test(url)
          pushNode(
            <a
              href={url}
              {...(external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              {renderInline(label, `${keyPrefix}-l${counter}`)}
            </a>
          )
          i = urlEnd + 1
          continue
        }
      }
    }

    // Bare URL autolink
    if (ch === 'h' && /^https?:\/\//i.test(rest)) {
      const m = rest.match(/^https?:\/\/[^\s<>()"]+/i)
      if (m) {
        const url = m[0]
        pushNode(
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
        )
        i += url.length
        continue
      }
    }

    buf += ch
    i++
  }
  flushText()
  return out
}

/**
 * Group consecutive list-item lines into a single block. Returns the
 * detected list flavour ('ul' | 'ol') or null if the line isn't a
 * list item.
 */
function listKind(line: string): 'ul' | 'ol' | null {
  if (/^\s*[-*]\s+/.test(line)) return 'ul'
  if (/^\s*\d+\.\s+/.test(line)) return 'ol'
  return null
}

function stripListMarker(line: string, kind: 'ul' | 'ol'): string {
  if (kind === 'ul') return line.replace(/^\s*[-*]\s+/, '')
  return line.replace(/^\s*\d+\.\s+/, '')
}

export function PostBody({ value }: PostBodyProps) {
  const blocks = value.split(/\n{2,}/).filter((b) => b.trim().length > 0)

  return (
    <div className="post-body">
      {blocks.map((block, idx) => {
        const trimmed = block.trim()

        // Horizontal rule
        if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
          return <hr key={idx} />
        }

        // Heading
        const h3 = trimmed.match(/^###\s+(.+)$/)
        if (h3) return <h3 key={idx}>{renderInline(h3[1], `${idx}`)}</h3>
        const h2 = trimmed.match(/^##\s+(.+)$/)
        if (h2) return <h2 key={idx}>{renderInline(h2[1], `${idx}`)}</h2>

        // Blockquote — a contiguous run of "> "-prefixed lines
        if (/^>\s?/.test(trimmed)) {
          const inner = trimmed
            .split('\n')
            .map((l) => l.replace(/^>\s?/, ''))
            .join('\n')
          return (
            <blockquote key={idx}>
              {renderInline(inner, `${idx}`)}
            </blockquote>
          )
        }

        // List — first line decides flavour, all lines must match
        const lines = block.split('\n')
        const kind = listKind(lines[0])
        if (kind && lines.every((l) => l.trim() === '' || listKind(l) === kind)) {
          const items = lines
            .filter((l) => l.trim().length > 0)
            .map((l) => stripListMarker(l, kind))
          const Tag = kind as keyof JSX.IntrinsicElements
          return (
            <Tag key={idx}>
              {items.map((item, j) => (
                <li key={j}>{renderInline(item, `${idx}-${j}`)}</li>
              ))}
            </Tag>
          )
        }

        // Paragraph — preserve internal line breaks as <br/>
        const lineNodes: ReactNode[] = []
        const lns = block.split('\n')
        lns.forEach((l, j) => {
          if (j > 0) lineNodes.push(<br key={`br-${idx}-${j}`} />)
          lineNodes.push(...renderInline(l, `${idx}-${j}`))
        })
        return <p key={idx}>{lineNodes}</p>
      })}
    </div>
  )
}
