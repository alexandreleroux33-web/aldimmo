'use client'

import { useEffect, useState, useRef } from 'react'
import { Message, Proprietaire } from '@/lib/types'
import { adminSelect, adminInsert } from '@/lib/actions/admin'
import { MessageSquare, Send, Search, Check, CheckCheck } from 'lucide-react'

type Thread = {
  proprietaire: Proprietaire
  messages: Message[]
  unread: number
  lastMessage: Message
}

export default function AdminMessagesPage() {
  const [threads, setThreads]       = useState<Thread[]>([])
  const [selected, setSelected]     = useState<Thread | null>(null)
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [reply, setReply]           = useState('')
  const [sending, setSending]       = useState(false)
  const bottomRef                   = useRef<HTMLDivElement>(null)

  const load = async () => {
    const [messages, proprietaires] = await Promise.all([
      adminSelect<Message>('messages', { order: 'created_at', orderAsc: true }),
      adminSelect<Proprietaire>('proprietaires'),
    ])

    // Group messages by proprietaire_id
    const map = new Map<string, Message[]>()
    for (const m of messages) {
      if (!map.has(m.proprietaire_id)) map.set(m.proprietaire_id, [])
      map.get(m.proprietaire_id)!.push(m)
    }

    const built: Thread[] = []
    for (const [pid, msgs] of map) {
      const prop = proprietaires.find(p => p.id === pid)
      if (!prop) continue
      const unread = msgs.filter(m => !m.lu && m.expediteur === 'proprietaire').length
      built.push({ proprietaire: prop, messages: msgs, unread, lastMessage: msgs[msgs.length - 1] })
    }

    // Sort: unread first, then by last message date
    built.sort((a, b) => {
      if (b.unread !== a.unread) return b.unread - a.unread
      return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    })

    setThreads(built)

    // Keep selected thread in sync
    setSelected(prev => {
      if (!prev) return null
      return built.find(t => t.proprietaire.id === prev.proprietaire.id) ?? null
    })

    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selected?.messages.length])

  const openThread = async (thread: Thread) => {
    setSelected(thread)
    setReply('')

    // Mark unread proprietaire messages as read
    const unreadIds = thread.messages.filter(m => !m.lu && m.expediteur === 'proprietaire').map(m => m.id)
    if (unreadIds.length === 0) return

    await Promise.all(
      unreadIds.map(id =>
        fetch('/api/admin/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operation: 'update', table: 'messages', id, data: { lu: true } }),
        })
      )
    )

    setThreads(prev => prev.map(t =>
      t.proprietaire.id === thread.proprietaire.id
        ? { ...t, unread: 0, messages: t.messages.map(m => ({ ...m, lu: true })) }
        : t
    ))
    setSelected(prev => prev ? { ...prev, unread: 0, messages: prev.messages.map(m => ({ ...m, lu: true })) } : null)
  }

  const handleSend = async () => {
    if (!reply.trim() || !selected) return
    setSending(true)
    try {
      await adminInsert('messages', {
        proprietaire_id: selected.proprietaire.id,
        expediteur: 'ald',
        contenu: reply.trim(),
        lu: false,
      })
      setReply('')
      await load()

      // Fire-and-forget notifications (email + SMS)
      fetch('/api/admin/notify-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proprietaire_prenom: selected.proprietaire.prenom,
          proprietaire_email: selected.proprietaire.email,
          proprietaire_telephone: selected.proprietaire.telephone ?? null,
        }),
      }).catch(() => {})
    } finally {
      setSending(false)
    }
  }

  const filtered = threads.filter(t => {
    const q = search.toLowerCase()
    return !q || `${t.proprietaire.prenom} ${t.proprietaire.nom} ${t.proprietaire.email}`.toLowerCase().includes(q)
  })

  const totalUnread = threads.reduce((s, t) => s + t.unread, 0)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#2D2926' }}>Messages</h1>
        <p className="mt-1" style={{ color: '#A89E98' }}>
          {totalUnread > 0 ? `${totalUnread} message${totalUnread > 1 ? 's' : ''} non lu${totalUnread > 1 ? 's' : ''}` : 'Toutes les conversations'}
        </p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[500px]">

        {/* Thread list */}
        <div className="w-72 flex-shrink-0 flex flex-col rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
          {/* Search */}
          <div className="p-3" style={{ borderBottom: '1px solid rgba(45,41,38,0.06)' }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#A89E98' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none"
                style={{ background: '#FAF8F5', border: '1px solid rgba(45,41,38,0.08)', color: '#2D2926' }}
              />
            </div>
          </div>

          {/* Threads */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-sm" style={{ color: '#A89E98' }}>Chargement...</div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center text-sm" style={{ color: '#A89E98' }}>Aucune conversation</div>
            ) : (
              filtered.map(t => {
                const active = selected?.proprietaire.id === t.proprietaire.id
                return (
                  <button
                    key={t.proprietaire.id}
                    onClick={() => openThread(t)}
                    className="w-full text-left px-4 py-3.5 transition-all"
                    style={{
                      background: active ? 'rgba(91,140,107,0.08)' : 'transparent',
                      borderBottom: '1px solid rgba(45,41,38,0.05)',
                      borderLeft: active ? '3px solid #5B8C6B' : '3px solid transparent',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold truncate" style={{ color: t.unread > 0 ? '#2D2926' : '#7A6E68' }}>
                        {t.proprietaire.prenom} {t.proprietaire.nom}
                      </span>
                      {t.unread > 0 && (
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0" style={{ background: '#5B8C6B', color: 'white' }}>
                          {t.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs truncate" style={{ color: '#A89E98' }}>
                      {t.lastMessage.expediteur === 'ald' && <span style={{ color: '#5B8C6B' }}>Vous : </span>}
                      {t.lastMessage.contenu}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#C8B89A' }}>
                      {new Date(t.lastMessage.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)' }}>
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ color: '#A89E98' }}>
              <MessageSquare className="w-12 h-12 opacity-20" />
              <p className="text-sm">Sélectionnez une conversation</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid rgba(45,41,38,0.08)' }}>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: '#5B8C6B' }}
                >
                  {selected.proprietaire.prenom[0]}{selected.proprietaire.nom[0]}
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: '#2D2926' }}>
                    {selected.proprietaire.prenom} {selected.proprietaire.nom}
                  </div>
                  <div className="text-xs" style={{ color: '#A89E98' }}>{selected.proprietaire.email}</div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {selected.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.expediteur === 'ald' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className="max-w-sm xl:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed"
                      style={msg.expediteur === 'ald'
                        ? { background: '#5B8C6B', color: 'white', borderBottomRightRadius: 4 }
                        : { background: '#FAF8F5', color: '#2D2926', border: '1px solid rgba(45,41,38,0.08)', borderBottomLeftRadius: 4 }
                      }
                    >
                      {msg.expediteur === 'proprietaire' && (
                        <div className="text-xs font-semibold mb-1" style={{ color: '#5B8C6B' }}>
                          {selected.proprietaire.prenom}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.contenu}</p>
                      <div className="flex items-center justify-end gap-1 mt-1.5">
                        <span className="text-xs" style={{ color: msg.expediteur === 'ald' ? 'rgba(255,255,255,0.6)' : '#A89E98' }}>
                          {new Date(msg.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.expediteur === 'ald' && (
                          msg.lu
                            ? <CheckCheck className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.7)' }} />
                            : <Check className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Reply */}
              <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(45,41,38,0.08)' }}>
                <div className="flex gap-2">
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    placeholder="Répondre... (Entrée pour envoyer)"
                    rows={2}
                    className="flex-1 rounded-xl px-4 py-3 resize-none text-sm focus:outline-none"
                    style={{ background: '#FAF8F5', border: '1px solid rgba(45,41,38,0.1)', color: '#2D2926' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !reply.trim()}
                    className="px-4 rounded-xl flex items-center justify-center"
                    style={{ background: sending || !reply.trim() ? 'rgba(45,41,38,0.06)' : '#5B8C6B', color: sending || !reply.trim() ? '#A89E98' : 'white' }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
