# sergioluque.com

Sitio web del compositor e investigador Sergio Luque. **Next.js 15 + Cloudflare Pages + Cloudflare Worker (Hono) + D1 + R2.** Admin propio en `/admin` con JWT — sin CMS de terceros. Inglés monolingüe (migrado desde next-intl).

## Commands

- `pnpm dev` — Next.js dev server en localhost:3000
- `pnpm build` — Build de Next.js
- `pnpm lint` — ESLint
- `pnpm worker:dev` — Worker (Hono) dev server en localhost:8787
- `pnpm worker:deploy` — Deploy del Worker a Cloudflare
- `pnpm pages:deploy` — Build con `@cloudflare/next-on-pages` y deploy a Cloudflare Pages

## Tech Stack

Next.js 15 (App Router, **edge runtime obligatorio**) · TypeScript strict · Tailwind CSS v4 · shadcn/ui · React 19 · React Hook Form + Zod · Hono (Worker) · Cloudflare D1 (DB) · Cloudflare R2 (media) · Resend (contacto) · JWT casero para admin

## Architecture

### Repo layout
- `src/app/` — Páginas Next.js (sin `[locale]`; el sitio es monolingüe). Edge runtime en TODA page y route.
- `src/app/admin/` — Admin UI (login, dashboard, listados, forms, media library, settings).
- `src/app/api/admin/` — Routes Next.js que **proxean** al Worker, reenviando cookies JWT.
- `src/components/` — `audio/`, `home/`, `layout/`, `works/`, `projects/`, `blog/`, `concerts/`, `contact/`, `admin/`, `ui/` (shadcn).
- `src/lib/db/` — `client.ts` y `queries.ts` (todo acceso a datos pasa por aquí).
- `src/lib/admin/` — `jwt.ts`, `schemas.ts` (definición de entidades admin).
- `src/lib/audio/` — `useAudioGraph.ts` (AnalyserNode + exclusive playback).
- `src/lib/strings.ts` — UI strings centralizados (post-migración de next-intl).
- `src/lib/lissajous-config.ts`, `lissajous-presets.ts` — Hero panel.
- `worker/` — Worker Hono separado: `src/index.ts`, `routes/{content,admin,upload}.ts`.
- `schema.sql` — Schema de D1.
- `wrangler.toml` (raíz) — Bindings de Pages (DB, MEDIA). `worker/wrangler.toml` — Worker (DB, MEDIA, ALLOWED_ORIGINS).

### Data flow
1. **Lectura pública**: las páginas (Server Components, edge) hacen fetch al Worker `/content/*` desde `src/lib/db/queries.ts`.
2. **Admin**: el browser hace request a `/api/admin/*` (Next.js, edge) → Next proxea al Worker `/admin/*` reenviando la cookie JWT `sl_admin_jwt`.
3. **Login**: `POST /api/admin/login` → Worker valida → Worker emite cookie httpOnly → Next reenvía `Set-Cookie` al browser.
4. **Media**: subidas → `/api/admin/upload` → Worker → R2 bucket `sergioluque-media`. Servido público vía `GET /media/*` del Worker.
5. **Detail pages** usan `force-dynamic` para que las ediciones del admin se vean inmediatamente.

### Key patterns
- Server Components por defecto. `'use client'` solo cuando hay browser API o estado (AudioPlayer, ContactForm, ThemeToggle, admin forms, panel Lissajous).
- TODA query de datos en `src/lib/db/queries.ts` — nunca inline en `page.tsx`.
- Edge runtime: cada page y route lleva `export const runtime = 'edge'`.
- Auth admin: cookie httpOnly `sl_admin_jwt`. En Server Components, leer con `cookies()` y `redirect('/admin/login')` si falta.
- Audio: nunca autoplay (iOS Safari). Exclusive playback — un audio pausa los demás vía `useAudioGraph`.
- Theme dark/light con anti-FOUC (script inline en `<head>` antes de hidratar).

## Design System

### Colors (CSS variables en `src/app/globals.css`)
Dual light/dark con custom toggle. Variables base (dark):
- `--bg`: #0A0A0A
- `--surface`: #141414
- `--surface-hover`: #1E1E1E
- `--border`: #2A2A2A
- `--text-primary`: #F0F0F0
- `--text-secondary`: #888888
- `--text-muted`: #555555
- `--accent`: #D4D4D4
- `--error`: #EF4444
- `--success`: #22C55E

### Typography
- Headings/labels/metadata: **Space Mono** (700 títulos, 400 labels)
- Body: **IBM Plex Sans** 400, 16px, line-height 1.7
- Ambas vía `next/font/google`

### Style
- Border radius: 0px (sharp; excepción: 2px en progress bar del player)
- Shadows: ninguna
- Spacing base 4px (4, 8, 12, 16, 24, 32, 48, 64, 96)
- Max-width: 1200px, padding 24px mobile / 48px desktop
- Estética: monocromático, stark, académico

## Environment Variables

### Next.js (Pages)
| Variable | Descripción |
|----------|-------------|
| `CMS_API_URL` | URL del Worker (prod: `https://sergioluque-cms.carlosluque-095.workers.dev`) |
| `RESEND_API_KEY` | API key de Resend (formulario de contacto) |
| `CONTACT_EMAIL` | Destinatario del formulario de contacto |

### Worker
| Variable | Descripción |
|----------|-------------|
| `JWT_SECRET` | Secret para firmar/verificar el JWT de admin |
| `ALLOWED_ORIGINS` | CSV de orígenes CORS permitidos |
| Binding `DB` | D1 database `sergioluque-db` |
| Binding `MEDIA` | R2 bucket `sergioluque-media` |

## Deploy

- **Pages**: `pnpm pages:deploy` (proyecto `sergioluque-web` en Cloudflare). Live en `https://sergioluque-web.pages.dev`.
- **Worker**: `pnpm worker:deploy` (proyecto `sergioluque-cms`).
- **DNS de `sergioluque.com`**: pendiente de migrar desde Hostinger a Cloudflare Pages (acción manual del usuario).

## Reglas No Negociables

1. TypeScript strict. Sin `any`. Sin `@ts-ignore` salvo con razón documentada.
2. Server Components por defecto. `'use client'` solo cuando es estrictamente necesario.
3. Toda query de datos en `src/lib/db/queries.ts`. Nunca fetch inline en un `page.tsx`.
4. **`export const runtime = 'edge'` en TODA page y route handler.**
5. Un componente por archivo. Máximo 300 líneas; si crece, extraer sub-componentes.
6. Siempre CSS variables del design system. Nada de hex hardcodeado en componentes.
7. AudioPlayer debe funcionar en iOS Safari: nunca autoplay, siempre iniciar desde user interaction.
8. Todas las páginas accesibles vía teclado. Focus states visibles (outline 2px en `--accent`).
9. UI strings en `src/lib/strings.ts` (sitio monolingüe en inglés).
