'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Proprietaire } from '@/lib/types'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Plus, Users } from 'lucide-react'

export default function AdminProprietairesPage() {
  const [proprietaires, setProprietaires] = useState<(Proprietaire & { nb_biens?: number; revenus?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', adresse: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    const supabase = createClient()
    const { data: props } = await supabase
      .from('proprietaires')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: biens } = await supabase.from('biens').select('id, proprietaire_id')
    const { data: res } = await supabase.from('reservations').select('proprietaire_id, montant_total').neq('statut', 'annule')

    const enriched = (props || []).map(p => {
      const nb_biens = (biens || []).filter(b => b.proprietaire_id === p.id).length
      const revenus = (res || []).filter(r => r.proprietaire_id === p.id).reduce((s, r) => s + Number(r.montant_total), 0)
      return { ...p, nb_biens, revenus }
    })

    setProprietaires(enriched)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async () => {
    if (!form.nom || !form.prenom || !form.email) {
      setError('Nom, prénom et email sont requis.')
      return
    }
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('proprietaires').insert({
      nom: form.nom,
      prenom: form.prenom,
      email: form.email,
      telephone: form.telephone || null,
      adresse: form.adresse || null,
    })
    setSaving(false)
    if (err) { setError(err.message); return }
    setModalOpen(false)
    setForm({ nom: '', prenom: '', email: '', telephone: '', adresse: '' })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Propriétaires</h1>
          <p className="text-stone-400 mt-1">{proprietaires.length} propriétaire{proprietaires.length !== 1 ? 's' : ''} enregistré{proprietaires.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> Ajouter
        </Button>
      </div>

      <div className="bg-stone-800 rounded-xl border border-stone-700">
        {loading ? (
          <div className="p-12 text-center text-stone-500">Chargement...</div>
        ) : proprietaires.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucun propriétaire</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Biens</th>
                  <th>Revenus YTD</th>
                  <th>Inscrit le</th>
                </tr>
              </thead>
              <tbody>
                {proprietaires.map(p => (
                  <tr key={p.id}>
                    <td className="font-medium text-white">{p.prenom} {p.nom}</td>
                    <td>{p.email}</td>
                    <td>{p.telephone || '—'}</td>
                    <td>{p.nb_biens}</td>
                    <td className="text-emerald-400 font-medium">
                      {(p.revenus ?? 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td>{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter un propriétaire">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1.5">Prénom *</label>
              <input name="prenom" value={form.prenom} onChange={handleChange} className="w-full px-4 py-3 bg-stone-700 border border-stone-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-600" placeholder="Jean" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1.5">Nom *</label>
              <input name="nom" value={form.nom} onChange={handleChange} className="w-full px-4 py-3 bg-stone-700 border border-stone-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-600" placeholder="Dupont" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1.5">Email *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-3 bg-stone-700 border border-stone-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-600" placeholder="jean@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1.5">Téléphone</label>
            <input name="telephone" value={form.telephone} onChange={handleChange} className="w-full px-4 py-3 bg-stone-700 border border-stone-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-600" placeholder="06 12 34 56 78" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1.5">Adresse</label>
            <input name="adresse" value={form.adresse} onChange={handleChange} className="w-full px-4 py-3 bg-stone-700 border border-stone-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-600" placeholder="12 rue des Pins, Gujan-Mestras" />
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
