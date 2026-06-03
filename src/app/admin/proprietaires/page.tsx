'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Proprietaire } from '@/lib/types'
import { Plus, Phone, Mail, Building2, Euro, Search } from 'lucide-react'
import Link from 'next/link'
import { adminInsert } from '@/lib/actions/admin'

type EnrichedProp = Proprietaire & { nb_biens: number; revenus: number }

export default function AdminProprietairesPage() {
  const [proprietaires, setProprietaires] = useState<EnrichedProp[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', adresse: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    const supabase = createClient()
    const { data: props } = await supabase.from('proprietaires').select('*').order('created_at', { ascending: false })
    const { data: biens } = await supabase.from('biens').select('id, proprietaire_id')
    const { data: res } = await supabase.from('reservations').select('proprietaire_id, montant_total').neq('statut', 'annule')

    const enriched = (props || []).map(p => ({
      ...p,
      nb_biens: (biens || []).filter(b => b.proprietaire_id === p.id).length,
      revenus: (res || []).filter(r => r.proprietaire_id === p.id).reduce((s, r) => s + Number(r.montant_total), 0),
    }))

    setProprietaires(enriched)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    setError('')
    if (!form.nom || !form.prenom || !form.email) { setError('Nom, prénom et email requis'); return }
    setSaving(true)
    try {
      await adminInsert('proprietaires', form)
    } catch (err: any) {
      setSaving(false)
      setError(err.message)
      return
    }
    setSaving(false)
    setModalOpen(false)
    setForm({ nom: '', prenom: '', email: '', telephone: '', adresse: '' })
    load()
  }

  const filtered = proprietaires.filter(p => {
    const q = search.toLowerCase()
    return !q || `${p.prenom} ${p.nom} ${p.email}`.toLowerCase().includes(q)
  })

  const initials = (p: Proprietaire) => `${p.prenom[0] ?? ''}${p.nom[0] ?? ''}`.toUpperCase()
  const AVATAR_COLORS = ['#5B8C6B', '#0369a1', '#7c3aed', '#b45309', '#be185d', '#0f766e']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#2D2926' }}>Propriétaires</h1>
          <p className="mt-1" style={{ color: '#A89E98' }}>{proprietaires.length} propriétaire{proprietaires.length > 1 ? 's' : ''} enregistré{proprietaires.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ background: '#5B8C6B' }}
          onMouseEnter={e => e.currentTarget.style.background = '#4A7559'}
          onMouseLeave={e => e.currentTarget.style.background = '#5B8C6B'}
        >
          <Plus className="w-4 h-4" />Ajouter
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#A89E98' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un propriétaire..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
          style={{ background: 'white', border: '1px solid rgba(45,41,38,0.1)', color: '#2D2926' }}
        />
      </div>

      {loading ? (
        <div className="text-center py-16" style={{ color: '#A89E98' }}>Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: '#A89E98' }}>Aucun propriétaire trouvé</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <Link
              key={p.id}
              href={`/admin/proprietaires/${p.id}`}
              className="block rounded-2xl p-5 transition-all hover:shadow-md"
              style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                  style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                >
                  {initials(p)}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate" style={{ color: '#2D2926' }}>{p.prenom} {p.nom}</div>
                  <div className="text-xs" style={{ color: '#A89E98' }}>
                    Depuis {new Date(p.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs truncate" style={{ color: '#7A6E68' }}>
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#A89E98' }} />
                  {p.email}
                </div>
                {p.telephone && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#7A6E68' }}>
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#A89E98' }} />
                    {p.telephone}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-3" style={{ borderTop: '1px solid rgba(45,41,38,0.06)' }}>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" style={{ color: '#5B8C6B' }} />
                  <span className="text-xs font-medium" style={{ color: '#2D2926' }}>{p.nb_biens} bien{p.nb_biens > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <Euro className="w-3.5 h-3.5" style={{ color: '#5B8C6B' }} />
                  <span className="text-xs font-medium" style={{ color: '#2D2926' }}>
                    {p.revenus.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl shadow-2xl" style={{ background: 'white' }}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(45,41,38,0.08)' }}>
              <h2 className="font-semibold" style={{ color: '#2D2926' }}>Nouveau propriétaire</h2>
              <button onClick={() => setModalOpen(false)} style={{ color: '#A89E98' }}>✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {error && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <FI label="Prénom" value={form.prenom} onChange={v => setForm(f => ({ ...f, prenom: v }))} />
                <FI label="Nom" value={form.nom} onChange={v => setForm(f => ({ ...f, nom: v }))} />
              </div>
              <FI label="Email" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
              <FI label="Téléphone" value={form.telephone} onChange={v => setForm(f => ({ ...f, telephone: v }))} />
              <FI label="Adresse" value={form.adresse} onChange={v => setForm(f => ({ ...f, adresse: v }))} />
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'rgba(45,41,38,0.06)', color: '#7A6E68' }}>Annuler</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: saving ? '#A89E98' : '#5B8C6B' }}>
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FI({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A6E68' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none" style={{ background: '#FAF8F5', border: '1px solid rgba(45,41,38,0.1)', color: '#2D2926' }} />
    </div>
  )
}
