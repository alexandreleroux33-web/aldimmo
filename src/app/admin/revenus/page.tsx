'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Reservation, Proprietaire, Bien } from '@/lib/types'
import { Euro, TrendingUp, Download } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const MOIS_LABELS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const MOIS_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
const COMMISSION_RATE = 0.2

export default function AdminRevenusPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [proprietaires, setProprietaires] = useState<Proprietaire[]>([])
  const [biens, setBiens] = useState<Bien[]>([])
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [filterProp, setFilterProp] = useState('all')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const [{ data: res }, { data: props }, { data: bi }] = await Promise.all([
        supabase.from('reservations').select('*, biens(nom), proprietaires(nom, prenom)').neq('statut', 'annule').order('date_debut', { ascending: false }),
        supabase.from('proprietaires').select('id, nom, prenom, email, created_at').order('nom'),
        supabase.from('biens').select('id, nom, proprietaire_id, adresse, type, chambres, capacite, prix_nuit, statut, created_at').order('nom'),
      ])
      setReservations(res || [])
      setProprietaires(props || [])
      setBiens(bi || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = reservations.filter(r => {
    const d = new Date(r.date_debut)
    const matchMonth = d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear
    const matchProp = filterProp === 'all' || r.proprietaire_id === filterProp
    return matchMonth && matchProp
  })

  const revenusBruts = filtered.reduce((s, r) => s + Number(r.montant_total), 0)
  const commission = revenusBruts * COMMISSION_RATE
  const netProps = revenusBruts - commission

  const chartData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    const m = d.getMonth() + 1
    const y = d.getFullYear()
    const allRes = filterProp === 'all'
      ? reservations
      : reservations.filter(r => r.proprietaire_id === filterProp)
    const revenus = allRes
      .filter(r => { const rd = new Date(r.date_debut); return rd.getMonth() + 1 === m && rd.getFullYear() === y })
      .reduce((sum, r) => sum + Number(r.montant_total), 0)
    return { mois: MOIS_SHORT[m - 1], revenus, commission: revenus * COMMISSION_RATE }
  })

  const selectStyle = {
    background: 'white', border: '1px solid rgba(45,41,38,0.1)', color: '#2D2926',
    borderRadius: '0.75rem', padding: '0.5rem 0.875rem', fontSize: '0.875rem', outline: 'none',
  } as React.CSSProperties

  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#2D2926' }}>Revenus</h1>
        <p className="mt-1" style={{ color: '#A89E98' }}>Vue globale de tous les revenus ALD Immo</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} style={selectStyle}>
          {MOIS_LABELS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>
        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={selectStyle}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filterProp} onChange={e => setFilterProp(e.target.value)} style={selectStyle}>
          <option value="all">Tous les propriétaires</option>
          {proprietaires.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
          <div className="text-sm mb-1" style={{ color: '#A89E98' }}>Revenus bruts</div>
          <div className="text-2xl font-bold" style={{ color: '#2D2926' }}>
            {revenusBruts.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
          <div className="text-xs mt-1" style={{ color: '#A89E98' }}>{filtered.length} réservation{filtered.length > 1 ? 's' : ''}</div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: 'rgba(91,140,107,0.08)', border: '1px solid rgba(91,140,107,0.2)' }}>
          <div className="text-sm mb-1 flex items-center gap-1.5" style={{ color: '#3A5E46' }}>
            <TrendingUp className="w-3.5 h-3.5" />
            Commission ALD (20%)
          </div>
          <div className="text-2xl font-bold" style={{ color: '#2D2926' }}>
            {commission.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
          <div className="text-xs mt-1" style={{ color: '#5B8C6B' }}>Marge ALD</div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
          <div className="text-sm mb-1" style={{ color: '#A89E98' }}>Net propriétaires</div>
          <div className="text-2xl font-bold" style={{ color: '#3A5E46' }}>
            {netProps.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
          <div className="text-xs mt-1" style={{ color: '#A89E98' }}>Après déduction</div>
        </div>
      </div>

      {/* Detail table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(45,41,38,0.08)' }}>
          <h2 className="font-semibold" style={{ color: '#2D2926' }}>
            Détail — {MOIS_LABELS[selectedMonth - 1]} {selectedYear}
          </h2>
        </div>
        {loading ? (
          <div className="p-12 text-center" style={{ color: '#A89E98' }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center" style={{ color: '#A89E98' }}>Aucune réservation ce mois</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Locataire</th>
                  <th>Bien</th>
                  <th>Propriétaire</th>
                  <th>Arrivée</th>
                  <th>Départ</th>
                  <th>Brut</th>
                  <th>Commission</th>
                  <th>Net propriétaire</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const brut = Number(r.montant_total)
                  const comm = brut * COMMISSION_RATE
                  const net = brut - comm
                  return (
                    <tr key={r.id}>
                      <td className="font-medium" style={{ color: '#2D2926' }}>{r.locataire_nom}</td>
                      <td>{(r as any).biens?.nom ?? '—'}</td>
                      <td>{(r as any).proprietaires ? `${(r as any).proprietaires.prenom} ${(r as any).proprietaires.nom}` : '—'}</td>
                      <td>{new Date(r.date_debut).toLocaleDateString('fr-FR')}</td>
                      <td>{new Date(r.date_fin).toLocaleDateString('fr-FR')}</td>
                      <td>{brut.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                      <td style={{ color: '#5B8C6B' }}>{comm.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                      <td className="font-medium" style={{ color: '#3A5E46' }}>{net.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
        <h2 className="font-semibold mb-6" style={{ color: '#2D2926' }}>Revenus des 12 derniers mois</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,41,38,0.06)" />
            <XAxis dataKey="mois" stroke="#C8B89A" tick={{ fill: '#A89E98', fontSize: 11 }} />
            <YAxis stroke="#C8B89A" tick={{ fill: '#A89E98', fontSize: 11 }} tickFormatter={v => `${v}€`} />
            <Tooltip
              contentStyle={{ background: 'white', border: '1px solid rgba(45,41,38,0.1)', borderRadius: 8, boxShadow: '0 4px 12px rgba(45,41,38,0.08)' }}
              labelStyle={{ color: '#2D2926', fontWeight: 600 }}
              formatter={(value: number, name: string) => [
                value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }),
                name === 'revenus' ? 'Bruts' : 'Commission ALD'
              ]}
            />
            <Bar dataKey="revenus" fill="#5B8C6B" radius={[4, 4, 0, 0]} name="revenus" />
            <Bar dataKey="commission" fill="rgba(91,140,107,0.3)" radius={[4, 4, 0, 0]} name="commission" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
