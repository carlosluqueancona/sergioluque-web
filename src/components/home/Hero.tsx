import { HeroLissajous } from './HeroLissajous'

const COPY = {
  practice: 'Composer',
  catalog: 'Works catalogue',
  scrollHint: 'Scroll for catalogue',
  // Three-word manifesto: each word stands alone as a complete statement
  // about the practice. Rendered one-per-line for giant-scale impact.
  headingWords: ['Instrumental.', 'Electroacoustic.', 'Stochastic synthesis.'] as const,
} as const

export function Hero() {
  const t = COPY

  return (
    <section
      className="hero-section"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        // Hero shares the 1200 px shell used by the header and the rest
        // of the site so the wordmark column lines up with the SERGIO
        // LUQUE wordmark above it (was 1400 — drifted off-grid on
        // wider viewports).
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 48px 0',
        isolation: 'isolate',
      }}
    >
      {/*
        Hero film-grain overlay — kept available but commented out while
        the Lissajous canvas is the active background. Swap by toggling
        which of the two next lines is rendered.
        <HeroNoise />

        HeroLissajous reads its config from window.__LIS_CFG__, populated
        by the inline script in <head> from layout.tsx. No props needed.
      */}
      <HeroLissajous />

      {/* All foreground content sits in this wrapper at z-index 1 so the
          Lissajous canvas (z-index 0) stays behind without each child
          needing its own positioning. */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>

      {/* Main wordmark */}
      <div
        className="hero-wordmark-col"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '64px 0',
          position: 'relative',
        }}
      >
        {/* Annotation column */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            fontFamily: 'var(--font-space-mono)',
            fontSize: '10px',
            color: 'var(--text-muted)',
            letterSpacing: '0.15em',
          }}
        >
{/*           <span>01</span>
          <span>02</span> */}
        </div>

        {/*
          Hero H1 — three-word manifesto, each on its own line at giant
          scale. Functions as visual anchor + semantic page heading. The
          descriptive sentence with all the SEO-target keywords lives in
          the subtitle <p> below.
        */}
        <h1
          className="hero-wordmark hero-indent"
          style={{
            fontFamily: 'var(--font-space-mono)',
            // Was clamp(36, 8vw, 120) — "Electroacoustic." (16 chars
            // monospace) overran the section padding on tablet / large
            // mobile viewports. 7vw + 96px max keeps the longest word
            // inside the 1200 px shell with breathing room, and the
            // tighter letter-spacing claws back a few extra pixels.
            fontSize: 'clamp(34px, 7vw, 96px)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
            lineHeight: 0.96,
            letterSpacing: '-0.04em',
          }}
        >
          {t.headingWords.map((word) => (
            <span key={word} style={{ display: 'block' }}>
              {word}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p
          className="hero-indent"
          style={{
            marginTop: '40px',
            fontFamily: 'var(--font-ibm-plex-sans)',
            fontSize: '17px',
            // Lighter than --text-secondary, derived from --text-primary
            // so it adapts to dark/light themes automatically.
            color: 'var(--text-primary)',
            opacity: 0.7,
            margin: '40px 0 0',
            maxWidth: '480px',
            lineHeight: 1.55,
          }}
        >
          {t.practice}
        </p>
      </div>

      {/* Bottom rail */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '14px',
          paddingBottom: '24px',
          borderTop: '1px solid var(--border)',
          fontFamily: 'var(--font-space-mono)',
          fontSize: '10px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        <span>
          <span className="hero-scroll-hint" aria-hidden>↓</span> {t.scrollHint}
        </span>
        <span>{t.catalog}</span>
      </div>
      </div>
    </section>
  )
}

/**
 * Discrete film-grain overlay generated entirely by the SVG filter pipeline.
 *
 *  - feTurbulence(fractalNoise) → high-frequency monochrome noise
 *  - feColorMatrix saturate=0  → strip residual hue from the turbulence
 *  - mix-blend-mode: overlay   → lightens lights / darkens darks, so the
 *                                effect reads correctly in both light and
 *                                dark theme without any conditional CSS
 *  - <animate> on seed         → 6 discrete frames over 1.2s ≈ 5fps grain
 *                                shimmer. Cheap, no JS, no rAF.
 *
 * `prefers-reduced-motion: reduce` users see the noise but no shimmer.
 */
// Exported so the lint pass treats it as intentional API even when the
// JSX call site is commented out — preserves the noise option as a
// drop-in replacement for HeroLissajous.
export function HeroNoise() {
  return (
    <svg
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.85,
        mixBlendMode: 'hard-light',
        zIndex: 1,
      }}
    >
      <filter id="hero-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.55"
          numOctaves="2"
          stitchTiles="stitch"
          seed="3"
        >
          <animate
            attributeName="seed"
            values="3;19;47;91;128;73"
            dur="1.2s"
            repeatCount="indefinite"
            calcMode="discrete"
          />
        </feTurbulence>
        <feColorMatrix type="saturate" values="0" />
        {/* Push the noise mid-tones outward to pure black/white — gives a
           much higher-contrast filmic grain than the default fractalNoise. */}
        <feComponentTransfer>
          <feFuncR type="linear" slope="2.2" intercept="-0.6" />
          <feFuncG type="linear" slope="2.2" intercept="-0.6" />
          <feFuncB type="linear" slope="2.2" intercept="-0.6" />
        </feComponentTransfer>
      </filter>
      <rect width="100%" height="100%" filter="url(#hero-grain)" />
    </svg>
  )
}

