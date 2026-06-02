'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Message } from '@/lib/types'
import { Send, MessageSquare } from 'lucide-react'

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [proprietaireId, setProprietaireId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

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
      setProprietaireId(prop.id)

      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('proprietaire_id', prop.id)
        .order('created_at', { ascending: true })

      setMessages(data || [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !proprietaireId) return
    setSending(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('messages')
      .insert({
        proprietaire_id: proprietaireId,
        expediteur: 'proprietaire',
        contenu: newMessage.trim(),
        lu: false,
      })
      .select()
      .single()

    if (data) {
      setMessages(prev => [...prev, data])
    }
    setNewMessage('')
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        <p className="text-slate-400 mt-1">Échangez avec l'équipe ALD Immo</p>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col" style={{ height: 'calc(100vh - 260px)', minHeight: 400 }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-700">
          <div className="w-9 h-9 bg-sky-500/20 rounded-full flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="text-white font-medium">ALD Immo</div>
            <div className="text-slate-400 text-xs">Équipe conciergerie</div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="text-center text-slate-500">Chargement...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-slate-500 pt-12">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucun message. Commencez la conversation !</p>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.expediteur === 'proprietaire' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.expediteur === 'proprietaire'
                      ? 'bg-sky-500 text-white rounded-br-sm'
                      : 'bg-slate-700 text-slate-200 rounded-bl-sm'
                  }`}
                >
                  {msg.expediteur === 'ald' && (
                    <div className="text-xs font-semibold text-sky-400 mb-1">ALD Immo</div>
                  )}
                  <p>{msg.contenu}</p>
                  <div className={`text-xs mt-1.5 ${msg.expediteur === 'proprietaire' ? 'text-sky-100' : 'text-slate-500'}`}>
                    {new Date(msg.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-slate-700">
          <div className="flex gap-3">
            <textarea
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez votre message... (Entrée pour envoyer)"
              rows={2}
              className="flex-1 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={sending || !newMessage.trim()}
              className="bg-sky-500 hover:bg-sky-400 disabled:bg-slate-600 disabled:text-slate-400 text-white px-4 rounded-xl transition-colors flex items-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
