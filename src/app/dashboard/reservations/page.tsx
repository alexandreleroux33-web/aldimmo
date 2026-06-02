'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Reservation, ReservationStatut } from '@/lib/types'
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
        <h1 className="text-2xl font-bold text-white">Réservations</h1>
        <p className="text-slate-400 mt-1">Toutes vos réservations en un coup d'œil</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.value
                ? 'bg-sky-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-xs opacity-70">
              ({t.value === 'all' ? reservations.length : reservations.filter(r => r.statut === t.value).length})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Aucune réservation trouvée</div>
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
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="font-medium text-white">{r.locataire_nom}</div>
                        {r.locataire_email && <div className="text-slate-500 text-xs">{r.locataire_email}</div>}
                      </td>
                      <td>{(r as any).biens?.nom ?? '—'}</td>
                      <td>{debut.toLocaleDateString('fr-FR')}</td>
                      <td>{fin.toLocaleDateString('fr-FR')}</td>
                      <td>{nuits} nuit{nuits > 1 ? 's' : ''}</td>
                      <td className="font-medium text-sky-400">
                        {Number(r.montant_total).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </td>
                      <td>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          r.plateforme === 'airbnb' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          r.plateforme === 'booking' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
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
