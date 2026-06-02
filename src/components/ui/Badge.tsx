import { ReservationStatut } from '@/lib/types'
import clsx from 'clsx'

const STATUT_CONFIG: Record<ReservationStatut, { label: string; color: string; bg: string; border: string }> = {
  en_attente: { label: 'En attente',  color: '#92680a', bg: 'rgba(234,179,8,0.1)',   border: 'rgba(234,179,8,0.25)' },
  confirme:   { label: 'Confirmée',   color: '#3A5E46', bg: 'rgba(91,140,107,0.1)',  border: 'rgba(91,140,107,0.25)' },
  check_in:   { label: 'Check-in',    color: '#0369a1', bg: 'rgba(14,165,233,0.08)', border: 'rgba(14,165,233,0.2)' },
  check_out:  { label: 'Check-out',   color: '#5C524C', bg: 'rgba(45,41,38,0.07)',   border: 'rgba(45,41,38,0.15)' },
  annule:     { label: 'Annulée',     color: '#b91c1c', bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.2)' },
}

interface BadgeProps { statut: ReservationStatut; className?: string }

export default function Badge({ statut, className }: BadgeProps) {
  const c = STATUT_CONFIG[statut]
  return (
    <span
      className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', className)}
      style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}` }}
    >
      {c.label}
    </span>
  )
}
