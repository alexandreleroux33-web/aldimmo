'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Proprietaire, Bien, Reservation } from '@/lib/types'
import { ArrowLeft, Mail, Phone, MapPin, Building2, Euro, Calendar, Pencil, Trash2, Archive, X, Check, AlertTriangle, Link as LinkIcon, Unlink, ShieldCheck } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'
import { adminSelect, adminUpdate, adminDelete } from '@/lib/actions/admin'
import { formatMontant } from '@/lib/utils'

type EditForm = { nom: string; prenom: string; email: string; telephone: string; adresse: string }

export default function ProprietaireDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [prop, setProp]               = useState<Proprietaire | null>(null)
  const [biens, setBiens]             = useState<Bien[]>([])
  const [reservations, setRes]        = useState<Reservation[]>([])
  const [loading, setLoading]         = useState(true)

  // UI state
  const [editing, setEditing]         = useState(false)
  const [editForm, setEditForm]       = useState<EditForm>({ nom: '', prenom: '', email: '', telephone: '', adresse: '' })
  const [saving, setSaving]           = useState(false)
  const [editError, setEditError]     = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const [archiving, setArchiving]     = useState(false)
  const [linking, setLinking]         = useState(false)
  const [linkError, setLinkError]     = useState('')
  const [linkSuccess, setLinkSuccess] = useState('')

  const load = async () => {
    const [props, bi, res] = await Promise.all([
      adminSelect<Proprietaire>('proprietaires', { eqCol: 'id', eqVal: id }),
      adminSelect<Bien>('biens', { eqCol: 'proprietaire_id', eqVal: id, order: 'created_at', orderAsc: true }),
      adminSelect<Reservation>('reservations', {
        eqCol: 'proprietaire_id',
        eqVal: id,
        order: 'date_debut',
        orderAsc: false,
      }),
    ])
    const p = props[0] ?? null
    // Attach bien name to each reservation client-side
    const enrichedRes = res.map(r => ({ ...r, _bienNom: bi.find(b => b.id === r.bien_id)?.nom ?? '—' }))
    setProp(p)
    setBiens(bi)
    setRes(enrichedRes as any)
    setLoading(false)
    if (p) setEditForm({ nom: p.nom, prenom: p.prenom, email: p.email, telephone: p.telephone ?? '', adresse: p.adresse ?? '' })
  }

  useEffect(() => { load() }, [id])

  const handleSave = async () => {
    setEditError('')
    if (!editForm.nom || !editForm.prenom || !editForm.email) { setEditError('Nom, prénom et email requis'); return }
    setSaving(true)
    try {
      await adminUpdate('proprietaires', id, editForm)
      setProp(p => p ? { ...p, ...editForm } : p)
      setEditing(false)
    } catch (err: any) {
      setEditError(err.message)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await adminDelete('proprietaires', id)
      router.push('/admin/proprietaires')
    } catch (err: any) {
      setDeleting(false)
      setConfirmDelete(false)
      alert('Erreur : ' + err.message)
    }
  }

  const handleArchive = async () => {
    if (!prop) return
    setArchiving(true)
    const newActif = prop.actif === false ? true : false
    try {
      await adminUpdate('proprietaires', id, { actif: newActif })
      setProp(p => p ? { ...p, actif: newActif } : p)
    } catch (err: any) {
      alert('Erreur : ' + err.message)
    }
    setArchiving(false)
  }

  const handleLink = async () => {
    if (!prop) return
    setLinking(true)
    setLinkError('')
    setLinkSuccess('')
    try {
      const res = await fetch('/api/admin/link-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proprietaire_id: id, email: prop.email }),
      })
      const json = await res.json()
      if (!res.ok) { setLinkError(json.error); return }
      setProp(p => p ? { ...p, user_id: json.user_id } : p)
      const since = json.last_sign_in ? new Date(json.last_sign_in).toLocaleDateString('fr-FR') : null
      setLinkSuccess(`Compte lié avec succès${since ? ` · Dernière connexion : ${since}` : ''}`)
    } catch (err: any) {
      setLinkError(err.message)
    } finally {
      setLinking(false)
    }
  }

  const handleUnlink = async () => {
    if (!prop) return
    setLinking(true)
    setLinkError('')
    setLinkSuccess('')
    try {
      const res = await fetch('/api/admin/link-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proprietaire_id: id, action: 'unlink' }),
      })
      const json = await res.json()
      if (!res.ok) { setLinkError(json.error); return }
      setProp(p => p ? { ...p, user_id: undefined } : p)
      setLinkSuccess('Compte délié.')
    } catch (err: any) {
      setLinkError(err.message)
    } finally {
      setLinking(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div style={{ color: '#A89E98' }}>Chargement...</div>
    </div>
  )

  if (!prop) return (
    <div className="text-center py-16">
      <p style={{ color: '#A89E98' }}>Propriétaire introuvable</p>
      <Link href="/admin/proprietaires" className="inline-flex items-center gap-2 text-sm mt-4" style={{ color: '#5B8C6B' }}>
        <ArrowLeft className="w-4 h-4" />Retour à la liste
      </Link>
    </div>
  )

  const actif = prop.actif !== false
  const totalRevenus = reservations.filter(r => r.statut !== 'annule').reduce((s, r) => s + Number(r.montant_total), 0)
  const initials = `${prop.prenom[0] ?? ''}${prop.nom[0] ?? ''}`.toUpperCase()

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/admin/proprietaires" className="inline-flex items-center gap-2 text-sm transition-colors" style={{ color: '#A89E98' }}>
        <ArrowLeft className="w-4 h-4" />
        Retour aux propriétaires
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
            style={{ background: actif ? '#5B8C6B' : '#A89E98' }}
          >
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold" style={{ color: '#2D2926' }}>{prop.prenom} {prop.nom}</h1>
              {!actif && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(45,41,38,0.08)', color: '#A89E98' }}>
                  Archivé
                </span>
              )}
            </div>
            <p className="text-sm mt-0.5" style={{ color: '#A89E98' }}>
              Client depuis {new Date(prop.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <ActionBtn icon={<Pencil className="w-4 h-4" />} label="Modifier" onClick={() => { setEditing(true); setEditError('') }} color="#0369a1" bg="rgba(3,105,161,0.08)" border="rgba(3,105,161,0.2)" />
          <ActionBtn
            icon={<Archive className="w-4 h-4" />}
            label={actif ? 'Archiver' : 'Désarchiver'}
            onClick={handleArchive}
            loading={archiving}
            color="#92680a"
            bg="rgba(234,179,8,0.08)"
            border="rgba(234,179,8,0.2)"
          />
          <ActionBtn icon={<Trash2 className="w-4 h-4" />} label="Supprimer" onClick={() => setConfirmDelete(true)} color="#b91c1c" bg="rgba(185,28,28,0.06)" border="rgba(185,28,28,0.18)" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="space-y-4">
          {/* Coordonnées */}
          <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
            <h2 className="font-semibold mb-4" style={{ color: '#2D2926' }}>Coordonnées</h2>
            <div className="space-y-3">
              <InfoRow icon={<Mail className="w-4 h-4" />} value={prop.email} />
              <InfoRow icon={<Phone className="w-4 h-4" />} value={prop.telephone || '—'} />
              <InfoRow icon={<MapPin className="w-4 h-4" />} value={prop.adresse || '—'} multiline />
            </div>
          </div>

          {/* Compte client */}
          <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4" style={{ color: '#5B8C6B' }} />
              <h2 className="font-semibold" style={{ color: '#2D2926' }}>Compte client</h2>
            </div>

            {linkError && (
              <div className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-3">{linkError}</div>
            )}
            {linkSuccess && (
              <div className="text-xs rounded-xl px-3 py-2 mb-3" style={{ background: 'rgba(91,140,107,0.1)', color: '#3A5E46' }}>{linkSuccess}</div>
            )}

            {prop.user_id ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(91,140,107,0.08)', border: '1px solid rgba(91,140,107,0.2)' }}>
                  <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#3A5E46' }} />
                  <div>
                    <div className="font-medium" style={{ color: '#3A5E46' }}>Compte lié</div>
                    <div className="mt-0.5 font-mono text-xs break-all" style={{ color: '#5B8C6B' }}>{prop.user_id}</div>
                  </div>
                </div>
                <p className="text-xs" style={{ color: '#A89E98' }}>
                  Ce propriétaire voit ses réservations et biens dans son espace /dashboard.
                </p>
                <button
                  onClick={handleUnlink}
                  disabled={linking}
                  className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl w-full justify-center transition-all"
                  style={{ background: 'rgba(185,28,28,0.06)', color: '#b91c1c', border: '1px solid rgba(185,28,28,0.15)' }}
                >
                  <Unlink className="w-3.5 h-3.5" />
                  {linking ? 'Déliaison...' : 'Délier le compte'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(45,41,38,0.04)', border: '1px solid rgba(45,41,38,0.08)' }}>
                  <Unlink className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#A89E98' }} />
                  <span style={{ color: '#A89E98' }}>Aucun compte lié</span>
                </div>
                <p className="text-xs" style={{ color: '#A89E98' }}>
                  Cherche automatiquement un compte Supabase avec l'email <strong style={{ color: '#7A6E68' }}>{prop.email}</strong>.
                  Le propriétaire doit d'abord créer son compte sur le site.
                </p>
                <button
                  onClick={handleLink}
                  disabled={linking}
                  className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl w-full justify-center transition-all"
                  style={{ background: linking ? 'rgba(45,41,38,0.04)' : 'rgba(91,140,107,0.1)', color: linking ? '#A89E98' : '#3A5E46', border: '1px solid rgba(91,140,107,0.2)' }}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  {linking ? 'Recherche...' : 'Lier le compte'}
                </button>
              </div>
            )}
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard icon={<Building2 className="w-5 h-5" />} value={biens.length} label={`Bien${biens.length > 1 ? 's' : ''}`} />
            <KpiCard
              icon={<Calendar className="w-5 h-5" />}
              value={reservations.filter(r => r.statut !== 'annule').length}
              label="Réservations"
            />
          </div>

          <div className="rounded-2xl p-4" style={{ background: 'rgba(91,140,107,0.08)', border: '1px solid rgba(91,140,107,0.2)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Euro className="w-4 h-4" style={{ color: '#3A5E46' }} />
              <span className="text-sm font-medium" style={{ color: '#3A5E46' }}>Revenus totaux</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: '#2D2926' }}>
              {totalRevenus.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#5B8C6B' }}>
              Commission ALD : {(totalRevenus * 0.2).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="lg:col-span-2 space-y-6">
          {/* Biens */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(45,41,38,0.08)' }}>
              <h2 className="font-semibold" style={{ color: '#2D2926' }}>Biens associés ({biens.length})</h2>
            </div>
            {biens.length === 0 ? (
              <div className="p-8 text-center" style={{ color: '#A89E98' }}>Aucun bien enregistré</div>
            ) : (
              <div>
                {biens.map((b, i) => (
                  <div
                    key={b.id}
                    className="px-6 py-4 flex items-center justify-between"
                    style={{ borderBottom: i < biens.length - 1 ? '1px solid rgba(45,41,38,0.05)' : 'none' }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium" style={{ color: '#2D2926' }}>{b.nom}</div>
                      <div className="text-xs mt-0.5 truncate" style={{ color: '#A89E98' }}>{b.adresse}</div>
                    </div>
                    <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-xs" style={{ color: '#A89E98' }}>{b.chambres} ch. · {b.capacite} pers.</div>
                        <div className="text-sm font-medium" style={{ color: '#3A5E46' }}>
                          {Number(b.prix_nuit).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}/nuit
                        </div>
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={b.statut === 'actif'
                          ? { background: 'rgba(91,140,107,0.1)', color: '#3A5E46' }
                          : { background: 'rgba(45,41,38,0.06)', color: '#A89E98' }
                        }
                      >
                        {b.statut}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reservations */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(45,41,38,0.08)' }}>
              <h2 className="font-semibold" style={{ color: '#2D2926' }}>Historique réservations ({reservations.length})</h2>
            </div>
            {reservations.length === 0 ? (
              <div className="p-8 text-center" style={{ color: '#A89E98' }}>Aucune réservation</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Locataire</th>
                      <th>Bien</th>
                      <th>Arrivée</th>
                      <th>Départ</th>
                      <th>Montant</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map(r => (
                      <tr key={r.id}>
                        <td className="font-medium" style={{ color: '#2D2926' }}>{r.locataire_nom}</td>
                        <td>{(r as any)._bienNom}</td>
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
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <Modal title="Modifier le propriétaire" onClose={() => setEditing(false)}>
          <div className="space-y-4">
            {editError && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{editError}</div>}
            <div className="grid grid-cols-2 gap-3">
              <FI label="Prénom *" value={editForm.prenom} onChange={v => setEditForm(f => ({ ...f, prenom: v }))} />
              <FI label="Nom *" value={editForm.nom} onChange={v => setEditForm(f => ({ ...f, nom: v }))} />
            </div>
            <FI label="Email *" type="email" value={editForm.email} onChange={v => setEditForm(f => ({ ...f, email: v }))} />
            <FI label="Téléphone" value={editForm.telephone} onChange={v => setEditForm(f => ({ ...f, telephone: v }))} />
            <FI label="Adresse" value={editForm.adresse} onChange={v => setEditForm(f => ({ ...f, adresse: v }))} />
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'rgba(45,41,38,0.06)', color: '#7A6E68' }}>
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: saving ? '#A89E98' : '#5B8C6B' }}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <Modal title="Supprimer ce propriétaire ?" onClose={() => setConfirmDelete(false)}>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.15)' }}>
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#b91c1c' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#b91c1c' }}>Cette action est irréversible.</p>
                <p className="text-sm mt-1" style={{ color: '#7A6E68' }}>
                  Le profil de <strong>{prop.prenom} {prop.nom}</strong> sera définitivement supprimé.
                  Les biens et réservations associés resteront en base.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'rgba(45,41,38,0.06)', color: '#7A6E68' }}>
                Annuler
              </button>
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

/* ── Sub-components ─────────────────────────────────────── */

function ActionBtn({ icon, label, onClick, loading, color, bg, border }: {
  icon: React.ReactNode; label: string; onClick: () => void
  loading?: boolean; color: string; bg: string; border: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all"
      style={{ color, background: bg, border: `1px solid ${border}`, opacity: loading ? 0.6 : 1 }}
    >
      {icon}{label}
    </button>
  )
}

function InfoRow({ icon, value, multiline }: { icon: React.ReactNode; value: string; multiline?: boolean }) {
  return (
    <div className={`flex gap-3 ${multiline ? 'items-start' : 'items-center'}`}>
      <span className="flex-shrink-0 mt-0.5" style={{ color: '#A89E98' }}>{icon}</span>
      <span className={`text-sm ${multiline ? '' : 'truncate'}`} style={{ color: '#7A6E68' }}>{value}</span>
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
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
        style={{ background: '#FAF8F5', border: '1px solid rgba(45,41,38,0.1)', color: '#2D2926' }}
      />
    </div>
  )
}
