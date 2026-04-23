'use client'

import { useAuth } from '../layout'
import { useEffect, useState } from 'react'
import type { Process } from '@/lib/kv'

const EMPTY: Omit<Process, 'id'> = { title: '', trigger: '', steps: [], notes: '' }

export default function ProcessesPage() {
  const { password } = useAuth()
  const headers = { 'Content-Type': 'application/json', 'x-admin-password': password }

  const [processes, setProcesses] = useState<Process[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Process | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<Omit<Process, 'id'>>(EMPTY)
  const [stepsText, setStepsText] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/processes', { headers })
    if (res.ok) setProcesses(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() { setForm(EMPTY); setStepsText(''); setEditing(null); setCreating(true) }
  function openEdit(p: Process) {
    setForm({ ...p })
    setStepsText(p.steps.join('\n'))
    setEditing(p); setCreating(false)
  }
  function cancel() { setEditing(null); setCreating(false) }

  async function save() {
    setSaving(true)
    const steps = stepsText.split('\n').map(s => s.trim()).filter(Boolean)
    const method = creating ? 'POST' : 'PUT'
    const body = creating
      ? { ...form, steps, id: crypto.randomUUID() }
      : { ...form, steps, id: editing!.id }
    await fetch('/api/admin/processes', { method, headers, body: JSON.stringify(body) })
    await load(); cancel(); setSaving(false)
  }

  async function remove(id: string) {
    if (!confirm('Supprimer ce process ?')) return
    await fetch('/api/admin/processes', { method: 'DELETE', headers, body: JSON.stringify({ id }) })
    await load()
  }

  if (editing || creating) {
    return (
      <div className="p-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={cancel} className="text-sm text-gray-500 hover:text-gray-700">← Retour</button>
          <h1 className="text-lg font-semibold text-gray-900">{creating ? 'Nouveau process' : 'Modifier le process'}</h1>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Titre *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
              placeholder="Ex : Traitement d'un devis MDPH" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Déclencheur</label>
            <input value={form.trigger} onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
              placeholder="Ex : Email Zendesk 'Assigné à Demande de devis MDPH'" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Étapes (une par ligne)
            </label>
            <textarea value={stepsText} onChange={e => setStepsText(e.target.value)} rows={8}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 font-mono"
              placeholder="Ouvrir le ticket Zendesk&#10;Cliquer 'Voir la piste' dans Odoo&#10;…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Notes internes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={saving || !form.title}
              className="px-5 py-2.5 text-sm text-white font-medium rounded-lg disabled:opacity-40" style={{ backgroundColor: '#0066CC' }}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button onClick={cancel} className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Annuler</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Process internes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{processes.length} process</p>
        </div>
        <button onClick={openNew} className="px-4 py-2.5 text-sm text-white font-medium rounded-lg" style={{ backgroundColor: '#0066CC' }}>
          + Nouveau process
        </button>
      </div>
      {loading ? <p className="text-sm text-gray-400">Chargement…</p> : (
        <div className="space-y-3">
          {processes.map(p => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{p.title}</p>
                {p.trigger && <p className="text-xs text-gray-400 mt-0.5">Déclencheur : {p.trigger}</p>}
                <p className="text-xs text-gray-300 mt-1">{p.steps.length} étape{p.steps.length > 1 ? 's' : ''}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(p)} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Modifier</button>
                <button onClick={() => remove(p.id)} className="px-3 py-1.5 text-xs border border-red-200 rounded-lg text-red-500 hover:bg-red-50">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
