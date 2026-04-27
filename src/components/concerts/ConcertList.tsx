import { ConcertItem } from './ConcertItem'
import type { Evento } from '@/types'

interface ConcertListProps {
  eventos: Evento[]
}

export function ConcertList({ eventos }: ConcertListProps) {
  return (
    <div>
      {eventos.map((evento) => (
        <ConcertItem key={evento.id} evento={evento} />
      ))}
    </div>
  )
}
