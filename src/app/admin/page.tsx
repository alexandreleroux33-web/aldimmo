'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Reservation, Bien } from '@/lib/types'
import { Building2, Calendar, Euro, TrendingUp, LogIn, LogOut, Clock } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { formatMontant } from '@/lib/utils'

const MOIS_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

const toDateStr = (d: Date) => d.toISOString().slice(0, 10)

export default function AdminPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [biens, setBiens] = useState<Bien[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const [{ data: res }, { data: bi }] = await Promise.all([
        supabase.from('reservations').select('*, biens(nom), proprietaires(nom, prenom)').order('date_debut', { ascending: false }),
        supabase.from('biens').select('*, proprietaires(nom, prenom)'),
      ])
      setReservations(res || [])
      setBiens(bi || [])
      setLoading(false)
    }
    load()
  }, [])

  const now = new Date()
  const today = toDateStr(now)
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const resMois = reservations.filter(r => {
    const d = new Date(r.date_debut)
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear && r.statut !== 'annule'
  })

  const revenusMois = resMois.reduce((s, r) => s + Number(r.montant_total), 0)
  const commissions = revenusMois * 0.2

  // Alerts
  const checkInsToday = reservations.filter(r => r.date_debut.slice(0, 10) === today && r.statut !== 'annule' && r.statut !== 'check_out')
  const checkOutsToday = reservations.filter(r => r.date_fin.slice(0, 10) === today && r.statut !== 'annule')
  const enAttente = reservations.filter(r => r.statut === 'en_attente')

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
    return { mois: MOIS_SHORT[m - 1], revenus }
  })

  const recent = reservations.slice(0, 8)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div style={{ color: '#A89E98' }}>Chargement...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#2D2926' }}>Dashboard Admin</h1>
        <p className="mt-1" style={{ color: '#A89E98' }}>Vue globale de l'activité ALD Immo — {MOIS_SHORT[currentMonth - 1]} {currentYear}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Propriétés actives" value={String(biens.filter(b => b.statut === 'actif').length)} />
        <StatCard icon={Calendar} label="Réservations ce mois" value={String(resMois.length)} />
        <StatCard
          icon={Euro}
          label="Revenus du mois"
          value={revenusMois.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          trend={revenusMois > 0 ? '+' : undefined}
        />
        <StatCard
          icon={TrendingUp}
          label="Commissions ALD (20%)"
          value={commissions.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          trend={commissions > 0 ? '+' : undefined}
        />
      </div>

      {/* Alerts */}
      {(checkInsToday.length > 0 || checkOutsToday.length > 0 || enAttente.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Check-ins today */}
          <AlertCard
            icon={<LogIn className="w-4 h-4" />}
            label="Check-in aujourd'hui"
            count={checkInsToday.length}
            color="#3A5E46"
            bg="rgba(91,140,107,0.08)"
            border="rgba(91,140,107,0.2)"
            items={checkInsToday}
          />
          {/* Check-outs today */}
          <AlertCard
            icon={<LogOut className="w-4 h-4" />}
            label="Check-out aujourd'hui"
            count={checkOutsToday.length}
            color="#0369a1"
            bg="rgba(14,165,233,0.06)"
            border="rgba(14,165,233,0.15)"
            items={checkOutsToday}
          />
          {/* En attente */}
          <AlertCard
            icon={<Clock className="w-4 h-4" />}
            label="En attente de confirmation"
            count={enAttente.length}
            color="#92680a"
            bg="rgba(234,179,8,0.06)"
            border="rgba(234,179,8,0.2)"
            items={enAttente}
          />
        </div>
      )}

      {/* Chart */}
      <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
        <h2 className="font-semibold mb-6" style={{ color: '#2D2926' }}>Revenus des 6 derniers mois</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,41,38,0.06)" />
            <XAxis dataKey="mois" stroke="#C8B89A" tick={{ fill: '#A89E98', fontSize: 12 }} />
            <YAxis stroke="#C8B89A" tick={{ fill: '#A89E98', fontSize: 12 }} tickFormatter={v => `${v}€`} />
            <Tooltip
              contentStyle={{ background: 'white', border: '1px solid rgba(45,41,38,0.1)', borderRadius: 8, boxShadow: '0 4px 12px rgba(45,41,38,0.08)' }}
              labelStyle={{ color: '#2D2926', fontWeight: 600 }}
              formatter={(value: number) => [value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }), 'Revenus']}
            />
            <Bar dataKey="revenus" fill="#5B8C6B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent reservations */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(45,41,38,0.08)' }}>
          <h2 className="font-semibold" style={{ color: '#2D2926' }}>Réservations récentes</h2>
          <Link href="/admin/reservations" className="text-sm font-medium" style={{ color: '#5B8C6B' }}>
            Voir tout →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Locataire</th>
                <th>Bien</th>
                <th>Propriétaire</th>
                <th>Arrivée</th>
                <th>Départ</th>
                <th>Montant</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id}>
                  <td className="font-medium" style={{ color: '#2D2926' }}>{r.locataire_nom}</td>
                  <td>{(r as any).biens?.nom ?? '—'}</td>
                  <td>
                    {(r as any).proprietaires
                      ? `${(r as any).proprietaires.prenom} ${(r as any).proprietaires.nom}`
                      : '—'}
                  </td>
                  <td>{new Date(r.date_debut).toLocaleDateString('fr-FR')}</td>
                  <td>{new Date(r.date_fin).toLocaleDateString('fr-FR')}</td>
                  <td className="font-medium" style={{ color: '#3A5E46' }}>
                    {formatMontant(Number(r.montant_total), r.plateforme)}
                  </td>
                  <td><Badge statut={r.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AlertCard({
  icon, label, count, color, bg, border, items
}: {
  icon: React.ReactNode
  label: string
  count: number
  color: string
  bg: string
  border: string
  items: Reservation[]
}) {
  if (count === 0) return (
    <div className="rounded-2xl p-4" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: '#A89E98' }}>{icon}</span>
        <span className="text-sm font-medium" style={{ color: '#A89E98' }}>{label}</span>
      </div>
      <div className="text-sm" style={{ color: '#C8B89A' }}>Aucun</div>
    </div>
  )

  return (
    <div className="rounded-2xl p-4" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color }}>{icon}</span>
        <span className="text-sm font-semibold" style={{ color }}>{label}</span>
        <span
          className="ml-auto text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: color, color: 'white' }}
        >
          {count}
        </span>
      </div>
      <div className="space-y-1.5">
        {items.slice(0, 3).map(r => (
          <div key={r.id} className="text-xs font-medium" style={{ color }}>
            {r.locataire_nom} — {(r as any).biens?.nom ?? ''}
          </div>
        ))}
        {items.length > 3 && (
          <div className="text-xs" style={{ color, opacity: 0.7 }}>+{items.length - 3} autres</div>
        )}
      </div>
    </div>
  )
}
