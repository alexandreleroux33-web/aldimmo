'use client'

import { useEffect, useState } from 'react'
import { Reservation, Bien, Proprietaire } from '@/lib/types'
import { adminSelect } from '@/lib/actions/admin'
import { ChevronLeft, ChevronRight, X, User, Building2, Euro, Calendar } from 'lucide-react'
import Badge from '@/components/ui/Badge'

const MOIS_LABELS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

// Color palette per bien (cycles)
const BIEN_COLORS = [
  { bg: '#5B8C6B', light: 'rgba(91,140,107,0.15)' },
  { bg: '#0369a1', light: 'rgba(3,105,161,0.12)' },
  { bg: '#7c3aed', light: 'rgba(124,58,237,0.12)' },
  { bg: '#b45309', light: 'rgba(180,83,9,0.12)' },
  { bg: '#be185d', light: 'rgba(190,24,93,0.12)' },
  { bg: '#0f766e', light: 'rgba(15,118,110,0.12)' },
  { bg: '#1d4ed8', light: 'rgba(29,78,216,0.12)' },
  { bg: '#92400e', light: 'rgba(146,64,14,0.12)' },
]

function getBienColor(bienId: string, bienIds: string[]) {
  const idx = bienIds.indexOf(bienId)
  return BIEN_COLORS[idx % BIEN_COLORS.length]
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function getReservationsForDay(day: Date, reservations: Reservation[]) {
  return reservations.filter(r => {
    const start = new Date(r.date_debut)
    start.setHours(0, 0, 0, 0)
    const end = new Date(r.date_fin)
    end.setHours(0, 0, 0, 0)
    const d = new Date(day)
    d.setHours(0, 0, 0, 0)
    return d >= start && d < end
  })
}

function isFirstDayOfReservation(day: Date, r: Reservation) {
  const start = new Date(r.date_debut)
  return isSameDay(day, start)
}

export default function CalendrierPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [biens, setBiens] = useState<Bien[]>([])
  const [loading, setLoading] = useState(true)
  const [viewDate, setViewDate] = useState(new Date())
  const [selected, setSelected] = useState<Reservation | null>(null)

  useEffect(() => {
    const safe = <T,>(p: Promise<T[]>): Promise<T[]> => p.catch(() => [])
    const load = async () => {
      const [res, bi, props] = await Promise.all([
        safe(adminSelect<Reservation>('reservations', { order: 'date_debut', orderAsc: true })),
        safe(adminSelect<Bien>('biens', { order: 'created_at', orderAsc: true })),
        safe(adminSelect<Proprietaire>('proprietaires')),
      ])
      // Filter cancelled, then attach bien/proprietaire names for the modal
      const active = res.filter(r => r.statut !== 'annule').map(r => {
        const bien = bi.find(b => b.id === r.bien_id)
        const prop = props.find(p => p.id === r.proprietaire_id)
        return { ...r, _bien: bien, _prop: prop }
      })
      setReservations(active as any)
      setBiens(bi)
      setLoading(false)
    }
    load()
  }, [])

  const bienIds = biens.map(b => b.id)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  // Build grid: start on Monday of week containing 1st of month
  const firstOfMonth = new Date(year, month, 1)
  const startDow = firstOfMonth.getDay() // 0=Sun
  const startOffset = startDow === 0 ? 6 : startDow - 1 // offset to Monday
  const gridStart = new Date(firstOfMonth)
  gridStart.setDate(1 - startOffset)

  const days: Date[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    days.push(d)
  }

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const today = new Date()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#2D2926' }}>Calendrier</h1>
          <p className="mt-1" style={{ color: '#A89E98' }}>Vue mensuelle de toutes les réservations</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background: 'white', border: '1px solid rgba(45,41,38,0.1)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,140,107,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >
            <ChevronLeft className="w-4 h-4" style={{ color: '#5C524C' }} />
          </button>
          <span className="text-base font-semibold min-w-[160px] text-center" style={{ color: '#2D2926' }}>
            {MOIS_LABELS[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background: 'white', border: '1px solid rgba(45,41,38,0.1)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,140,107,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >
            <ChevronRight className="w-4 h-4" style={{ color: '#5C524C' }} />
          </button>
        </div>
      </div>

      {/* Legend */}
      {biens.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {biens.map((b, i) => {
            const c = BIEN_COLORS[i % BIEN_COLORS.length]
            return (
              <div key={b.id} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: c.bg }} />
                <span className="text-xs" style={{ color: '#7A6E68' }}>{b.nom}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Calendar grid */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
        {/* Day headers */}
        <div className="grid grid-cols-7" style={{ borderBottom: '1px solid rgba(45,41,38,0.06)' }}>
          {JOURS.map(j => (
            <div key={j} className="py-3 text-center text-xs font-semibold uppercase tracking-wide" style={{ color: '#A89E98' }}>
              {j}
            </div>
          ))}
        </div>

        {/* Days */}
        {loading ? (
          <div className="p-12 text-center" style={{ color: '#A89E98' }}>Chargement...</div>
        ) : (
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const isCurrentMonth = day.getMonth() === month
              const isToday = isSameDay(day, today)
              const dayReservations = getReservationsForDay(day, reservations)

              return (
                <div
                  key={idx}
                  className="min-h-[90px] p-1.5 relative"
                  style={{
                    borderRight: (idx + 1) % 7 !== 0 ? '1px solid rgba(45,41,38,0.04)' : 'none',
                    borderBottom: idx < 35 ? '1px solid rgba(45,41,38,0.04)' : 'none',
                    background: isToday ? 'rgba(91,140,107,0.04)' : 'transparent',
                  }}
                >
                  {/* Day number */}
                  <div className="flex justify-end mb-1">
                    <span
                      className="text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center"
                      style={isToday
                        ? { background: '#5B8C6B', color: 'white', fontWeight: 700 }
                        : { color: isCurrentMonth ? '#5C524C' : '#C8B89A' }
                      }
                    >
                      {day.getDate()}
                    </span>
                  </div>

                  {/* Reservations */}
                  <div className="space-y-0.5">
                    {dayReservations.slice(0, 3).map(r => {
                      const c = getBienColor(r.bien_id, bienIds)
                      const isStart = isFirstDayOfReservation(day, r)
                      return (
                        <button
                          key={r.id}
                          onClick={() => setSelected(r)}
                          className="w-full text-left px-1.5 py-0.5 rounded text-xs font-medium truncate transition-opacity hover:opacity-80"
                          style={{
                            background: isStart ? c.bg : c.light,
                            color: isStart ? 'white' : c.bg,
                          }}
                          title={`${r.locataire_nom} — ${(r as any)._bien?.nom ?? ''}`}
                        >
                          {isStart ? r.locataire_nom : '·'}
                        </button>
                      )
                    })}
                    {dayReservations.length > 3 && (
                      <div className="text-xs px-1" style={{ color: '#A89E98' }}>
                        +{dayReservations.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Reservation detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div
            className="relative z-10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'white', border: '1px solid rgba(45,41,38,0.1)' }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(45,41,38,0.08)' }}>
              <h2 className="font-semibold" style={{ color: '#2D2926' }}>Détail réservation</h2>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{ color: '#A89E98' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(45,41,38,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <Badge statut={selected.statut} />
                <span className="text-xs capitalize px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(45,41,38,0.06)', color: '#7A6E68' }}>
                  {selected.plateforme}
                </span>
              </div>

              <InfoRow icon={<User className="w-4 h-4" />} label="Locataire" value={selected.locataire_nom} />
              {selected.locataire_email && (
                <InfoRow icon={<User className="w-4 h-4" />} label="Email" value={selected.locataire_email} />
              )}
              <InfoRow
                icon={<Building2 className="w-4 h-4" />}
                label="Bien"
                value={(selected as any)._bien?.nom ?? '—'}
              />
              {(selected as any)._prop && (
                <InfoRow
                  icon={<User className="w-4 h-4" />}
                  label="Propriétaire"
                  value={`${(selected as any)._prop.prenom} ${(selected as any)._prop.nom}`}
                />
              )}
              <InfoRow
                icon={<Calendar className="w-4 h-4" />}
                label="Séjour"
                value={`${new Date(selected.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} → ${new Date(selected.date_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`}
              />
              <InfoRow
                icon={<Euro className="w-4 h-4" />}
                label="Montant total"
                value={Number(selected.montant_total).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex-shrink-0" style={{ color: '#A89E98' }}>{icon}</span>
      <div className="min-w-0">
        <div className="text-xs mb-0.5" style={{ color: '#A89E98' }}>{label}</div>
        <div className="text-sm font-medium" style={{ color: '#2D2926' }}>{value}</div>
      </div>
    </div>
  )
}
