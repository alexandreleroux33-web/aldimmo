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
        <h1 className="text-2xl font-bold" style={{ color: '#2D2926' }}>Messages</h1>
        <p className="mt-1" style={{ color: '#A89E98' }}>Échangez avec l'équipe ALD Immo</p>
      </div>

      <div
        className="rounded-2xl flex flex-col"
        style={{ background: 'white', border: '1px solid rgba(45,41,38,0.08)', height: 'calc(100vh - 260px)', minHeight: 400 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid rgba(45,41,38,0.08)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(91,140,107,0.1)' }}>
            <MessageSquare className="w-4 h-4" style={{ color: '#5B8C6B' }} />
          </div>
          <div>
            <div className="font-medium" style={{ color: '#2D2926' }}>ALD Immo</div>
            <div className="text-xs" style={{ color: '#A89E98' }}>Équipe conciergerie</div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="text-center" style={{ color: '#A89E98' }}>Chargement...</div>
          ) : messages.length === 0 ? (
            <div className="text-center pt-12" style={{ color: '#A89E98' }}>
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
                  className="max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={msg.expediteur === 'proprietaire'
                    ? { background: '#5B8C6B', color: 'white', borderBottomRightRadius: 4 }
                    : { background: '#FAF8F5', color: '#2D2926', border: '1px solid rgba(45,41,38,0.08)', borderBottomLeftRadius: 4 }
                  }
                >
                  {msg.expediteur === 'ald' && (
                    <div className="text-xs font-semibold mb-1" style={{ color: '#5B8C6B' }}>ALD Immo</div>
                  )}
                  <p>{msg.contenu}</p>
                  <div className="text-xs mt-1.5" style={{ color: msg.expediteur === 'proprietaire' ? 'rgba(255,255,255,0.6)' : '#A89E98' }}>
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
        <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(45,41,38,0.08)' }}>
          <div className="flex gap-3">
            <textarea
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez votre message... (Entrée pour envoyer)"
              rows={2}
              className="flex-1 rounded-xl px-4 py-3 resize-none text-sm focus:outline-none"
              style={{
                background: '#FAF8F5',
                border: '1px solid rgba(45,41,38,0.12)',
                color: '#2D2926',
              }}
            />
            <button
              onClick={handleSend}
              disabled={sending || !newMessage.trim()}
              className="px-4 rounded-xl transition-colors flex items-center"
              style={{
                background: sending || !newMessage.trim() ? 'rgba(45,41,38,0.06)' : '#5B8C6B',
                color: sending || !newMessage.trim() ? '#A89E98' : 'white',
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
