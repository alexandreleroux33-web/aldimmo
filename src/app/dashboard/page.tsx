'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Reservation, Proprietaire } from '@/lib/types'
import StatCard from '@/components/ui/StatCard'
import Badge from '@/components/ui/Badge'
import { Euro, Calendar, TrendingUp, Clock } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

export default function DashboardPage() {
  const [proprietaire, setProprietaire] = useState<Proprietaire | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: prop } = await supabase
        .from('proprietaires')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!prop) { setLoading(false); return }
      setProprietaire(prop)

      const { data: res } = await supabase
        .from('reservations')
        .select('*, biens(nom)')
        .eq('proprietaire_id', prop.id)
        .order('date_debut', { ascending: false })

      setReservations(res || [])
      setLoading(false)
    }
    load()
  }, [])

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const revenusMonth = reservations
    .filter(r => {
      const d = new Date(r.date_debut)
      return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear && r.statut !== 'annule'
    })
    .reduce((sum, r) => sum + Number(r.montant_total), 0)

  const enCours = reservations.filter(r => ['confirme', 'check_in', 'en_attente'].includes(r.statut)).length

  const allDates = reservations
    .filter(r => r.statut !== 'annule')
    .flatMap(r => {
      const dates = []
      let cur = new Date(r.date_debut)
      const end = new Date(r.date_fin)
      while (cur < end) { dates.push(cur.toISOString().slice(0, 10)); cur = new Date(cur.getTime() + 86400000) }
      return dates
    })
  const datesThisMonth = allDates.filter(d => {
    const dt = new Date(d)
    return dt.getMonth() + 1 === currentMonth && dt.getFullYear() === currentYear
  })
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
  const tauxOccupation = daysInMonth > 0 ? Math.round((datesThisMonth.length / daysInMonth) * 100) : 0

  const prochaine = reservations
    .filter(r => new Date(r.date_debut) > now && r.statut !== 'annule')
    .sort((a, b) => new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime())[0]

  // Chart: 6 last months
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const m = d.getMonth() + 1
    const y = d.getFullYear()
    const revenus = reservations
      .filter(r => {
        const rd = new Date(r.date_debut)
        return rd.getMonth() + 1 === m && rd.getFullYear() === y && r.statut !== 'annule'
      })
      .reduce((sum, r) => sum + Number(r.montant_total), 0)
    return { mois: MOIS[m - 1], revenus }
  })

  const recent = reservations.slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-stone-400">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Bonjour {proprietaire ? `${proprietaire.prenom} ${proprietaire.nom}` : ''}
        </h1>
        <p className="text-stone-400 mt-1">
          Voici un aperçu de votre activité pour {MOIS[currentMonth - 1]} {currentYear}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Euro}
          label="Revenus du mois"
          value={revenusMonth.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          trend={revenusMonth > 0 ? '+' : undefined}
        />
        <StatCard
          icon={Calendar}
          label="Réservations en cours"
          value={String(enCours)}
        />
        <StatCard
          icon={TrendingUp}
          label="Taux d'occupation"
          value={`${tauxOccupation}%`}
          trend={tauxOccupation > 50 ? '+' : undefined}
        />
        <StatCard
          icon={Clock}
          label="Prochaine arrivée"
          value={prochaine ? new Date(prochaine.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—'}
        />
      </div>

      {/* Chart */}
      <div className="bg-stone-800 rounded-xl border border-stone-700 p-6">
        <h2 className="text-white font-semibold mb-6">Revenus des 6 derniers mois</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="mois" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `${v}€`} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value: number) => [value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }), 'Revenus']}
            />
            <Bar dataKey="revenus" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent reservations */}
      <div className="bg-stone-800 rounded-xl border border-stone-700">
        <div className="px-6 py-4 border-b border-stone-700">
          <h2 className="text-white font-semibold">Réservations récentes</h2>
        </div>
        <div className="overflow-x-auto">
          {recent.length === 0 ? (
            <div className="px-6 py-12 text-center text-stone-500">Aucune réservation</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Locataire</th>
                  <th>Bien</th>
                  <th>Arrivée</th>
                  <th>Départ</th>
                  <th>Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td className="font-medium text-white">{r.locataire_nom}</td>
                    <td>{(r as any).biens?.nom ?? '—'}</td>
                    <td>{new Date(r.date_debut).toLocaleDateString('fr-FR')}</td>
                    <td>{new Date(r.date_fin).toLocaleDateString('fr-FR')}</td>
                    <td>{Number(r.montant_total).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                    <td><Badge statut={r.statut} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
