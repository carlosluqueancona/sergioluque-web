import { WorkCard } from './WorkCard'
import type { Obra } from '@/types'

interface WorkGridProps {
  obras: Obra[]
  /** From settings.worksFallbackCoverUrl — used when an obra has none. */
  fallbackCoverUrl?: string
}

export function WorkGrid({ obras, fallbackCoverUrl }: WorkGridProps) {
  if (obras.length === 0) {
    return (
      <p
        style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: '13px',
          color: 'var(--text-muted)',
          padding: '48px 0',
        }}
      >
        —
      </p>
    )
  }

  return (
    <div>
      {obras.map((obra) => (
        <WorkCard key={obra.id} obra={obra} fallbackCoverUrl={fallbackCoverUrl} />
      ))}
    </div>
  )
}
