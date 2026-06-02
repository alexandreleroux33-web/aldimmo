'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Reservation, Bien } from '@/lib/types'
import { Building2, Calendar, Euro, TrendingUp } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const MOIS_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

export default function AdminPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [biens, setBiens] = useState<Bien[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()

      const [{ data: res }, { data: bi }] = await Promise.all([
        supabase.from('reservations').select('*, biens(nom, proprietaire_id), proprietaires(nom, prenom)'),
        supabase.from('biens').select('*, proprietaires(nom, prenom)'),
      ])

      setReservations(res || [])
      setBiens(bi || [])
      setLoading(false)
    }
    load()
  }, [])

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const totalBiens = biens.length
  const resMois = reservations.filter(r => {
    const d = new Date(r.date_debut)
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear && r.statut !== 'annule'
  }).length

  const revenusTotaux = reservations
    .filter(r => r.statut !== 'annule')
    .reduce((s, r) => s + Number(r.montant_total), 0)

  const commissions = revenusTotaux * 0.2

  // Chart: 12 last months
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    const m = d.getMonth() + 1
    const y = d.getFullYear()
    const revenus = reservations
      .filter(r => {
        const rd = new Date(r.date_debut)
        return rd.getMonth() + 1 === m && rd.getFullYear() === y && r.statut !== 'annule'
      })
      .reduce((sum, r) => sum + Number(r.montant_total), 0)
    return { mois: MOIS_SHORT[m - 1], revenus }
  })

  // Top 5 biens
  const bienStats = biens.map(b => {
    const bRes = reservations.filter(r => r.bien_id === b.id && r.statut !== 'annule')
    const revenus = bRes.reduce((s, r) => s + Number(r.montant_total), 0)
    return { ...b, nbRes: bRes.length, revenus }
  }).sort((a, b) => b.revenus - a.revenus).slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
        <p className="text-stone-400 mt-1">Vue globale de l'activité ALD Immo</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Total propriétés" value={String(totalBiens)} />
        <StatCard icon={Calendar} label="Réservations ce mois" value={String(resMois)} />
        <StatCard
          icon={Euro}
          label="Revenus totaux"
          value={revenusTotaux.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          trend="+"
        />
        <StatCard
          icon={TrendingUp}
          label="Commissions ALD"
          value={commissions.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          trend="+"
        />
      </div>

      {/* Chart */}
      <div className="bg-stone-800 rounded-xl border border-stone-700 p-6">
        <h2 className="text-white font-semibold mb-6">Revenus par mois (toutes propriétés)</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="mois" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={v => `${v}€`} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value: number) => [value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }), 'Revenus']}
            />
            <Bar dataKey="revenus" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top biens */}
      <div className="bg-stone-800 rounded-xl border border-stone-700">
        <div className="px-6 py-4 border-b border-stone-700">
          <h2 className="text-white font-semibold">Top 5 propriétés par revenus</h2>
        </div>
        {loading ? (
          <div className="p-12 text-center text-stone-500">Chargement...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Bien</th>
                  <th>Propriétaire</th>
                  <th>Type</th>
                  <th>Réservations</th>
                  <th>Revenus bruts</th>
                  <th>Commission (20%)</th>
                </tr>
              </thead>
              <tbody>
                {bienStats.map((b, i) => (
                  <tr key={b.id}>
                    <td className="text-stone-500 font-bold">{i + 1}</td>
                    <td className="font-medium text-white">{b.nom}</td>
                    <td>{(b as any).proprietaires ? `${(b as any).proprietaires.prenom} ${(b as any).proprietaires.nom}` : '—'}</td>
                    <td className="capitalize">{b.type}</td>
                    <td>{b.nbRes}</td>
                    <td className="text-emerald-400 font-medium">
                      {b.revenus.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="text-emerald-400">
                      {(b.revenus * 0.2).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
