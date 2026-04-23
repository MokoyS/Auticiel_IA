'use client'

import { useAuth } from '../layout'
import { useEffect, useState } from 'react'
import type { Editorial } from '@/lib/kv'

export default function EditorialPage() {
  const { password } = useAuth()
  const headers = { 'Content-Type': 'application/json', 'x-admin-password': password }

  const [data, setData] = useState<Editorial | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/editorial', { headers })
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function save() {
    if (!data) return
    setSaving(true)
    await fetch('/api/admin/editorial', { method: 'PUT', headers, body: JSON.stringify(data) })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <div className="p-8 text-sm text-gray-400">Chargement…</div>
  if (!data) return <div className="p-8 text-sm text-red-500">Données non trouvées. Initialisez la base depuis le tableau de bord.</div>

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Ligne éditoriale</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ton, signature et règles utilisés par l'IA</p>
        </div>
        <button onClick={save} disabled={saving}
          className="px-4 py-2.5 text-sm text-white font-medium rounded-lg disabled:opacity-40"
          style={{ backgroundColor: saved ? '#16a34a' : '#0066CC' }}>
          {saving ? 'Enregistrement…' : saved ? '✓ Enregistré' : 'Enregistrer'}
        </button>
      </div>

      <div className="space-y-5">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Ton général</label>
          <textarea value={data.tone} onChange={e => setData(d => d && ({ ...d, tone: e.target.value }))}
            rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Signature standard</label>
          <textarea value={data.signature} onChange={e => setData(d => d && ({ ...d, signature: e.target.value }))}
            rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 font-mono" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Structure email (une étape par ligne)
          </label>
          <textarea
            value={data.structure.join('\n')}
            onChange={e => setData(d => d && ({ ...d, structure: e.target.value.split('\n') }))}
            rows={7} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Règles absolues — Ne jamais faire (une par ligne)
          </label>
          <textarea
            value={data.rules_never.join('\n')}
            onChange={e => setData(d => d && ({ ...d, rules_never: e.target.value.split('\n') }))}
            rows={10} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">FAQ technique rapide</label>
          <textarea value={data.faq_tech} onChange={e => setData(d => d && ({ ...d, faq_tech: e.target.value }))}
            rows={8} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" />
        </div>
      </div>
    </div>
  )
}
