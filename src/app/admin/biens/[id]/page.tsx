'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Bien, BienType, Reservation, Proprietaire } from '@/lib/types'
import { ArrowLeft, Building2, Users, Euro, Calendar, Pencil, Trash2, X, AlertTriangle, RefreshCw, CheckCircle, AlertCircle, Link as LinkIcon } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'
import { adminSelect, adminUpdate, adminDelete } from '@/lib/actions/admin'
import { formatMontant } from '@/lib/utils'

const TYPE_LABELS: Record<BienType, string> = { appartement: 'Appartement', villa: 'Villa', maison: 'Maison' }

type EditForm = { nom: string; adresse: string; type: BienType; chambres: string; capacite: string; prix_nuit: string; statut: 'actif' | 'inactif' }

export default function BienDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [bien, setBien]               = useState<Bien | null>(null)
  const [proprietaire, setProp]       = useState<Proprietaire | null>(null)
  const [reservations, setRes]        = useState<Reservation[]>([])
  const [loading, setLoading]         = useState(true)
  const [editing, setEditing]         = useState(false)
  const [editForm, setEditForm]       = useState<EditForm>({ nom: '', adresse: '', type: 'appartement', chambres: '1', capacite: '2', prix_nuit: '0', statut: 'actif' })
  const [saving, setSaving]           = useState(false)
  const [editError, setEditError]     = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting]       = useState(false)
  // iCal sync
  const [icalUrls, setIcalUrls]       = useState({ airbnb: '', booking: '' })
  const [syncing, setSyncing]         = useState<'airbnb' | 'booking' | null>(null)
  const [syncResult, setSyncResult]   = useState<{ ok: boolean; msg: string } | null>(null)

  const load = async () => {
    const [biens, res] = await Promise.all([
      adminSelect<Bien>('biens', { eqCol: 'id', eqVal: id }),
      adminSelect<Reservation>('reservations', { eqCol: 'bien_id', eqVal: id, order: 'date_debut', orderAsc: false }),
    ])
    const b = biens[0] ?? null
    setBien(b)
    setRes(res)
    if (b) {
      setEditForm({ nom: b.nom, adresse: b.adresse, type: b.type, chambres: String(b.chambres), capacite: String(b.capacite), prix_nuit: String(b.prix_nuit), statut: b.statut })
      setIcalUrls({ airbnb: (b as any).ical_airbnb_url || '', booking: (b as any).ical_booking_url || '' })
      const props = await adminSelect<Proprietaire>('proprietaires', { eqCol: 'id', eqVal: b.proprietaire_id })
      setProp(props[0] ?? null)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const handleSave = async () => {
    setEditError('')
    if (!editForm.nom || !editForm.adresse) { setEditError('Nom et adresse requis'); return }
    setSaving(true)
    try {
      await adminUpdate('biens', id, {
        nom: editForm.nom,
        adresse: editForm.adresse,
        type: editForm.type,
        chambres: parseInt(editForm.chambres),
        capacite: parseInt(editForm.capacite),
        prix_nuit: parseFloat(editForm.prix_nuit) || 0,
        statut: editForm.statut,
      })
      setBien(b => b ? { ...b, ...editForm, chambres: parseInt(editForm.chambres), capacite: parseInt(editForm.capacite), prix_nuit: parseFloat(editForm.prix_nuit) || 0 } : b)
      setEditing(false)
    } catch (err: any) {
      setEditError(err.message)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await adminDelete('biens', id)
      router.push('/admin/biens')
    } catch (err: any) {
      setDeleting(false)
      setConfirmDelete(false)
      setEditError('Erreur lors de la suppression : ' + err.message)
    }
  }

  const handleSync = async (plateforme: 'airbnb' | 'booking', reset = false) => {
    if (!bien) return
    const url = plateforme === 'airbnb' ? icalUrls.airbnb : icalUrls.booking
    if (!url.trim()) { setSyncResult({ ok: false, msg: 'URL iCal manquante' }); return }
    setSyncing(plateforme)
    setSyncResult(null)
    try {
      const r = await fetch('/api/sync-ical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bien_id: bien.id, proprietaire_id: bien.proprietaire_id, ical_url: url.trim(), plateforme, reset }),
      })
      const json = await r.json()
      if (!r.ok) throw new Error(json.error)
      const parts = []
      if (reset && json.deleted > 0) parts.push(`${json.deleted} supprimée${json.deleted > 1 ? 's' : ''}`)
      parts.push(`${json.inserted} importée${json.inserted > 1 ? 's' : ''}`)
      if (!reset && json.skipped > 0) parts.push(`${json.skipped} ignorée${json.skipped > 1 ? 's' : ''}`)
      setSyncResult({ ok: true, msg: parts.join(' · ') })
      load()
    } catch (err: any) {
      setSyncResult({ ok: false, msg: err.message })
    } finally {
      setSyncing(null)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64" style={{ color: '#A89E98' }}>Chargement...</div>
  if (!bien) return (
    <div className="text-center py-16">
      <p style={{ color: '#A89E98' }}>Bien introuvable</p>
      <Link href="/admin/biens" className="inline-flex items-center gap-2 text-sm mt-4" style={{ color: '#5B8C6B' }}>
        <ArrowLeft className="w-4 h-4" />Retour aux biens
      </Link>
    </div>
  )

  const revenus = reservations.filter(r => r.statut !== 'annule').reduce((s, r) => s + Number(r.montant_total), 0)

  return (
    <div className="space-y-6">
      <Link href="/admin/biens" className="inline-flex items-center gap-2 text-sm" style={{ color: '#A89E98' }}>
        <ArrowLeft className="w-4 h-4" />Retour aux biens
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold" style={{ color: '#2D2926' }}>{bien.nom}</h1>
            <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(91,140,107,0.1)', color: '#3A5E46' }}>{TYPE_LABELS[bien.type]}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={bien.statut === 'actif' ? { background: 'rgba(91,140,107,0.1)', color: '#3A5E46' } : { background: 'rgba(45,41,38,0.06)', color: '#A89E98' }}>{bien.statut}</span>
          </div>
          <p className="text-sm" style={{ color: '#A89E98' }}>{bien.adresse}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <ActionBtn icon={<Pencil className="w-4 h-4" />} label="Modifier" onClick={() => { setEditing(true); setEditError('') }} color="#0369a1" bg="rgba(3,105,161,0.08)" border="rgba(3,105,161,0.2)" />
          <ActionBtn icon={<Trash2 className="w-4 h-4" />} label="Supprimer" onClick={() => setConfirmDelete(true)} color="#b91c1c" bg="rgba(185,28,28,0.06)" border="rgba(185,28,28,0.18)" />
        </div>
      </div>

      {editError && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{editError}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="space-y-4">
          {/* Infos */}
          <div className="rounded-2xl p-5 space-y-3" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
            <h2 className="font-semibold mb-2" style={{ color: '#2D2926' }}>Informations</h2>
            <InfoRow label="Propriétaire" value={proprietaire ? `${proprietaire.prenom} ${proprietaire.nom}` : '—'} />
            <InfoRow label="Adresse" value={bien.adresse} />
            <InfoRow label="Chambres" value={`${bien.chambres} chambre${bien.chambres > 1 ? 's' : ''}`} />
            <InfoRow label="Capacité" value={`${bien.capacite} personne${bien.capacite > 1 ? 's' : ''}`} />
            {Number(bien.prix_nuit) > 0 && <InfoRow label="Prix / nuit" value={Number(bien.prix_nuit).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} />}
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard icon={<Calendar className="w-5 h-5" />} value={reservations.filter(r => r.statut !== 'annule').length} label="Réservations" />
            <KpiCard icon={<Users className="w-5 h-5" />} value={reservations.filter(r => ['check_in', 'confirme'].includes(r.statut)).length} label="Confirmées" />
          </div>
          <div className="rounded-2xl p-4" style={{ background: 'rgba(91,140,107,0.08)', border: '1px solid rgba(91,140,107,0.2)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Euro className="w-4 h-4" style={{ color: '#3A5E46' }} />
              <span className="text-sm font-medium" style={{ color: '#3A5E46' }}>Revenus totaux</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: '#2D2926' }}>
              {revenus > 0 ? revenus.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '—'}
            </div>
          </div>

          {/* iCal */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" style={{ color: '#5B8C6B' }} />
              <span className="text-sm font-medium" style={{ color: '#2D2926' }}>Synchronisation iCal</span>
            </div>
            {syncResult && (
              <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={syncResult.ok ? { background: 'rgba(91,140,107,0.1)', color: '#3A5E46' } : { background: 'rgba(185,28,28,0.08)', color: '#b91c1c' }}>
                {syncResult.ok ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                {syncResult.msg}
              </div>
            )}
            <ICalSyncRow label="Airbnb" value={icalUrls.airbnb} onChange={v => setIcalUrls(u => ({ ...u, airbnb: v }))} loading={syncing === 'airbnb'} onSync={() => handleSync('airbnb')} onReset={() => handleSync('airbnb', true)} />
            <ICalSyncRow label="Booking.com" value={icalUrls.booking} onChange={v => setIcalUrls(u => ({ ...u, booking: v }))} loading={syncing === 'booking'} onSync={() => handleSync('booking')} onReset={() => handleSync('booking', true)} />
          </div>
        </div>

        {/* Right: reservations */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(45,41,38,0.08)' }}>
              <h2 className="font-semibold" style={{ color: '#2D2926' }}>Réservations ({reservations.length})</h2>
            </div>
            {reservations.length === 0 ? (
              <div className="p-8 text-center" style={{ color: '#A89E98' }}>Aucune réservation</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Locataire</th>
                      <th>Arrivée</th>
                      <th>Départ</th>
                      <th>Plateforme</th>
                      <th>Montant</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map(r => (
                      <tr key={r.id}>
                        <td className="font-medium" style={{ color: '#2D2926' }}>{r.locataire_nom}</td>
                        <td>{new Date(r.date_debut).toLocaleDateString('fr-FR')}</td>
                        <td>{new Date(r.date_fin).toLocaleDateString('fr-FR')}</td>
                        <td><span className="text-xs capitalize px-2 py-0.5 rounded-full" style={{ background: 'rgba(45,41,38,0.06)', color: '#7A6E68' }}>{r.plateforme}</span></td>
                        <td className="font-medium" style={{ color: '#3A5E46' }}>{formatMontant(Number(r.montant_total), r.plateforme)}</td>
                        <td><Badge statut={r.statut} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <Modal title="Modifier le bien" onClose={() => setEditing(false)}>
          <div className="space-y-4">
            {editError && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{editError}</div>}
            <FI label="Nom du bien *" value={editForm.nom} onChange={v => setEditForm(f => ({ ...f, nom: v }))} />
            <FI label="Adresse *" value={editForm.adresse} onChange={v => setEditForm(f => ({ ...f, adresse: v }))} />
            <div className="grid grid-cols-2 gap-3">
              <FS label="Type" value={editForm.type} onChange={v => setEditForm(f => ({ ...f, type: v as BienType }))}>
                <option value="appartement">Appartement</option>
                <option value="villa">Villa</option>
                <option value="maison">Maison</option>
              </FS>
              <FS label="Statut" value={editForm.statut} onChange={v => setEditForm(f => ({ ...f, statut: v as 'actif' | 'inactif' }))}>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </FS>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FI label="Chambres" type="number" value={editForm.chambres} onChange={v => setEditForm(f => ({ ...f, chambres: v }))} />
              <FI label="Capacité" type="number" value={editForm.capacite} onChange={v => setEditForm(f => ({ ...f, capacite: v }))} />
              <FI label="Prix/nuit (€)" type="number" value={editForm.prix_nuit} onChange={v => setEditForm(f => ({ ...f, prix_nuit: v }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'rgba(45,41,38,0.06)', color: '#7A6E68' }}>Annuler</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: saving ? '#A89E98' : '#5B8C6B' }}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <Modal title="Supprimer ce bien ?" onClose={() => setConfirmDelete(false)}>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.15)' }}>
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#b91c1c' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#b91c1c' }}>Cette action est irréversible.</p>
                <p className="text-sm mt-1" style={{ color: '#7A6E68' }}>
                  Le bien <strong>{bien.nom}</strong> sera définitivement supprimé. Les réservations associées resteront en base.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'rgba(45,41,38,0.06)', color: '#7A6E68' }}>Annuler</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: deleting ? '#A89E98' : '#b91c1c' }}>
                {deleting ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────── */

function ActionBtn({ icon, label, onClick, color, bg, border }: { icon: React.ReactNode; label: string; onClick: () => void; color: string; bg: string; border: string }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium" style={{ color, background: bg, border: `1px solid ${border}` }}>
      {icon}{label}
    </button>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs flex-shrink-0" style={{ color: '#A89E98' }}>{label}</span>
      <span className="text-sm font-medium text-right" style={{ color: '#2D2926' }}>{value}</span>
    </div>
  )
}

function KpiCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-2xl p-4 text-center" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
      <span className="flex justify-center mb-2" style={{ color: '#5B8C6B' }}>{icon}</span>
      <div className="text-2xl font-bold" style={{ color: '#2D2926' }}>{value}</div>
      <div className="text-xs" style={{ color: '#A89E98' }}>{label}</div>
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl shadow-2xl" style={{ background: 'white' }}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(45,41,38,0.08)' }}>
          <h2 className="font-semibold" style={{ color: '#2D2926' }}>{title}</h2>
          <button onClick={onClose} style={{ color: '#A89E98' }}><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
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

function FS({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A6E68' }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none" style={{ background: '#FAF8F5', border: '1px solid rgba(45,41,38,0.1)', color: '#2D2926' }}>
        {children}
      </select>
    </div>
  )
}

function ICalSyncRow({ label, value, onChange, loading, onSync, onReset }: { label: string; value: string; onChange: (v: string) => void; loading: boolean; onSync: () => void; onReset: () => void }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: '#7A6E68' }}>URL iCal {label}</label>
      <div className="flex gap-1.5">
        <input value={value} onChange={e => onChange(e.target.value)} placeholder="https://..." className="flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none min-w-0" style={{ background: '#FAF8F5', border: '1px solid rgba(45,41,38,0.1)', color: '#2D2926' }} />
        <button onClick={onSync} disabled={loading || !value.trim()} title="Importer les nouvelles" className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium text-white" style={{ background: loading || !value.trim() ? '#A89E98' : '#5B8C6B' }}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />Sync
        </button>
        <button onClick={onReset} disabled={loading || !value.trim()} title="Supprimer et réimporter" className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium" style={{ background: loading || !value.trim() ? 'rgba(45,41,38,0.04)' : 'rgba(185,28,28,0.08)', color: loading || !value.trim() ? '#A89E98' : '#b91c1c' }}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />Reset
        </button>
      </div>
    </div>
  )
}
