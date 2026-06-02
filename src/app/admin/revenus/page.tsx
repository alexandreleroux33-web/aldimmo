'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Reservation, Proprietaire, Bien } from '@/lib/types'
import { Download } from 'lucide-react'

const MOIS_LABELS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const COMMISSION_RATE = 0.2

interface Row {
  bien: string
  proprietaire: string
  brut: number
  commission: number
  net: number
  reservations: Reservation[]
}

export default function AdminRevenusPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [biens, setBiens] = useState<Bien[]>([])
  const [proprietaires, setProprietaires] = useState<Proprietaire[]>([])
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const [selectedProprietaire, setSelectedProprietaire] = useState('all')
  const [selectedBien, setSelectedBien] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState(0) // 0 = all
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const [{ data: res }, { data: bi }, { data: props }] = await Promise.all([
        supabase.from('reservations').select('*, biens(nom), proprietaires(nom, prenom)').neq('statut', 'annule'),
        supabase.from('biens').select('*, proprietaires(nom, prenom)').order('nom'),
        supabase.from('proprietaires').select('*').order('nom'),
      ])
      setReservations(res || [])
      setBiens(bi || [])
      setProprietaires(props || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = reservations.filter(r => {
    const d = new Date(r.date_debut)
    if (selectedProprietaire !== 'all' && r.proprietaire_id !== selectedProprietaire) return false
    if (selectedBien !== 'all' && r.bien_id !== selectedBien) return false
    if (selectedMonth > 0 && d.getMonth() + 1 !== selectedMonth) return false
    if (d.getFullYear() !== selectedYear) return false
    return true
  })

  // Group by bien
  const rows: Row[] = biens
    .filter(b => selectedBien === 'all' || b.id === selectedBien)
    .filter(b => selectedProprietaire === 'all' || b.proprietaire_id === selectedProprietaire)
    .map(b => {
      const bRes = filtered.filter(r => r.bien_id === b.id)
      const brut = bRes.reduce((s, r) => s + Number(r.montant_total), 0)
      return {
        bien: b.nom,
        proprietaire: (b as any).proprietaires ? `${(b as any).proprietaires.prenom} ${(b as any).proprietaires.nom}` : '—',
        brut,
        commission: brut * COMMISSION_RATE,
        net: brut * (1 - COMMISSION_RATE),
        reservations: bRes,
      }
    })
    .filter(r => r.brut > 0)

  const totalBrut = rows.reduce((s, r) => s + r.brut, 0)
  const totalCommission = rows.reduce((s, r) => s + r.commission, 0)
  const totalNet = rows.reduce((s, r) => s + r.net, 0)

  const exportCSV = () => {
    const headers = ['Bien', 'Propriétaire', 'Revenus bruts', 'Commission (20%)', 'Net versé']
    const csvRows = [
      headers.join(';'),
      ...rows.map(r => [
        r.bien,
        r.proprietaire,
        r.brut.toFixed(2),
        r.commission.toFixed(2),
        r.net.toFixed(2),
      ].join(';')),
      '',
      ['TOTAL', '', totalBrut.toFixed(2), totalCommission.toFixed(2), totalNet.toFixed(2)].join(';'),
    ]
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `revenus-ald-immo-${selectedYear}${selectedMonth > 0 ? `-${String(selectedMonth).padStart(2, '0')}` : ''}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Revenus</h1>
          <p className="text-slate-400 mt-1">Analyse des revenus par propriété</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={selectedProprietaire} onChange={e => setSelectedProprietaire(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm">
          <option value="all">Tous les propriétaires</option>
          {proprietaires.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
        </select>

        <select value={selectedBien} onChange={e => setSelectedBien(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm">
          <option value="all">Tous les biens</option>
          {biens.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
        </select>

        <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
          className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm">
          <option value={0}>Tous les mois</option>
          {MOIS_LABELS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>

        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
          className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm">
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="text-slate-400 text-sm mb-1">Revenus bruts</div>
          <div className="text-2xl font-bold text-white">
            {totalBrut.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
        </div>
        <div className="stat-card">
          <div className="text-slate-400 text-sm mb-1">Commission ALD (20%)</div>
          <div className="text-2xl font-bold text-emerald-400">
            {totalCommission.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
        </div>
        <div className="stat-card">
          <div className="text-slate-400 text-sm mb-1">Net versé propriétaires</div>
          <div className="text-2xl font-bold text-sky-400">
            {totalNet.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Chargement...</div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Aucune donnée pour cette période</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bien</th>
                  <th>Propriétaire</th>
                  <th>Nb réservations</th>
                  <th>Revenus bruts</th>
                  <th>Commission (20%)</th>
                  <th>Net versé</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td className="font-medium text-white">{r.bien}</td>
                    <td>{r.proprietaire}</td>
                    <td>{r.reservations.length}</td>
                    <td>{r.brut.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                    <td className="text-emerald-400">
                      {r.commission.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="text-sky-400 font-medium">
                      {r.net.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="border-t-2 border-slate-600 bg-slate-700/30">
                  <td className="font-bold text-white" colSpan={3}>Total</td>
                  <td className="font-bold text-white">
                    {totalBrut.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td className="font-bold text-emerald-400">
                    {totalCommission.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td className="font-bold text-sky-400">
                    {totalNet.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
