'use client'

import { useEffect, useState } from 'react'
import { Demande, DemandeStatut } from '@/lib/types'
import { adminSelect, adminUpdate } from '@/lib/actions/admin'
import { Mail, Phone, MessageSquare, Search, ChevronDown } from 'lucide-react'

const STATUTS: { value: DemandeStatut; label: string; color: string; bg: string }[] = [
  { value: 'nouveau',   label: 'Nouveau',   color: '#0369a1', bg: 'rgba(3,105,161,0.09)' },
  { value: 'en_cours',  label: 'En cours',  color: '#b45309', bg: 'rgba(180,83,9,0.09)'  },
  { value: 'converti',  label: 'Converti',  color: '#15803d', bg: 'rgba(21,128,61,0.09)' },
  { value: 'refuse',    label: 'Refusé',    color: '#b91c1c', bg: 'rgba(185,28,28,0.09)' },
]

const TYPE_LABELS: Record<string, string> = {
  information: 'Information',
  devis:       'Devis',
  partenariat: 'Partenariat',
  autre:       'Autre',
}

type FilterStatut = DemandeStatut | 'tous'

function StatutBadge({ statut }: { statut: DemandeStatut }) {
  const s = STATUTS.find(s => s.value === statut)!
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  )
}

export default function AdminDemandesPage() {
  const [demandes, setDemandes]     = useState<Demande[]>([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState<FilterStatut>('tous')
  const [search, setSearch]         = useState('')
  const [selected, setSelected]     = useState<Demande | null>(null)
  const [updating, setUpdating]     = useState(false)

  const load = async () => {
    const rows = await adminSelect<Demande>('demandes', { order: 'created_at', orderAsc: false })
    setDemandes(rows)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const counts = {
    tous:      demandes.length,
    nouveau:   demandes.filter(d => d.statut === 'nouveau').length,
    en_cours:  demandes.filter(d => d.statut === 'en_cours').length,
    converti:  demandes.filter(d => d.statut === 'converti').length,
    refuse:    demandes.filter(d => d.statut === 'refuse').length,
  }

  const filtered = demandes.filter(d => {
    if (filter !== 'tous' && d.statut !== filter) return false
    const q = search.toLowerCase()
    return !q || `${d.nom} ${d.email} ${d.message}`.toLowerCase().includes(q)
  })

  const handleStatut = async (d: Demande, statut: DemandeStatut) => {
    setUpdating(true)
    await adminUpdate('demandes', d.id, { statut })
    setUpdating(false)
    setSelected(prev => prev?.id === d.id ? { ...prev, statut } : prev)
    setDemandes(prev => prev.map(r => r.id === d.id ? { ...r, statut } : r))
  }

  const tabBtn = (value: FilterStatut, label: string, count: number) => (
    <button
      key={value}
      onClick={() => setFilter(value)}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
      style={filter === value
        ? { background: '#5B8C6B', color: 'white' }
        : { background: 'white', color: '#7A6E68', border: '1px solid rgba(45,41,38,0.1)' }
      }
    >
      {label}
      <span
        className="text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
        style={filter === value
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
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#2D2926' }}>Demandes</h1>
        <p className="mt-1" style={{ color: '#A89E98' }}>
          {counts.nouveau} nouvelle{counts.nouveau > 1 ? 's' : ''} · {counts.tous} au total
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex flex-wrap gap-2">
          {tabBtn('tous',     'Toutes',    counts.tous)}
          {tabBtn('nouveau',  'Nouvelles', counts.nouveau)}
          {tabBtn('en_cours', 'En cours',  counts.en_cours)}
          {tabBtn('converti', 'Converties',counts.converti)}
          {tabBtn('refuse',   'Refusées',  counts.refuse)}
        </div>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#A89E98' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none"
            style={{ background: 'white', border: '1px solid rgba(45,41,38,0.1)', color: '#2D2926' }}
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16" style={{ color: '#A89E98' }}>Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: '#A89E98' }}>Aucune demande trouvée</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(d => (
            <button
              key={d.id}
              onClick={() => setSelected(d)}
              className="w-full text-left rounded-2xl p-5 transition-all hover:shadow-md"
              style={{ background: 'white', border: `1px solid ${d.statut === 'nouveau' ? 'rgba(3,105,161,0.2)' : 'rgba(45,41,38,0.08)'}` }}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold" style={{ color: '#2D2926' }}>{d.nom}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(45,41,38,0.06)', color: '#7A6E68' }}>
                      {TYPE_LABELS[d.type] ?? d.type}
                    </span>
                    <StatutBadge statut={d.statut} />
                  </div>
                  <p className="text-sm line-clamp-2" style={{ color: '#7A6E68' }}>{d.message}</p>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: '#A89E98' }}>
                      <Mail className="w-3.5 h-3.5" />{d.email}
                    </span>
                    {d.telephone && (
                      <span className="flex items-center gap-1.5 text-xs" style={{ color: '#A89E98' }}>
                        <Phone className="w-3.5 h-3.5" />{d.telephone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs flex-shrink-0" style={{ color: '#A89E98' }}>
                  {new Date(d.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl shadow-2xl" style={{ background: 'white' }}>
            {/* Modal header */}
            <div className="flex items-start justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(45,41,38,0.08)' }}>
              <div>
                <h2 className="font-semibold text-lg" style={{ color: '#2D2926' }}>{selected.nom}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs" style={{ color: '#A89E98' }}>
                    {new Date(selected.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(45,41,38,0.06)', color: '#7A6E68' }}>
                    {TYPE_LABELS[selected.type] ?? selected.type}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ color: '#A89E98' }}>✕</button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Contact info */}
              <div className="flex flex-wrap gap-4">
                <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-sm" style={{ color: '#5B8C6B' }}>
                  <Mail className="w-4 h-4" />{selected.email}
                </a>
                {selected.telephone && (
                  <a href={`tel:${selected.telephone}`} className="flex items-center gap-2 text-sm" style={{ color: '#5B8C6B' }}>
                    <Phone className="w-4 h-4" />{selected.telephone}
                  </a>
                )}
              </div>

              {/* Message */}
              <div className="rounded-xl p-4" style={{ background: '#FAF8F5' }}>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4" style={{ color: '#A89E98' }} />
                  <span className="text-xs font-medium" style={{ color: '#A89E98' }}>Message</span>
                </div>
                <p className="text-sm whitespace-pre-wrap" style={{ color: '#2D2926' }}>{selected.message}</p>
              </div>

              {/* Statut */}
              <div>
                <p className="text-xs font-medium mb-3" style={{ color: '#7A6E68' }}>Changer le statut</p>
                <div className="grid grid-cols-2 gap-2">
                  {STATUTS.map(s => (
                    <button
                      key={s.value}
                      disabled={updating || selected.statut === s.value}
                      onClick={() => handleStatut(selected, s.value)}
                      className="py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={selected.statut === s.value
                        ? { background: s.bg, color: s.color, border: `1.5px solid ${s.color}`, opacity: 1 }
                        : { background: 'rgba(45,41,38,0.04)', color: '#7A6E68', border: '1px solid rgba(45,41,38,0.08)' }
                      }
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
