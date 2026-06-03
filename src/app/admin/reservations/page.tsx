'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Reservation, ReservationStatut, Bien, Proprietaire, Plateforme } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import { Plus, ChevronDown, X, Search, SlidersHorizontal } from 'lucide-react'
import { adminInsert, adminUpdate } from '@/lib/actions/admin'
import { formatMontant } from '@/lib/utils'

const STATUTS: ReservationStatut[] = ['en_attente', 'confirme', 'check_in', 'check_out', 'annule']
const STATUT_LABELS: Record<ReservationStatut, string> = {
  en_attente: 'En attente', confirme: 'Confirmée', check_in: 'Check-in', check_out: 'Check-out', annule: 'Annulée',
}
const PLATEFORMES: Plateforme[] = ['airbnb', 'booking', 'direct']

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [biens, setBiens] = useState<Bien[]>([])
  const [proprietaires, setProprietaires] = useState<Proprietaire[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [filterStatut, setFilterStatut] = useState('all')
  const [filterBien, setFilterBien] = useState('all')
  const [filterPlateforme, setFilterPlateforme] = useState('all')
  const [search, setSearch] = useState('')

  // Detail modal
  const [selected, setSelected] = useState<Reservation | null>(null)
  const [updatingStatut, setUpdatingStatut] = useState(false)

  // Add modal
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({
    bien_id: '', proprietaire_id: '',
    locataire_nom: '', locataire_email: '',
    date_debut: '', date_fin: '',
    montant_total: '', statut: 'en_attente' as ReservationStatut,
    plateforme: 'direct' as Plateforme,
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const load = async () => {
    const supabase = createClient()
    const [{ data: res }, { data: bi }, { data: props }] = await Promise.all([
      supabase.from('reservations').select('*, biens(nom), proprietaires(nom, prenom)').order('date_debut', { ascending: false }),
      supabase.from('biens').select('id, nom, proprietaire_id, adresse, type, chambres, capacite, prix_nuit, statut, created_at').order('nom'),
      supabase.from('proprietaires').select('id, nom, prenom, email, created_at').order('nom'),
    ])
    setReservations(res || [])
    setBiens(bi || [])
    setProprietaires(props || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = reservations.filter(r => {
    if (filterStatut !== 'all' && r.statut !== filterStatut) return false
    if (filterBien !== 'all' && r.bien_id !== filterBien) return false
    if (filterPlateforme !== 'all' && r.plateforme !== filterPlateforme) return false
    if (search) {
      const q = search.toLowerCase()
      if (!`${r.locataire_nom} ${r.locataire_email ?? ''}`.toLowerCase().includes(q)) return false
    }
    return true
  })

  const handleStatutChange = async (reservationId: string, newStatut: ReservationStatut) => {
    setUpdatingStatut(true)
    try {
      await adminUpdate('reservations', reservationId, { statut: newStatut })
    } catch { /* silently ignore, UI will reflect actual state on next load */ }
    setUpdatingStatut(false)
    setReservations(prev => prev.map(r => r.id === reservationId ? { ...r, statut: newStatut } : r))
    if (selected?.id === reservationId) setSelected(prev => prev ? { ...prev, statut: newStatut } : null)
  }

  const handleSave = async () => {
    setFormError('')
    if (!form.bien_id || !form.locataire_nom || !form.date_debut || !form.date_fin || !form.montant_total) {
      setFormError('Tous les champs obligatoires doivent être remplis')
      return
    }
    setSaving(true)
    const bien = biens.find(b => b.id === form.bien_id)
    try {
      await adminInsert('reservations', {
        ...form,
        proprietaire_id: form.proprietaire_id || bien?.proprietaire_id,
        montant_total: parseFloat(form.montant_total),
      })
    } catch (err: any) {
      setSaving(false)
      setFormError(err.message)
      return
    }
    setSaving(false)
    setAddOpen(false)
    load()
  }

  const selectStyle = {
    background: 'white',
    border: '1px solid rgba(45,41,38,0.1)',
    color: '#2D2926',
    borderRadius: '0.75rem',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    outline: 'none',
    appearance: 'none' as const,
    paddingRight: '2rem',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#2D2926' }}>Réservations</h1>
          <p className="mt-1" style={{ color: '#A89E98' }}>{filtered.length} sur {reservations.length} réservations</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ background: '#5B8C6B' }}
          onMouseEnter={e => e.currentTarget.style.background = '#4A7559'}
          onMouseLeave={e => e.currentTarget.style.background = '#5B8C6B'}
        >
          <Plus className="w-4 h-4" />Ajouter
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#A89E98' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un locataire..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
            style={{ background: 'white', border: '1px solid rgba(45,41,38,0.1)', color: '#2D2926' }}
          />
        </div>
        <div className="relative">
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} style={selectStyle}>
            <option value="all">Tous les statuts</option>
            {STATUTS.map(s => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: '#A89E98' }} />
        </div>
        <div className="relative">
          <select value={filterBien} onChange={e => setFilterBien(e.target.value)} style={selectStyle}>
            <option value="all">Tous les biens</option>
            {biens.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: '#A89E98' }} />
        </div>
        <div className="relative">
          <select value={filterPlateforme} onChange={e => setFilterPlateforme(e.target.value)} style={selectStyle}>
            <option value="all">Toutes plateformes</option>
            {PLATEFORMES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: '#A89E98' }} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
        {loading ? (
          <div className="p-12 text-center" style={{ color: '#A89E98' }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center" style={{ color: '#A89E98' }}>Aucune réservation trouvée</div>
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
                {filtered.map(r => (
                  <tr
                    key={r.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(r)}
                  >
                    <td>
                      <div className="font-medium" style={{ color: '#2D2926' }}>{r.locataire_nom}</div>
                      {r.locataire_email && <div className="text-xs" style={{ color: '#A89E98' }}>{r.locataire_email}</div>}
                    </td>
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
                    <td>
                      <span className="text-xs capitalize px-2 py-0.5 rounded-full" style={{ background: 'rgba(45,41,38,0.06)', color: '#7A6E68' }}>
                        {r.plateforme}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="relative">
                        <select
                          value={r.statut}
                          onChange={e => handleStatutChange(r.id, e.target.value as ReservationStatut)}
                          disabled={updatingStatut}
                          className="text-xs rounded-full px-2 py-1 pr-6 font-medium focus:outline-none appearance-none cursor-pointer"
                          style={{ background: 'transparent', border: 'none' }}
                        >
                          {STATUTS.map(s => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
                        </select>
                        <Badge statut={r.statut} className="pointer-events-none absolute inset-0" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl shadow-2xl" style={{ background: 'white' }}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(45,41,38,0.08)' }}>
              <h2 className="font-semibold" style={{ color: '#2D2926' }}>Détail réservation</h2>
              <button onClick={() => setSelected(null)} style={{ color: '#A89E98' }}><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-5">
              {/* Quick status change */}
              <div className="rounded-xl p-4" style={{ background: '#FAF8F5', border: '1px solid rgba(45,41,38,0.08)' }}>
                <div className="text-xs font-medium mb-3" style={{ color: '#A89E98' }}>CHANGER LE STATUT</div>
                <div className="flex flex-wrap gap-2">
                  {STATUTS.map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatutChange(selected.id, s)}
                      disabled={updatingStatut}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                      style={selected.statut === s
                        ? { background: '#5B8C6B', color: 'white' }
                        : { background: 'white', color: '#7A6E68', border: '1px solid rgba(45,41,38,0.1)' }
                      }
                    >
                      {STATUT_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Locataire" value={selected.locataire_nom} />
                <InfoItem label="Email" value={selected.locataire_email || '—'} />
                <InfoItem label="Bien" value={(selected as any).biens?.nom ?? '—'} />
                <InfoItem label="Propriétaire" value={(selected as any).proprietaires ? `${(selected as any).proprietaires.prenom} ${(selected as any).proprietaires.nom}` : '—'} />
                <InfoItem label="Arrivée" value={new Date(selected.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} />
                <InfoItem label="Départ" value={new Date(selected.date_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} />
                <InfoItem
                  label="Durée"
                  value={(() => {
                    const n = Math.round((new Date(selected.date_fin).getTime() - new Date(selected.date_debut).getTime()) / 86400000)
                    return `${n} nuit${n > 1 ? 's' : ''}`
                  })()}
                />
                <InfoItem label="Plateforme" value={selected.plateforme} />
              </div>

              <div className="rounded-xl p-4" style={{ background: 'rgba(91,140,107,0.06)', border: '1px solid rgba(91,140,107,0.15)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#3A5E46' }}>Montant total</span>
                  <span className="text-xl font-bold" style={{ color: '#2D2926' }}>
                    {formatMontant(Number(selected.montant_total), selected.plateforme)}
                  </span>
                </div>
                {Number(selected.montant_total) > 0 && (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs" style={{ color: '#A89E98' }}>Commission ALD (20%)</span>
                  <span className="text-sm font-medium" style={{ color: '#5B8C6B' }}>
                    {(Number(selected.montant_total) * 0.2).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setAddOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" style={{ background: 'white' }}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(45,41,38,0.08)' }}>
              <h2 className="font-semibold" style={{ color: '#2D2926' }}>Nouvelle réservation</h2>
              <button onClick={() => setAddOpen(false)} style={{ color: '#A89E98' }}><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {formError && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{formError}</div>}
              <FI label="Bien *" isSelect onChange={v => setForm(f => ({ ...f, bien_id: v }))}>
                <option value="">Sélectionner...</option>
                {biens.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
              </FI>
              <FI label="Propriétaire *" isSelect onChange={v => setForm(f => ({ ...f, proprietaire_id: v }))}>
                <option value="">Sélectionner...</option>
                {proprietaires.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
              </FI>
              <div className="grid grid-cols-2 gap-3">
                <FormInput label="Nom locataire *" value={form.locataire_nom} onChange={v => setForm(f => ({ ...f, locataire_nom: v }))} />
                <FormInput label="Email locataire" type="email" value={form.locataire_email} onChange={v => setForm(f => ({ ...f, locataire_email: v }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormInput label="Arrivée *" type="date" value={form.date_debut} onChange={v => setForm(f => ({ ...f, date_debut: v }))} />
                <FormInput label="Départ *" type="date" value={form.date_fin} onChange={v => setForm(f => ({ ...f, date_fin: v }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormInput label="Montant total (€) *" type="number" value={form.montant_total} onChange={v => setForm(f => ({ ...f, montant_total: v }))} />
                <FI label="Plateforme" isSelect onChange={v => setForm(f => ({ ...f, plateforme: v as Plateforme }))}>
                  {PLATEFORMES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </FI>
              </div>
              <FI label="Statut" isSelect onChange={v => setForm(f => ({ ...f, statut: v as ReservationStatut }))}>
                {STATUTS.map(s => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
              </FI>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'rgba(45,41,38,0.06)', color: '#7A6E68' }}>Annuler</button>
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

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs mb-0.5" style={{ color: '#A89E98' }}>{label}</div>
      <div className="text-sm font-medium" style={{ color: '#2D2926' }}>{value}</div>
    </div>
  )
}

function FormInput({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A6E68' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none" style={{ background: '#FAF8F5', border: '1px solid rgba(45,41,38,0.1)', color: '#2D2926' }} />
    </div>
  )
}

function FI({ label, children, onChange, isSelect }: { label: string; children: React.ReactNode; onChange: (v: string) => void; isSelect?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A6E68' }}>{label}</label>
      <select onChange={e => onChange(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none" style={{ background: '#FAF8F5', border: '1px solid rgba(45,41,38,0.1)', color: '#2D2926' }}>
        {children}
      </select>
    </div>
  )
}
