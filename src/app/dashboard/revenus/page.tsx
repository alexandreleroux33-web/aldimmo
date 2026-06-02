'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Reservation } from '@/lib/types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const MOIS_LABELS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const MOIS_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

const COMMISSION_RATE = 0.2

export default function RevenusPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

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
        .neq('statut', 'annule')
        .order('date_debut', { ascending: false })

      setReservations(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filteredMonth = reservations.filter(r => {
    const d = new Date(r.date_debut)
    return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear
  })

  const revenusBruts = filteredMonth.reduce((s, r) => s + Number(r.montant_total), 0)
  const commission = revenusBruts * COMMISSION_RATE
  const netVerse = revenusBruts - commission

  // Chart: 12 last months
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    const m = d.getMonth() + 1
    const y = d.getFullYear()
    const revenus = reservations
      .filter(r => {
        const rd = new Date(r.date_debut)
        return rd.getMonth() + 1 === m && rd.getFullYear() === y
      })
      .reduce((sum, r) => sum + Number(r.montant_total), 0)
    return { mois: MOIS_SHORT[m - 1], revenus, net: revenus * (1 - COMMISSION_RATE) }
  })

  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Revenus</h1>
        <p className="text-stone-400 mt-1">Suivi de vos revenus locatifs</p>
      </div>

      {/* Month selector */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(Number(e.target.value))}
          className="bg-stone-800 border border-stone-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        >
          {MOIS_LABELS.map((m, i) => (
            <option key={i + 1} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
          className="bg-stone-800 border border-stone-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="text-stone-400 text-sm mb-1">Revenus bruts</div>
          <div className="text-2xl font-bold text-white">
            {revenusBruts.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
        </div>
        <div className="stat-card">
          <div className="text-stone-400 text-sm mb-1">Commission ALD (20%)</div>
          <div className="text-2xl font-bold text-red-400">
            -{commission.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
        </div>
        <div className="stat-card">
          <div className="text-stone-400 text-sm mb-1">Net versé</div>
          <div className="text-2xl font-bold text-emerald-400">
            {netVerse.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
        </div>
      </div>

      {/* Monthly table */}
      <div className="bg-stone-800 rounded-xl border border-stone-700">
        <div className="px-6 py-4 border-b border-stone-700">
          <h2 className="text-white font-semibold">
            Détail — {MOIS_LABELS[selectedMonth - 1]} {selectedYear}
          </h2>
        </div>
        {loading ? (
          <div className="p-12 text-center text-stone-500">Chargement...</div>
        ) : filteredMonth.length === 0 ? (
          <div className="p-12 text-center text-stone-500">Aucune réservation ce mois</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Locataire</th>
                  <th>Bien</th>
                  <th>Arrivée</th>
                  <th>Départ</th>
                  <th>Brut</th>
                  <th>Commission (20%)</th>
                  <th>Net</th>
                </tr>
              </thead>
              <tbody>
                {filteredMonth.map(r => {
                  const brut = Number(r.montant_total)
                  const comm = brut * COMMISSION_RATE
                  const net = brut - comm
                  return (
                    <tr key={r.id}>
                      <td className="font-medium text-white">{r.locataire_nom}</td>
                      <td>{(r as any).biens?.nom ?? '—'}</td>
                      <td>{new Date(r.date_debut).toLocaleDateString('fr-FR')}</td>
                      <td>{new Date(r.date_fin).toLocaleDateString('fr-FR')}</td>
                      <td>{brut.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                      <td className="text-red-400">-{comm.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                      <td className="text-emerald-400 font-medium">{net.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="bg-stone-800 rounded-xl border border-stone-700 p-6">
        <h2 className="text-white font-semibold mb-6">Revenus des 12 derniers mois</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="mois" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `${v}€`} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value: number, name: string) => [
                value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }),
                name === 'revenus' ? 'Bruts' : 'Net'
              ]}
            />
            <Bar dataKey="revenus" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="revenus" />
            <Bar dataKey="net" fill="#10b981" radius={[4, 4, 0, 0]} name="net" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
