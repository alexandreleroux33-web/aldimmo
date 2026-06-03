'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Proprietaire, Bien, Reservation } from '@/lib/types'
import { ArrowLeft, Mail, Phone, MapPin, Building2, Euro, Calendar } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'

export default function ProprietaireDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [prop, setProp] = useState<Proprietaire | null>(null)
  const [biens, setBiens] = useState<Bien[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const [{ data: p }, { data: bi }, { data: res }] = await Promise.all([
        supabase.from('proprietaires').select('*').eq('id', id).single(),
        supabase.from('biens').select('*').eq('proprietaire_id', id).order('created_at'),
        supabase.from('reservations').select('*, biens(nom)').eq('proprietaire_id', id).order('date_debut', { ascending: false }),
      ])
      setProp(p)
      setBiens(bi || [])
      setReservations(res || [])
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-64" style={{ color: '#A89E98' }}>Chargement...</div>
  if (!prop) return <div className="text-center py-16" style={{ color: '#A89E98' }}>Propriétaire introuvable</div>

  const totalRevenus = reservations.filter(r => r.statut !== 'annule').reduce((s, r) => s + Number(r.montant_total), 0)
  const initials = `${prop.prenom[0] ?? ''}${prop.nom[0] ?? ''}`.toUpperCase()

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <Link href="/admin/proprietaires" className="inline-flex items-center gap-2 text-sm mb-4 transition-colors" style={{ color: '#A89E98' }}>
          <ArrowLeft className="w-4 h-4" />
          Retour aux propriétaires
        </Link>
        <div className="flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
            style={{ background: '#5B8C6B' }}
          >
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#2D2926' }}>{prop.prenom} {prop.nom}</h1>
            <p className="text-sm mt-0.5" style={{ color: '#A89E98' }}>
              Client depuis {new Date(prop.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: contact + stats */}
        <div className="space-y-4">
          {/* Contact */}
          <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
            <h2 className="font-semibold mb-4" style={{ color: '#2D2926' }}>Coordonnées</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 flex-shrink-0" style={{ color: '#A89E98' }} />
                <span className="text-sm truncate" style={{ color: '#7A6E68' }}>{prop.email}</span>
              </div>
              {prop.telephone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 flex-shrink-0" style={{ color: '#A89E98' }} />
                  <span className="text-sm" style={{ color: '#7A6E68' }}>{prop.telephone}</span>
                </div>
              )}
              {prop.adresse && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#A89E98' }} />
                  <span className="text-sm" style={{ color: '#7A6E68' }}>{prop.adresse}</span>
                </div>
              )}
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-4 text-center" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
              <Building2 className="w-5 h-5 mx-auto mb-2" style={{ color: '#5B8C6B' }} />
              <div className="text-2xl font-bold" style={{ color: '#2D2926' }}>{biens.length}</div>
              <div className="text-xs" style={{ color: '#A89E98' }}>Bien{biens.length > 1 ? 's' : ''}</div>
            </div>
            <div className="rounded-2xl p-4 text-center" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
              <Calendar className="w-5 h-5 mx-auto mb-2" style={{ color: '#5B8C6B' }} />
              <div className="text-2xl font-bold" style={{ color: '#2D2926' }}>{reservations.filter(r => r.statut !== 'annule').length}</div>
              <div className="text-xs" style={{ color: '#A89E98' }}>Réservations</div>
            </div>
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

        {/* Right: biens + reservations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Biens */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(45,41,38,0.08)' }}>
              <h2 className="font-semibold" style={{ color: '#2D2926' }}>Biens ({biens.length})</h2>
            </div>
            {biens.length === 0 ? (
              <div className="p-8 text-center" style={{ color: '#A89E98' }}>Aucun bien enregistré</div>
            ) : (
              <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as any}>
                {biens.map(b => (
                  <div key={b.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium" style={{ color: '#2D2926' }}>{b.nom}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#A89E98' }}>{b.adresse}</div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="text-xs" style={{ color: '#A89E98' }}>{b.chambres} ch. · {b.capacite} pers.</div>
                        <div className="text-sm font-medium" style={{ color: '#3A5E46' }}>
                          {Number(b.prix_nuit).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}/nuit
                        </div>
                      </div>
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
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reservations history */}
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
                        <td>{(r as any).biens?.nom ?? '—'}</td>
                        <td>{new Date(r.date_debut).toLocaleDateString('fr-FR')}</td>
                        <td>{new Date(r.date_fin).toLocaleDateString('fr-FR')}</td>
                        <td className="font-medium" style={{ color: '#3A5E46' }}>
                          {Number(r.montant_total).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
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
    </div>
  )
}
