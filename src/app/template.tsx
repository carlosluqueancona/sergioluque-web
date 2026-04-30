import type { ReactNode } from 'react'

// REQUIRED: Cloudflare Pages can only run edge-runtime code. Without
// this export, @cloudflare/next-on-pages emits a Node.js render
// function for the template, which the Pages worker cannot execute —
// every dynamic page hangs (no HTTP response, requests time out at
// the edge). Took the production site offline once already.
export const runtime = 'edge'

// Route-segment template — Next.js re-mounts this on every navigation
// (unlike layout.tsx which persists). The `data-page-anim` attribute
// triggers the CSS keyframes defined in globals.css so each new page
// fades up softly and its top-level <section>s cascade in 80ms apart.
//
// Pure CSS animation, no client JS, RSC-friendly. Honors
// prefers-reduced-motion via a media query in globals.css.
export default function Template({ children }: { children: ReactNode }) {
  return <div data-page-anim>{children}</div>
}
