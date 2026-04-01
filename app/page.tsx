'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  filesUsed?: string[]
}

const SUGGESTIONS = [
  'Comment traiter un devis MDPH ?',
  'Rédige une réponse pour une tablette cassée sous garantie',
  'Quel est le prix du Pack Mobilité ?',
  'Comment se connecter au cloud Auticiel ?',
]

export default function ChatPage() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [authError, setAuthError] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function handleLogin(e: FormEvent) {
    e.preventDefault()
    if (password === process.env.NEXT_PUBLIC_APP_PASSWORD) {
      setAuthenticated(true)
    } else {
      setAuthError(true)
    }
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json() as { message?: string; filesUsed?: string[]; error?: string }
      if (data.error) throw new Error(data.error)
      setMessages([...newMessages, {
        role: 'assistant',
        content: data.message ?? '',
        filesUsed: data.filesUsed,
      }])
    } catch (err) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: `❌ Erreur : ${err instanceof Error ? err.message : 'Erreur inconnue'}`,
      }])
    } finally {
      setLoading(false)
    }
  }

  async function handleSync() {
    setSyncStatus('loading')
    try {
      const res = await fetch('/api/sync-notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: process.env.NEXT_PUBLIC_APP_PASSWORD }),
      })
      const data = await res.json() as { success?: boolean; error?: string }
      setSyncStatus(data.success ? 'ok' : 'error')
    } catch {
      setSyncStatus('error')
    }
    setTimeout(() => setSyncStatus('idle'), 3000)
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <form onSubmit={handleLogin} className="w-full max-w-sm p-8 border border-gray-200 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: '#0066CC' }}
            >
              A
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Assistant Auticiel</h1>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setAuthError(false) }}
            placeholder="Mot de passe"
            className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none mb-3 ${
              authError ? 'border-red-400' : 'border-gray-300'
            }`}
            autoFocus
          />
          {authError && <p className="text-red-500 text-xs mb-3">Mot de passe incorrect</p>}
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: '#0066CC' }}
          >
            Accéder
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: '#0066CC' }}
          >
            A
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Assistant Auticiel</h1>
        </div>
        <button
          onClick={handleSync}
          disabled={syncStatus === 'loading'}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          {syncStatus === 'loading' && (
            <span className="inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          )}
          {syncStatus === 'ok' && '✓ '}
          {syncStatus === 'error' && '✗ '}
          Sync Notion
        </button>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 text-center mb-6">Suggestions</p>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="w-full text-left text-sm px-4 py-3 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-gray-700"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[80%]">
                <div
                  className="px-4 py-3 text-sm whitespace-pre-wrap"
                  style={{
                    borderRadius: '12px',
                    backgroundColor: msg.role === 'user' ? '#0066CC' : '#F0F4F8',
                    color: msg.role === 'user' ? '#FFFFFF' : '#1A1A1A',
                  }}
                >
                  {msg.content}
                </div>
                {msg.filesUsed && msg.filesUsed.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {msg.filesUsed.map((f) => (
                      <span key={f} className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 text-sm" style={{ backgroundColor: '#F0F4F8', borderRadius: '12px' }}>
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="px-4 pb-6 pt-2 border-t border-gray-100">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
          className="max-w-2xl mx-auto flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question…"
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-200 text-sm outline-none disabled:opacity-50"
            style={{ borderRadius: '8px' }}
            autoFocus
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-3 text-sm text-white font-medium disabled:opacity-40"
            style={{ backgroundColor: '#0066CC', borderRadius: '8px' }}
          >
            Envoyer
          </button>
        </form>
      </footer>
    </div>
  )
}
