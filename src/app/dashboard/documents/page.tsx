'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Document, DocumentType } from '@/lib/types'
import { FileText, Download, BarChart2, FileCheck, Receipt } from 'lucide-react'

const TYPE_TABS: { label: string; value: string }[] = [
  { label: 'Tous', value: 'all' },
  { label: 'Bilans', value: 'bilan' },
  { label: 'Contrats', value: 'contrat' },
  { label: 'Factures', value: 'facture' },
]

const TYPE_ICON: Record<DocumentType, React.ElementType> = {
  bilan: BarChart2,
  contrat: FileCheck,
  facture: Receipt,
}

const TYPE_STYLE: Record<DocumentType, { color: string; bg: string; border: string }> = {
  bilan:   { color: '#3A5E46', bg: 'rgba(91,140,107,0.1)',  border: 'rgba(91,140,107,0.25)' },
  contrat: { color: '#0369a1', bg: 'rgba(14,165,233,0.08)', border: 'rgba(14,165,233,0.2)' },
  facture: { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)' },
}

const TYPE_LABEL: Record<DocumentType, string> = {
  bilan: 'Bilan',
  contrat: 'Contrat',
  facture: 'Facture',
}

const MOIS_LABELS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: prop } = await supabase
        .from('proprietaires')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!prop) { setLoading(false); return }

      const { data } = await supabase
        .from('documents')
        .select('*, biens(nom)')
        .eq('proprietaire_id', prop.id)
        .order('created_at', { ascending: false })

      setDocuments(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter === 'all' ? documents : documents.filter(d => d.type === filter)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#2D2926' }}>Documents</h1>
        <p className="mt-1" style={{ color: '#A89E98' }}>Vos bilans, contrats et factures</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl flex-wrap" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
        {TYPE_TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={filter === t.value
              ? { background: '#5B8C6B', color: 'white' }
              : { color: '#7A6E68' }
            }
          >
            {t.label}
            <span className="ml-1.5 text-xs opacity-60">
              ({t.value === 'all' ? documents.length : documents.filter(d => d.type === t.value).length})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
        {loading ? (
          <div className="p-12 text-center" style={{ color: '#A89E98' }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center" style={{ color: '#A89E98' }}>
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucun document</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Type</th>
                  <th>Bien</th>
                  <th>Période</th>
                  <th>Ajouté le</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(doc => {
                  const Icon = TYPE_ICON[doc.type] || FileText
                  const s = TYPE_STYLE[doc.type]
                  return (
                    <tr key={doc.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                            <Icon className="w-4 h-4" style={{ color: s.color }} />
                          </div>
                          <span className="font-medium" style={{ color: '#2D2926' }}>{doc.nom}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
                        >
                          {TYPE_LABEL[doc.type]}
                        </span>
                      </td>
                      <td>{(doc as any).biens?.nom ?? '—'}</td>
                      <td>
                        {doc.mois && doc.annee
                          ? `${MOIS_LABELS[doc.mois - 1]} ${doc.annee}`
                          : doc.annee ? String(doc.annee) : '—'}
                      </td>
                      <td>{new Date(doc.created_at).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          style={{ background: 'rgba(91,140,107,0.08)', color: '#3A5E46', border: '1px solid rgba(91,140,107,0.15)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,140,107,0.15)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(91,140,107,0.08)' }}
                        >
                          <Download className="w-3.5 h-3.5" />
                          Télécharger
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
