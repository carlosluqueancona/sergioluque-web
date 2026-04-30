#!/usr/bin/env node
/**
 * Block `export const runtime` in files where Next.js does NOT honor it.
 *
 * Why: route-segment config (runtime, dynamic, revalidate, …) only applies
 * to `page`, `layout`, `route`, and metadata files. Putting it on a
 * `template.tsx`, `error.tsx`, `loading.tsx`, `not-found.tsx`, `default.tsx`,
 * or `global-error.tsx` is silently wrong: TypeScript and Next's build pass,
 * but `@cloudflare/next-on-pages` emits a Node render fn for the file, the
 * Pages worker can't execute it, and every dynamic page hangs at the edge
 * with `103 Early Hints` and no body.
 *
 * Production was offline once for ~40 minutes because of this exact mistake
 * on `src/app/template.tsx`. This guard runs in `pnpm lint` and on CI before
 * build so we catch it at the PR stage, not in prod.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, basename, extname } from 'node:path'

const ROOT = new URL('../src/app', import.meta.url).pathname

// Files where `export const runtime` is not honored. Stem (no extension).
const FORBIDDEN_STEMS = new Set([
  'template',
  'error',
  'loading',
  'not-found',
  'default',
  'global-error',
])

const RUNTIME_EXPORT = /^\s*export\s+const\s+runtime\s*=/m

const offenders = []

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    const st = statSync(path)
    if (st.isDirectory()) { walk(path); continue }
    const ext = extname(name)
    if (ext !== '.ts' && ext !== '.tsx') continue
    const stem = basename(name, ext)
    if (!FORBIDDEN_STEMS.has(stem)) continue
    const src = readFileSync(path, 'utf8')
    if (RUNTIME_EXPORT.test(src)) {
      offenders.push(relative(process.cwd(), path))
    }
  }
}

walk(ROOT)

if (offenders.length > 0) {
  console.error(
    '\nERROR: `export const runtime` found in files that do not support it:\n'
  )
  for (const f of offenders) console.error(`  - ${f}`)
  console.error(
    '\nNext.js segment config (runtime, dynamic, revalidate, …) only applies to\n' +
    'page.{ts,tsx}, layout.{ts,tsx}, route.ts, and metadata files. Putting it on\n' +
    'template/error/loading/not-found/default/global-error breaks the\n' +
    '@cloudflare/next-on-pages build and hangs production.\n' +
    '\nFix: remove the export. The file inherits runtime from the page that\n' +
    'wraps it (which is already edge in this repo).\n'
  )
  process.exit(1)
}

console.log('check-runtime-misuse: ok')
