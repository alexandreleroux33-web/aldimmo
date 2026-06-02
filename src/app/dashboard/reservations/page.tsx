'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Reservation } from '@/lib/types'
import Badge from '@/components/ui/Badge'

const TABS: { label: string; value: string }[] = [
  { label: 'Toutes', value: 'all' },
  { label: 'En attente', value: 'en_attente' },
  { label: 'Confirmées', value: 'confirme' },
  { label: 'Check-in', value: 'check_in' },
  { label: 'Check-out', value: 'check_out' },
  { label: 'Annulées', value: 'annule' },
]

const PLATEFORME_LABELS: Record<string, string> = {
  airbnb: 'Airbnb',
  booking: 'Booking',
  direct: 'Direct',
}

const PLATEFORME_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  airbnb: { color: '#c0392b', bg: 'rgba(220,38,38,0.06)', border: 'rgba(220,38,38,0.15)' },
  booking: { color: '#0369a1', bg: 'rgba(14,165,233,0.06)', border: 'rgba(14,165,233,0.15)' },
  direct:  { color: '#3A5E46', bg: 'rgba(91,140,107,0.08)', border: 'rgba(91,140,107,0.2)' },
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: prop } = await supabase
        .from('proprietaires')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!prop) { setLoading(false); return }

      const { data } = await supabase
        .from('reservations')
        .select('*, biens(nom)')
        .eq('proprietaire_id', prop.id)
        .order('date_debut', { ascending: false })

      setReservations(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = tab === 'all' ? reservations : reservations.filter(r => r.statut === tab)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#2D2926' }}>Réservations</h1>
        <p className="mt-1" style={{ color: '#A89E98' }}>Toutes vos réservations en un coup d'œil</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl flex-wrap" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={tab === t.value
              ? { background: '#5B8C6B', color: 'white' }
              : { color: '#7A6E68' }
            }
          >
            {t.label}
            <span className="ml-1.5 text-xs opacity-60">
              ({t.value === 'all' ? reservations.length : reservations.filter(r => r.statut === t.value).length})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
        {loading ? (
          <div className="p-12 text-center" style={{ color: '#A89E98' }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center" style={{ color: '#A89E98' }}>Aucune réservation trouvée</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Locataire</th>
                  <th>Bien</th>
                  <th>Arrivée</th>
                  <th>Départ</th>
                  <th>Nuits</th>
                  <th>Montant</th>
                  <th>Plateforme</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const debut = new Date(r.date_debut)
                  const fin = new Date(r.date_fin)
                  const nuits = Math.round((fin.getTime() - debut.getTime()) / 86400000)
                  const plt = PLATEFORME_STYLE[r.plateforme] || PLATEFORME_STYLE.direct
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="font-medium" style={{ color: '#2D2926' }}>{r.locataire_nom}</div>
                        {r.locataire_email && <div className="text-xs" style={{ color: '#A89E98' }}>{r.locataire_email}</div>}
                      </td>
                      <td>{(r as any).biens?.nom ?? '—'}</td>
                      <td>{debut.toLocaleDateString('fr-FR')}</td>
                      <td>{fin.toLocaleDateString('fr-FR')}</td>
                      <td>{nuits} nuit{nuits > 1 ? 's' : ''}</td>
                      <td className="font-medium" style={{ color: '#3A5E46' }}>
                        {Number(r.montant_total).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </td>
                      <td>
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ color: plt.color, background: plt.bg, border: `1px solid ${plt.border}` }}
                        >
                          {PLATEFORME_LABELS[r.plateforme]}
                        </span>
                      </td>
                      <td><Badge statut={r.statut} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
