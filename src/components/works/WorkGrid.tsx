import { WorkCard } from './WorkCard'
import type { Obra, Locale } from '@/types'

interface WorkGridProps {
  obras: Obra[]
  locale: Locale
}

export function WorkGrid({ obras, locale }: WorkGridProps) {
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
        <WorkCard key={obra.id} obra={obra} locale={locale} />
      ))}
    </div>
  )
}
