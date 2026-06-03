'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bien, BienType, Proprietaire } from '@/lib/types'
import { Plus, Building2, Users, Euro, Home, X, Link as LinkIcon, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { adminInsert, adminSelect } from '@/lib/actions/admin'

type EnrichedBien = Bien & { nb_res: number; revenus: number; taux_occupation: number; ical_airbnb_url?: string; ical_booking_url?: string }

const TYPE_LABELS: Record<BienType, string> = {
  appartement: 'Appartement',
  villa: 'Villa',
  maison: 'Maison',
}

export default function AdminBiensPage() {
  const [biens, setBiens] = useState<EnrichedBien[]>([])
  const [proprietaires, setProprietaires] = useState<Proprietaire[]>([])
  const [loading, setLoading] = useState(true)
  const [filterProp, setFilterProp] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [selected, setSelected]     = useState<EnrichedBien | null>(null)
  const [icalUrls, setIcalUrls]     = useState<{ airbnb: string; booking: string }>({ airbnb: '', booking: '' })
  const [syncing, setSyncing]       = useState<'airbnb' | 'booking' | null>(null)
  const [syncResult, setSyncResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [form, setForm] = useState({
    nom: '', adresse: '', type: 'appartement' as BienType,
    chambres: '1', capacite: '2', prix_nuit: '0', proprietaire_id: '',
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const load = async () => {
    const [bi, props, res] = await Promise.all([
      adminSelect<Bien>('biens', { order: 'created_at', orderAsc: false }),
      adminSelect<Proprietaire>('proprietaires', { select: 'id,nom,prenom,email,actif,created_at', order: 'nom', orderAsc: true }),
      adminSelect<{ bien_id: string; montant_total: number; date_debut: string; date_fin: string; statut: string }>('reservations', { select: 'bien_id,montant_total,date_debut,date_fin,statut' }),
    ])
    const activeProps = props.filter(p => p.actif !== false)

    const now = new Date()
    const enriched = bi.map(b => {
      const owner = props.find(p => p.id === b.proprietaire_id)
      const bRes = res.filter(r => r.bien_id === b.id)
      const revenus = bRes.reduce((s, r) => s + Number(r.montant_total), 0)
      // Occupation: count unique booked days in last 30 days
      const daysBooked = new Set<string>()
      bRes.forEach(r => {
        let cur = new Date(r.date_debut)
        const end = new Date(r.date_fin)
        while (cur < end) {
          const diff = (now.getTime() - cur.getTime()) / 86400000
          if (diff >= 0 && diff <= 30) daysBooked.add(cur.toISOString().slice(0, 10))
          cur = new Date(cur.getTime() + 86400000)
        }
      })
      return { ...b, nb_res: bRes.length, revenus, taux_occupation: Math.round((daysBooked.size / 30) * 100), _owner: owner }
    })

    setBiens(enriched)
    setProprietaires(activeProps)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    setFormError('')
    if (!form.nom || !form.adresse || !form.proprietaire_id) { setFormError('Nom, adresse et propriétaire requis'); return }
    setSaving(true)
    try {
      await adminInsert('biens', {
        nom: form.nom, adresse: form.adresse, type: form.type,
        chambres: parseInt(form.chambres), capacite: parseInt(form.capacite),
        prix_nuit: parseFloat(form.prix_nuit), proprietaire_id: form.proprietaire_id,
        statut: 'actif',
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

  const openDetail = (b: EnrichedBien) => {
    setSelected(b)
    setIcalUrls({ airbnb: b.ical_airbnb_url || '', booking: b.ical_booking_url || '' })
    setSyncResult(null)
  }

  const handleSync = async (plateforme: 'airbnb' | 'booking') => {
    if (!selected) return
    const url = plateforme === 'airbnb' ? icalUrls.airbnb : icalUrls.booking
    if (!url.trim()) { setSyncResult({ ok: false, msg: 'URL iCal manquante' }); return }
    setSyncing(plateforme)
    setSyncResult(null)
    try {
      const res = await fetch('/api/sync-ical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bien_id: selected.id,
          proprietaire_id: selected.proprietaire_id,
          ical_url: url.trim(),
          plateforme,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setSyncResult({ ok: true, msg: `${json.inserted} réservation${json.inserted > 1 ? 's' : ''} importée${json.inserted > 1 ? 's' : ''} · ${json.skipped} ignorée${json.skipped > 1 ? 's' : ''}` })
      load()
    } catch (err: any) {
      setSyncResult({ ok: false, msg: err.message })
    } finally {
      setSyncing(null)
    }
  }

  const filtered = filterProp === 'all' ? biens : biens.filter(b => b.proprietaire_id === filterProp)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#2D2926' }}>Biens</h1>
          <p className="mt-1" style={{ color: '#A89E98' }}>{biens.length} bien{biens.length > 1 ? 's' : ''} enregistré{biens.length > 1 ? 's' : ''}</p>
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

      {/* Filter by owner */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterProp('all')}
          className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
          style={filterProp === 'all' ? { background: '#5B8C6B', color: 'white' } : { background: 'white', color: '#7A6E68', border: '1px solid rgba(45,41,38,0.1)' }}
        >
          Tous
        </button>
        {proprietaires.map(p => (
          <button
            key={p.id}
            onClick={() => setFilterProp(p.id)}
            className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
            style={filterProp === p.id ? { background: '#5B8C6B', color: 'white' } : { background: 'white', color: '#7A6E68', border: '1px solid rgba(45,41,38,0.1)' }}
          >
            {p.prenom} {p.nom}
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="text-center py-16" style={{ color: '#A89E98' }}>Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: '#A89E98' }}>Aucun bien trouvé</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(b => (
            <div
              key={b.id}
              className="rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md"
              style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}
              onClick={() => openDetail(b)}
            >
              {/* Type badge + statut */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(91,140,107,0.1)', color: '#3A5E46' }}
                >
                  {TYPE_LABELS[b.type]}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={b.statut === 'actif'
                    ? { background: 'rgba(91,140,107,0.1)', color: '#3A5E46' }
                    : { background: 'rgba(45,41,38,0.06)', color: '#A89E98' }
                  }
                >
                  {b.statut}
                </span>
              </div>

              {/* Name */}
              <h3 className="font-semibold text-base mb-1" style={{ color: '#2D2926' }}>{b.nom}</h3>
              <p className="text-xs mb-4 truncate" style={{ color: '#A89E98' }}>{b.adresse}</p>

              {/* Proprietaire */}
              {(b as any)._owner && (
                <p className="text-xs mb-4" style={{ color: '#7A6E68' }}>
                  Propriétaire : <span className="font-medium">{(b as any)._owner.prenom} {(b as any)._owner.nom}</span>
                </p>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 rounded-xl" style={{ background: '#FAF8F5' }}>
                  <div className="text-xs font-bold" style={{ color: '#2D2926' }}>{b.chambres}</div>
                  <div className="text-xs" style={{ color: '#A89E98' }}>ch.</div>
                </div>
                <div className="text-center p-2 rounded-xl" style={{ background: '#FAF8F5' }}>
                  <div className="text-xs font-bold" style={{ color: '#2D2926' }}>{b.capacite}</div>
                  <div className="text-xs" style={{ color: '#A89E98' }}>pers.</div>
                </div>
                <div className="text-center p-2 rounded-xl" style={{ background: '#FAF8F5' }}>
                  <div className="text-xs font-bold" style={{ color: '#2D2926' }}>{Number(b.prix_nuit).toFixed(0)}€</div>
                  <div className="text-xs" style={{ color: '#A89E98' }}>/nuit</div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 pt-3" style={{ borderTop: '1px solid rgba(45,41,38,0.06)' }}>
                <div>
                  <div className="text-xs" style={{ color: '#A89E98' }}>Réservations</div>
                  <div className="text-sm font-semibold" style={{ color: '#2D2926' }}>{b.nb_res}</div>
                </div>
                <div>
                  <div className="text-xs" style={{ color: '#A89E98' }}>Revenus</div>
                  <div className="text-sm font-semibold" style={{ color: '#3A5E46' }}>
                    {b.revenus.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div className="ml-auto">
                  <div className="text-xs" style={{ color: '#A89E98' }}>Occ. 30j</div>
                  <div className="text-sm font-semibold" style={{ color: b.taux_occupation > 60 ? '#3A5E46' : '#7A6E68' }}>
                    {b.taux_occupation}%
                  </div>
                </div>
              </div>

              {/* iCal indicator */}
              {(b.ical_airbnb_url || b.ical_booking_url) && (
                <div className="mt-3 flex items-center gap-1.5 text-xs" style={{ color: '#5B8C6B' }}>
                  <LinkIcon className="w-3 h-3" />
                  iCal synchronisé
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" style={{ background: 'white' }}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(45,41,38,0.08)' }}>
              <h2 className="font-semibold" style={{ color: '#2D2926' }}>{selected.nom}</h2>
              <button onClick={() => setSelected(null)} style={{ color: '#A89E98' }}><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Type" value={TYPE_LABELS[selected.type]} />
                <InfoItem label="Statut" value={selected.statut} />
                <InfoItem label="Adresse" value={selected.adresse} />
                <InfoItem label="Propriétaire" value={(selected as any)._owner ? `${(selected as any)._owner.prenom} ${(selected as any)._owner.nom}` : '—'} />
                <InfoItem label="Chambres" value={`${selected.chambres} chambre${selected.chambres > 1 ? 's' : ''}`} />
                <InfoItem label="Capacité" value={`${selected.capacite} personne${selected.capacite > 1 ? 's' : ''}`} />
                <InfoItem label="Prix / nuit" value={`${Number(selected.prix_nuit).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`} />
                <InfoItem label="Réservations" value={String(selected.nb_res)} />
              </div>

              <div className="rounded-xl p-4" style={{ background: 'rgba(91,140,107,0.06)', border: '1px solid rgba(91,140,107,0.15)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#3A5E46' }}>Revenus totaux</span>
                  <span className="text-xl font-bold" style={{ color: '#2D2926' }}>
                    {selected.revenus.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs" style={{ color: '#A89E98' }}>Taux d'occupation (30j)</span>
                  <span className="text-sm font-semibold" style={{ color: '#5B8C6B' }}>{selected.taux_occupation}%</span>
                </div>
              </div>

              {/* iCal sync */}
              <div className="rounded-xl p-4" style={{ background: '#FAF8F5', border: '1px solid rgba(45,41,38,0.08)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <LinkIcon className="w-4 h-4" style={{ color: '#5B8C6B' }} />
                  <span className="text-sm font-medium" style={{ color: '#2D2926' }}>Synchronisation iCal</span>
                </div>

                {syncResult && (
                  <div
                    className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg mb-3"
                    style={syncResult.ok
                      ? { background: 'rgba(91,140,107,0.1)', color: '#3A5E46' }
                      : { background: 'rgba(185,28,28,0.08)', color: '#b91c1c' }
                    }
                  >
                    {syncResult.ok
                      ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    }
                    {syncResult.msg}
                  </div>
                )}

                <div className="space-y-3">
                  <ICalSyncRow
                    label="Airbnb"
                    value={icalUrls.airbnb}
                    onChange={v => setIcalUrls(u => ({ ...u, airbnb: v }))}
                    loading={syncing === 'airbnb'}
                    onSync={() => handleSync('airbnb')}
                  />
                  <ICalSyncRow
                    label="Booking.com"
                    value={icalUrls.booking}
                    onChange={v => setIcalUrls(u => ({ ...u, booking: v }))}
                    loading={syncing === 'booking'}
                    onSync={() => handleSync('booking')}
                  />
                </div>
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
              <h2 className="font-semibold" style={{ color: '#2D2926' }}>Nouveau bien</h2>
              <button onClick={() => setAddOpen(false)} style={{ color: '#A89E98' }}><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {formError && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{formError}</div>}
              <FormInput label="Nom du bien *" value={form.nom} onChange={v => setForm(f => ({ ...f, nom: v }))} />
              <FormInput label="Adresse *" value={form.adresse} onChange={v => setForm(f => ({ ...f, adresse: v }))} />
              <FSelect label="Propriétaire *" value={form.proprietaire_id} onChange={v => setForm(f => ({ ...f, proprietaire_id: v }))}>
                <option value="">Sélectionner...</option>
                {proprietaires.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
              </FSelect>
              <FSelect label="Type" value={form.type} onChange={v => setForm(f => ({ ...f, type: v as BienType }))}>
                <option value="appartement">Appartement</option>
                <option value="villa">Villa</option>
                <option value="maison">Maison</option>
              </FSelect>
              <div className="grid grid-cols-3 gap-3">
                <FormInput label="Chambres" type="number" value={form.chambres} onChange={v => setForm(f => ({ ...f, chambres: v }))} />
                <FormInput label="Capacité" type="number" value={form.capacite} onChange={v => setForm(f => ({ ...f, capacite: v }))} />
                <FormInput label="Prix/nuit (€)" type="number" value={form.prix_nuit} onChange={v => setForm(f => ({ ...f, prix_nuit: v }))} />
              </div>
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

function FSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A6E68' }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none" style={{ background: '#FAF8F5', border: '1px solid rgba(45,41,38,0.1)', color: '#2D2926' }}>
        {children}
      </select>
    </div>
  )
}

function ICalSyncRow({ label, value, onChange, loading, onSync }: {
  label: string; value: string; onChange: (v: string) => void; loading: boolean; onSync: () => void
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A6E68' }}>URL iCal {label}</label>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://www.airbnb.fr/calendar/ical/..."
          className="flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none min-w-0"
          style={{ background: 'white', border: '1px solid rgba(45,41,38,0.1)', color: '#2D2926' }}
        />
        <button
          onClick={onSync}
          disabled={loading || !value.trim()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white flex-shrink-0 transition-all"
          style={{ background: loading || !value.trim() ? '#A89E98' : '#5B8C6B' }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Sync...' : 'Sync'}
        </button>
      </div>
    </div>
  )
}
