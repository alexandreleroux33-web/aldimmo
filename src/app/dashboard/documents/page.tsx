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

const TYPE_COLOR: Record<DocumentType, string> = {
  bilan: 'text-emerald-400 bg-emerald-400/10',
  contrat: 'text-emerald-400 bg-emerald-400/10',
  facture: 'text-violet-400 bg-violet-400/10',
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
        <h1 className="text-2xl font-bold text-white">Documents</h1>
        <p className="text-stone-400 mt-1">Vos bilans, contrats et factures</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-800 p-1 rounded-xl border border-stone-700 flex-wrap">
        {TYPE_TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === t.value ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-white'
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-xs opacity-70">
              ({t.value === 'all' ? documents.length : documents.filter(d => d.type === t.value).length})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-stone-800 rounded-xl border border-stone-700">
        {loading ? (
          <div className="p-12 text-center text-stone-500">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
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
                  return (
                    <tr key={doc.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${TYPE_COLOR[doc.type]}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-white">{doc.nom}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          doc.type === 'bilan' ? 'bg-emerald-600/10 text-emerald-400 border-emerald-600/20' :
                          doc.type === 'contrat' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-violet-500/10 text-violet-400 border-violet-500/20'
                        }`}>
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
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
