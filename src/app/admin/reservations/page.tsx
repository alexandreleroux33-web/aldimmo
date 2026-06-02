'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Reservation, ReservationStatut, Bien, Proprietaire, Plateforme } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Plus, Calendar } from 'lucide-react'

const STATUTS: ReservationStatut[] = ['en_attente', 'confirme', 'check_in', 'check_out', 'annule']
const STATUT_LABELS: Record<ReservationStatut, string> = {
  en_attente: 'En attente',
  confirme: 'Confirmée',
  check_in: 'Check-in',
  check_out: 'Check-out',
  annule: 'Annulée',
}

const PLATEFORMES: Plateforme[] = ['airbnb', 'booking', 'direct']

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [biens, setBiens] = useState<Bien[]>([])
  const [proprietaires, setProprietaires] = useState<Proprietaire[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    bien_id: '',
    proprietaire_id: '',
    locataire_nom: '',
    locataire_email: '',
    date_debut: '',
    date_fin: '',
    montant_total: '0',
    statut: 'en_attente' as ReservationStatut,
    plateforme: 'direct' as Plateforme,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    const supabase = createClient()
    const [{ data: res }, { data: bi }, { data: props }] = await Promise.all([
      supabase.from('reservations').select('*, biens(nom), proprietaires(nom, prenom)').order('date_debut', { ascending: false }),
      supabase.from('biens').select('*').order('nom'),
      supabase.from('proprietaires').select('*').order('nom'),
    ])
    setReservations(res || [])
    setBiens(bi || [])
    setProprietaires(props || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleStatutChange = async (id: string, newStatut: ReservationStatut) => {
    const supabase = createClient()
    await supabase.from('reservations').update({ statut: newStatut }).eq('id', id)
    setReservations(prev => prev.map(r => r.id === id ? { ...r, statut: newStatut } : r))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => {
      const updated = { ...prev, [name]: value }
      // Auto-fill proprietaire_id when bien_id changes
      if (name === 'bien_id') {
        const bien = biens.find(b => b.id === value)
        if (bien) updated.proprietaire_id = bien.proprietaire_id
      }
      return updated
    })
  }

  const handleSave = async () => {
    if (!form.bien_id || !form.locataire_nom || !form.date_debut || !form.date_fin) {
      setError('Bien, locataire et dates sont requis.')
      return
    }
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('reservations').insert({
      bien_id: form.bien_id,
      proprietaire_id: form.proprietaire_id,
      locataire_nom: form.locataire_nom,
      locataire_email: form.locataire_email || null,
      date_debut: form.date_debut,
      date_fin: form.date_fin,
      montant_total: parseFloat(form.montant_total),
      statut: form.statut,
      plateforme: form.plateforme,
    })
    setSaving(false)
    if (err) { setError(err.message); return }
    setModalOpen(false)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Réservations</h1>
          <p className="text-slate-400 mt-1">{reservations.length} réservation{reservations.length !== 1 ? 's' : ''} au total</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> Ajouter
        </Button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Chargement...</div>
        ) : reservations.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucune réservation</p>
          </div>
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
                  <th>Montant</th>
                  <th>Plateforme</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(r => (
                  <tr key={r.id}>
                    <td className="font-medium text-white">{r.locataire_nom}</td>
                    <td>{(r as any).biens?.nom ?? '—'}</td>
                    <td>{(r as any).proprietaires ? `${(r as any).proprietaires.prenom} ${(r as any).proprietaires.nom}` : '—'}</td>
                    <td>{new Date(r.date_debut).toLocaleDateString('fr-FR')}</td>
                    <td>{new Date(r.date_fin).toLocaleDateString('fr-FR')}</td>
                    <td className="text-sky-400 font-medium">
                      {Number(r.montant_total).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="capitalize">{r.plateforme}</td>
                    <td>
                      <select
                        value={r.statut}
                        onChange={e => handleStatutChange(r.id, e.target.value as ReservationStatut)}
                        className="bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                      >
                        {STATUTS.map(s => (
                          <option key={s} value={s}>{STATUT_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter une réservation">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Bien *</label>
            <select name="bien_id" value={form.bien_id} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="">Sélectionner...</option>
              {biens.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Locataire *</label>
              <input name="locataire_nom" value={form.locataire_nom} onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Jean Dupont" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email locataire</label>
              <input type="email" name="locataire_email" value={form.locataire_email} onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="jean@email.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Arrivée *</label>
              <input type="date" name="date_debut" value={form.date_debut} onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Départ *</label>
              <input type="date" name="date_fin" value={form.date_fin} onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Montant (€)</label>
              <input type="number" name="montant_total" value={form.montant_total} onChange={handleChange} min={0} step={0.01}
                className="w-full px-3 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Plateforme</label>
              <select name="plateforme" value={form.plateforme} onChange={handleChange}
                className="w-full px-3 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500">
                {PLATEFORMES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Statut</label>
              <select name="statut" value={form.statut} onChange={handleChange}
                className="w-full px-3 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500">
                {STATUTS.map(s => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">
              Annuler
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
