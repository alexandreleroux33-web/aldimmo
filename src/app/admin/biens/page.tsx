'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bien, BienType, Proprietaire } from '@/lib/types'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Plus, Building2 } from 'lucide-react'

export default function AdminBiensPage() {
  const [biens, setBiens] = useState<Bien[]>([])
  const [proprietaires, setProprietaires] = useState<Proprietaire[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    nom: '',
    adresse: '',
    type: 'appartement' as BienType,
    chambres: '1',
    capacite: '2',
    prix_nuit: '0',
    proprietaire_id: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    const supabase = createClient()
    const [{ data: bi }, { data: props }] = await Promise.all([
      supabase.from('biens').select('*, proprietaires(nom, prenom)').order('created_at', { ascending: false }),
      supabase.from('proprietaires').select('*').order('nom'),
    ])
    setBiens(bi || [])
    setProprietaires(props || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const toggleStatut = async (bien: Bien) => {
    const supabase = createClient()
    const newStatut = bien.statut === 'actif' ? 'inactif' : 'actif'
    await supabase.from('biens').update({ statut: newStatut }).eq('id', bien.id)
    setBiens(prev => prev.map(b => b.id === bien.id ? { ...b, statut: newStatut } : b))
  }

  const handleSave = async () => {
    if (!form.nom || !form.adresse || !form.proprietaire_id) {
      setError('Nom, adresse et propriétaire sont requis.')
      return
    }
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('biens').insert({
      nom: form.nom,
      adresse: form.adresse,
      type: form.type,
      chambres: parseInt(form.chambres),
      capacite: parseInt(form.capacite),
      prix_nuit: parseFloat(form.prix_nuit),
      proprietaire_id: form.proprietaire_id,
      statut: 'actif',
    })
    setSaving(false)
    if (err) { setError(err.message); return }
    setModalOpen(false)
    setForm({ nom: '', adresse: '', type: 'appartement', chambres: '1', capacite: '2', prix_nuit: '0', proprietaire_id: '' })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Biens</h1>
          <p className="text-slate-400 mt-1">{biens.length} bien{biens.length !== 1 ? 's' : ''} enregistré{biens.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> Ajouter un bien
        </Button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Chargement...</div>
        ) : biens.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucun bien</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bien</th>
                  <th>Propriétaire</th>
                  <th>Type</th>
                  <th>Chambres</th>
                  <th>Prix/nuit</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {biens.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div className="font-medium text-white">{b.nom}</div>
                      <div className="text-slate-500 text-xs">{b.adresse}</div>
                    </td>
                    <td>{(b as any).proprietaires ? `${(b as any).proprietaires.prenom} ${(b as any).proprietaires.nom}` : '—'}</td>
                    <td className="capitalize">{b.type}</td>
                    <td>{b.chambres} ch. · {b.capacite} pers.</td>
                    <td className="font-medium text-sky-400">
                      {Number(b.prix_nuit).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td>
                      <button
                        onClick={() => toggleStatut(b)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          b.statut === 'actif' ? 'bg-sky-500' : 'bg-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            b.statut === 'actif' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`ml-2 text-xs ${b.statut === 'actif' ? 'text-sky-400' : 'text-slate-500'}`}>
                        {b.statut === 'actif' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter un bien">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Propriétaire *</label>
            <select name="proprietaire_id" value={form.proprietaire_id} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="">Sélectionner...</option>
              {proprietaires.map(p => (
                <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nom du bien *</label>
            <input name="nom" value={form.nom} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Villa Les Pins" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Adresse *</label>
            <input name="adresse" value={form.adresse} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="12 rue des Pins, Gujan-Mestras" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Type</label>
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full px-3 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="appartement">Appartement</option>
                <option value="villa">Villa</option>
                <option value="maison">Maison</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Chambres</label>
              <input type="number" name="chambres" value={form.chambres} onChange={handleChange} min={1}
                className="w-full px-3 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Capacité</label>
              <input type="number" name="capacite" value={form.capacite} onChange={handleChange} min={1}
                className="w-full px-3 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Prix par nuit (€)</label>
            <input type="number" name="prix_nuit" value={form.prix_nuit} onChange={handleChange} min={0} step={0.01}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500" />
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
