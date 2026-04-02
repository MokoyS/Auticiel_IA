'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { TicketResult } from '@/app/api/process-tickets/route'

export default function ZendeskAgentPage() {
  const [count, setCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<TicketResult[] | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setResults(null)
    setGlobalError(null)

    try {
      const res = await fetch('/api/process-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      })
      const data = await res.json() as { results?: TicketResult[]; error?: string }
      if (!res.ok || data.error) {
        setGlobalError(data.error ?? `Erreur ${res.status}`)
      } else {
        setResults(data.results ?? [])
      }
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg overflow-hidden">
          <Image src="/auticiel_logo.jpeg" alt="Auticiel" width={32} height={32} />
        </div>
        <h1 className="text-lg font-semibold text-gray-900">Agent Email Zendesk</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Controls */}
        <div className="flex items-end gap-4">
          <div className="space-y-1">
            <label htmlFor="count" className="text-sm font-medium text-gray-700">
              Nombre de tickets
            </label>
            <input
              id="count"
              type="number"
              min={1}
              max={10}
              value={count}
              onChange={(e) => setCount(Math.min(10, Math.max(1, Number(e.target.value))))}
              disabled={loading}
              className="w-24 px-3 py-2.5 border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              style={{ borderRadius: '8px' }}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 text-sm text-white font-medium disabled:opacity-40"
            style={{ backgroundColor: '#0066CC', borderRadius: '8px' }}
          >
            Traiter les tickets
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            Traitement en cours...
          </div>
        )}

        {/* Global error */}
        {globalError && (
          <div className="px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {globalError}
          </div>
        )}

        {/* Results */}
        {results !== null && results.length === 0 && (
          <p className="text-sm text-gray-500">Aucun ticket à traiter.</p>
        )}

        {results !== null && results.length > 0 && (
          <div className="space-y-4">
            {results.map((r) => (
              <div key={r.ticketId} className="border border-gray-200 rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Ticket #{r.ticketId}</p>
                    <p className="text-sm font-medium text-gray-900">{r.subject}</p>
                  </div>
                  <span
                    className="shrink-0 text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: r.status === 'success' ? '#F0FDF4' : '#FEF2F2',
                      color: r.status === 'success' ? '#166534' : '#991B1B',
                    }}
                  >
                    {r.status === 'success' ? '✅ Envoyé' : '❌ Erreur'}
                  </span>
                </div>

                {r.status === 'success' && (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg px-4 py-3">
                    {r.reply}
                  </p>
                )}

                {r.status === 'error' && r.error && (
                  <p className="text-xs text-red-600">{r.error}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
