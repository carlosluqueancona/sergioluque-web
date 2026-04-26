'use client'

interface WaveformBarsProps {
  isPlaying: boolean
  audioUrl: string
}

function seededRandom(seed: string): () => number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  }
  return () => {
    hash = ((hash << 5) - hash + 1) | 0
    return (hash >>> 0) / 0xffffffff
  }
}

export function WaveformBars({ isPlaying, audioUrl }: WaveformBarsProps) {
  const random = seededRandom(audioUrl)
  const bars = Array.from({ length: 40 }, () => Math.floor(random() * 70 + 15))

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '2px',
        height: '48px',
        padding: '0',
      }}
      aria-hidden
    >
      {bars.map((height, i) => (
        <div
          key={i}
          style={{
            width: '3px',
            height: `${height}%`,
            background: 'var(--accent)',
            opacity: isPlaying ? 1 : 0.3,
            animation: isPlaying ? `pulse ${0.6 + (i % 5) * 0.15}s ease-in-out infinite alternate` : 'none',
            transition: 'opacity 150ms ease-out',
          }}
        />
      ))}

      <style>{`
        @keyframes pulse {
          from { transform: scaleY(0.6); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}
