'use client'

import { useEffect, useState } from 'react'
import { Proprietaire } from '@/lib/types'
import { Plus, Phone, Mail, Building2, Euro, Search, Archive } from 'lucide-react'
import Link from 'next/link'
import { adminInsert, adminSelect } from '@/lib/actions/admin'

type EnrichedProp = Proprietaire & { nb_biens: number; revenus: number }
type Tab = 'actifs' | 'archives'

const AVATAR_COLORS = ['#5B8C6B', '#0369a1', '#7c3aed', '#b45309', '#be185d', '#0f766e']

export default function AdminProprietairesPage() {
  const [proprietaires, setProprietaires] = useState<EnrichedProp[]>([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState<Tab>('actifs')
  const [search, setSearch]     = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm]         = useState({ nom: '', prenom: '', email: '', telephone: '', adresse: '' })
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const load = async () => {
    const [props, biens, res] = await Promise.all([
      adminSelect<Proprietaire>('proprietaires', { order: 'created_at', orderAsc: false }),
      adminSelect<{ id: string; proprietaire_id: string }>('biens', { select: 'id,proprietaire_id' }),
      adminSelect<{ proprietaire_id: string; montant_total: number; statut: string }>('reservations', { select: 'proprietaire_id,montant_total,statut' }),
    ])
    const resActives = res.filter(r => r.statut !== 'annule')
    const enriched = props.map(p => ({
      ...p,
      nb_biens: biens.filter(b => b.proprietaire_id === p.id).length,
      revenus:  resActives.filter(r => r.proprietaire_id === p.id).reduce((s, r) => s + Number(r.montant_total), 0),
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
      await adminInsert('proprietaires', { ...form, actif: true })
    } catch (err: any) { setSaving(false); setError(err.message); return }
    setSaving(false)
    setModalOpen(false)
    setForm({ nom: '', prenom: '', email: '', telephone: '', adresse: '' })
    load()
  }

  // actif === undefined → considéré actif (avant la colonne)
  const actifs   = proprietaires.filter(p => p.actif !== false)
  const archives = proprietaires.filter(p => p.actif === false)
  const pool     = tab === 'actifs' ? actifs : archives

  const filtered = pool.filter(p => {
    const q = search.toLowerCase()
    return !q || `${p.prenom} ${p.nom} ${p.email}`.toLowerCase().includes(q)
  })

  const initials = (p: Proprietaire) => `${p.prenom[0] ?? ''}${p.nom[0] ?? ''}`.toUpperCase()

  const tabBtn = (t: Tab, label: string, count: number) => (
    <button
      onClick={() => setTab(t)}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
      style={tab === t
        ? { background: '#5B8C6B', color: 'white' }
        : { background: 'white', color: '#7A6E68', border: '1px solid rgba(45,41,38,0.1)' }
      }
    >
      {label}
      <span
        className="text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
        style={tab === t
          ? { background: 'rgba(255,255,255,0.25)', color: 'white' }
          : { background: 'rgba(45,41,38,0.07)', color: '#7A6E68' }
        }
      >
        {count}
      </span>
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#2D2926' }}>Propriétaires</h1>
          <p className="mt-1" style={{ color: '#A89E98' }}>
            {actifs.length} actif{actifs.length > 1 ? 's' : ''}
            {archives.length > 0 && ` · ${archives.length} archivé${archives.length > 1 ? 's' : ''}`}
          </p>
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

      {/* Tabs + Search */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {tabBtn('actifs',   'Actifs',   actifs.length)}
          {tabBtn('archives', 'Archivés', archives.length)}
        </div>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#A89E98' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
            style={{ background: 'white', border: '1px solid rgba(45,41,38,0.1)', color: '#2D2926' }}
          />
        </div>
      </div>

      {/* Archived notice */}
      {tab === 'archives' && archives.length > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
          style={{ background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.2)', color: '#92680a' }}
        >
          <Archive className="w-4 h-4 flex-shrink-0" />
          Ces propriétaires sont archivés. Ouvrez leur fiche pour les désarchiver.
        </div>
      )}

      {/* Cards */}
      {loading ? (
        <div className="text-center py-16" style={{ color: '#A89E98' }}>Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: '#A89E98' }}>
          {tab === 'archives' ? 'Aucun propriétaire archivé' : 'Aucun propriétaire trouvé'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p, i) => {
            const archived = p.actif === false
            return (
              <Link
                key={p.id}
                href={`/admin/proprietaires/${p.id}`}
                className="block rounded-2xl p-5 transition-all hover:shadow-md"
                style={{
                  background: archived ? 'rgba(250,248,245,0.7)' : 'white',
                  border: `1px solid ${archived ? 'rgba(45,41,38,0.06)' : 'rgba(45,41,38,0.08)'}`,
                  opacity: archived ? 0.8 : 1,
                }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                    style={{ background: archived ? '#A89E98' : AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                  >
                    {initials(p)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate" style={{ color: archived ? '#A89E98' : '#2D2926' }}>
                        {p.prenom} {p.nom}
                      </span>
                      {archived && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(45,41,38,0.08)', color: '#A89E98' }}>
                          Archivé
                        </span>
                      )}
                    </div>
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
                    <Building2 className="w-3.5 h-3.5" style={{ color: archived ? '#A89E98' : '#5B8C6B' }} />
                    <span className="text-xs font-medium" style={{ color: '#2D2926' }}>
                      {p.nb_biens} bien{p.nb_biens > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <Euro className="w-3.5 h-3.5" style={{ color: archived ? '#A89E98' : '#5B8C6B' }} />
                    <span className="text-xs font-medium" style={{ color: '#2D2926' }}>
                      {p.revenus.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Add modal */}
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
