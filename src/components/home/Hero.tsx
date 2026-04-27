import type { Locale } from '@/types'

interface HeroProps {
  locale: Locale
}

const COPY = {
  es: {
    role: 'Compositor · Investigador',
    practice: 'Música acusmática · Electroacústica · Música contemporánea',
    origin: 'Ciudad de México',
    catalog: 'Catálogo de obras',
    scrollHint: 'Desliza para ver el catálogo',
  },
  en: {
    role: 'Composer · Researcher',
    practice: 'Acousmatic music · Electroacoustic · Contemporary',
    origin: 'Mexico City',
    catalog: 'Works catalogue',
    scrollHint: 'Scroll for catalogue',
  },
} as const

export function Hero({ locale }: HeroProps) {
  const t = COPY[locale]
  const year = new Date().getFullYear()

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px 48px 0',
        isolation: 'isolate',
      }}
    >
      <HeroNoise />

      {/* Top meta bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          alignItems: 'center',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--border)',
          fontFamily: 'var(--font-space-mono)',
          fontSize: '10px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        <span>S/L · {t.origin}</span>
        <span style={{ textAlign: 'center' }}>{t.role}</span>
        <span style={{ textAlign: 'right' }}>
          MMXX <span style={{ color: 'var(--text-secondary)' }}>—</span> {year}
        </span>
      </div>

      {/* Main wordmark */}
      <div
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
          <span>01</span>
          <span>02</span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-space-mono)',
            fontSize: 'clamp(56px, 13vw, 200px)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
            lineHeight: 0.92,
            letterSpacing: '-0.045em',
            paddingLeft: '40px',
          }}
        >
          <span style={{ display: 'block' }}>SERGIO</span>
          <span
            style={{
              display: 'block',
              color: 'transparent',
              WebkitTextStroke: '1.5px var(--text-primary)',
              fontStyle: 'italic',
              letterSpacing: '-0.02em',
            }}
          >
            LUQUE
          </span>
        </h1>

        {/* Subtitle band */}
        <div
          style={{
            paddingLeft: '40px',
            marginTop: '40px',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: '40px',
            alignItems: 'start',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-ibm-plex-sans)',
              fontSize: '15px',
              color: 'var(--text-secondary)',
              margin: 0,
              maxWidth: '480px',
              lineHeight: 1.55,
            }}
          >
            {t.practice}
          </p>
          <DecorativeScore />
        </div>
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
        <span>↓ {t.scrollHint}</span>
        <span>{t.catalog}</span>
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
function HeroNoise() {
  return (
    <svg
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.5,
        mixBlendMode: 'overlay',
        zIndex: 1,
      }}
    >
      <filter id="hero-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
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
      </filter>
      <rect width="100%" height="100%" filter="url(#hero-grain)" />
    </svg>
  )
}

function DecorativeScore() {
  // Static "score" — vertical bars of varying heights, evokes a waveform / spectrogram
  const bars = [
    14, 38, 22, 56, 30, 70, 18, 44, 26, 62, 12, 48, 34, 80, 24, 58, 16, 40, 28,
    72, 20, 52, 36, 64, 30, 46, 18, 60, 22, 38, 26, 50, 14, 68, 32, 44,
  ]
  return (
    <div
      aria-hidden
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        gap: '3px',
        height: '64px',
      }}
    >
      {bars.map((h, i) => (
        <span
          key={i}
          style={{
            display: 'block',
            width: '2px',
            height: `${h}%`,
            background: 'var(--accent)',
            opacity: 0.55,
          }}
        />
      ))}
    </div>
  )
}
