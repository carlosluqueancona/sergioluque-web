import { ConcertItem } from './ConcertItem'
import type { Evento, Locale } from '@/types'

interface ConcertListProps {
  eventos: Evento[]
  locale: Locale
}

export function ConcertList({ eventos, locale }: ConcertListProps) {
  return (
    <div>
      {eventos.map((evento) => (
        <ConcertItem key={evento.id} evento={evento} locale={locale} />
      ))}
    </div>
  )
}
