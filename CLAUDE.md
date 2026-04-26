# sergioluque.com

Sitio web del compositor e investigador Sergio Luque. Next.js 15 + Sanity CMS + Cloudflare R2 para audio. Bilingüe ES/EN con next-intl.

## Commands

- `pnpm dev` — Servidor de desarrollo en localhost:3000
- `pnpm build` — Build de producción
- `pnpm lint` — ESLint
- `pnpm test` — Playwright E2E tests
- `cd sanity && pnpm dev` — Sanity Studio en localhost:3333
- `cd sanity && pnpm deploy` — Deploy del Studio a producción

## Tech Stack

Next.js 15 (App Router) + TypeScript strict + Tailwind CSS v4 + shadcn/ui + Sanity Studio v3 + next-intl + Cloudflare R2 + Resend + Vercel

## Architecture

### Directory Structure
- `src/app/[locale]/` — Todas las páginas bajo el locale prefix (es/en)
- `src/components/audio/` — AudioPlayer, AudioPlayerMini, WaveformBars
- `src/components/layout/` — Header, Footer, LanguageSwitcher
- `src/lib/sanity/` — client.ts, queries.ts, image.ts
- `src/messages/` — Strings de UI en es.json y en.json
- `sanity/schemas/` — Definición de content types

### Data Flow
Server Components hacen GROQ queries directamente a Sanity en el servidor (ISR, revalidate: 3600). Cuando Sergio publica en Sanity Studio, un webhook llama `/api/revalidate` que regenera las páginas vía revalidatePath. El audio se sirve desde Cloudflare R2 (URLs públicas almacenadas en Sanity).

### Key Patterns
- Server Components por defecto. Solo "use client" en: AudioPlayer, LanguageSwitcher, ContactForm
- Todas las GROQ queries en `src/lib/sanity/queries.ts` — nunca inline en páginas
- i18n: useTranslations() para strings UI, campos localizados en Sanity para contenido
- Imágenes: siempre usar urlForImage() de `src/lib/sanity/image.ts` + next/image

## Design System

### Colors (CSS variables en globals.css)
- `--bg`: #0A0A0A — fondo de página
- `--surface`: #141414 — cards, paneles
- `--surface-hover`: #1E1E1E — hover states
- `--border`: #2A2A2A — bordes
- `--text-primary`: #F0F0F0 — texto principal
- `--text-secondary`: #888888 — metadatos, fechas
- `--text-muted`: #555555 — texto secundario
- `--accent`: #D4D4D4 — links, accents
- `--error`: #EF4444
- `--success`: #22C55E

### Typography
- Headings/Labels/Metadata: Space Mono (700 para títulos, 400 para labels)
- Body/Long text: IBM Plex Sans 400, 16px, line-height 1.7
- Ambas fuentes via next/font/google

### Style
- Border radius: 0px (sharp, sin redondeos — excepción: 2px en progress bar del player)
- Shadows: ninguna
- Spacing base: 4px (escala: 4, 8, 12, 16, 24, 32, 48, 64, 96)
- Max-width: 1200px con padding 24px mobile / 48px desktop
- Estética: monocromático, stark, académico. Sin colores vivos.

## Environment Variables

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ID del proyecto Sanity |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset de Sanity (production) |
| `SANITY_API_TOKEN` | Token de solo lectura de Sanity |
| `SANITY_WEBHOOK_SECRET` | Secret para validar webhooks de revalidación |
| `RESEND_API_KEY` | API key de Resend para formulario de contacto |
| `CONTACT_EMAIL` | Email de destino para mensajes de contacto |

## Reglas No Negociables

1. TypeScript strict. Sin `any`. Sin `@ts-ignore` excepto con explicación de por qué.
2. Server Components por defecto. "use client" solo cuando sea estrictamente necesario (interactividad, browser APIs).
3. Todas las GROQ queries en `lib/sanity/queries.ts`. Nunca hacer fetch a Sanity inline en un page.tsx.
4. Un componente por archivo. Máximo 300 líneas por archivo. Si es más largo, extraer sub-componentes.
5. Siempre usar las CSS variables del design system. Nunca hex hardcodeados en componentes.
6. El reproductor de audio debe funcionar en iOS Safari (no autoplay, siempre iniciar desde user interaction).
7. Todas las páginas deben ser accesibles via keyboard nav. Focus states visibles (outline 2px en --accent).
8. Los textos bilingüales en Sanity son `{es: string, en: string}`. Siempre usar el locale correcto del contexto next-intl.
