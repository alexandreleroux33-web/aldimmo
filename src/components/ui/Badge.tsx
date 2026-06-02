import { ReservationStatut } from '@/lib/types'
import clsx from 'clsx'

const STATUT_CONFIG: Record<ReservationStatut, { label: string; className: string }> = {
  en_attente: {
    label: 'En attente',
    className: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  },
  confirme: {
    label: 'Confirmée',
    className: 'bg-green-500/10 text-green-400 border border-green-500/20',
  },
  check_in: {
    label: 'Check-in',
    className: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  },
  check_out: {
    label: 'Check-out',
    className: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
  },
  annule: {
    label: 'Annulée',
    className: 'bg-red-500/10 text-red-400 border border-red-500/20',
  },
}

interface BadgeProps {
  statut: ReservationStatut
  className?: string
}

export default function Badge({ statut, className }: BadgeProps) {
  const config = STATUT_CONFIG[statut]
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
