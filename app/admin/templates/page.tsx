'use client'

import { useAuth } from '../layout'
import { useEffect, useState } from 'react'
import type { Template } from '@/lib/kv'

const EMPTY: Omit<Template, 'id'> = {
  title: '',
  category: '',
  keywords: [],
  client_type: 'Les deux',
  frequency: 'Fréquent',
  action_required: false,
  template: '',
  notes: '',
}

const CATEGORIES = [
  'MDPH / Financement', 'Facture / Paiement', 'Suivi commande', 'Info produit',
  'Devis', 'Renouvellement abonnement', 'SAV / Assistance technique', 'Autre',
]

export default function TemplatesPage() {
  const { password } = useAuth()
  const headers = { 'Content-Type': 'application/json', 'x-admin-password': password }

  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Template | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<Omit<Template, 'id'>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/templates', { headers })
    if (res.ok) setTemplates(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setForm(EMPTY)
    setEditing(null)
    setCreating(true)
  }

  function openEdit(t: Template) {
    setForm({ ...t })
    setEditing(t)
    setCreating(false)
  }

  function cancel() {
    setEditing(null)
    setCreating(false)
  }

  async function save() {
    setSaving(true)
    if (creating) {
      await fetch('/api/admin/templates', {
        method: 'POST', headers,
        body: JSON.stringify({ ...form, id: crypto.randomUUID() }),
      })
    } else if (editing) {
      await fetch('/api/admin/templates', {
        method: 'PUT', headers,
        body: JSON.stringify({ ...form, id: editing.id }),
      })
    }
    await load()
    cancel()
    setSaving(false)
  }

  async function remove(id: string) {
    if (!confirm('Supprimer ce template ?')) return
    await fetch('/api/admin/templates', { method: 'DELETE', headers, body: JSON.stringify({ id }) })
    await load()
  }

  const filtered = templates.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  )

  if (editing || creating) {
    return (
      <div className="p-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={cancel} className="text-sm text-gray-500 hover:text-gray-700">← Retour</button>
          <h1 className="text-lg font-semibold text-gray-900">
            {creating ? 'Nouveau template' : 'Modifier le template'}
          </h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Titre *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
              placeholder="Ex : Demande de devis MDPH"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Catégorie *</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 bg-white"
              >
                <option value="">Sélectionner…</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Type client</label>
              <select
                value={form.client_type}
                onChange={e => setForm(f => ({ ...f, client_type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 bg-white"
              >
                <option>B2C</option>
                <option>B2B</option>
                <option>Les deux</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fréquence</label>
              <select
                value={form.frequency}
                onChange={e => setForm(f => ({ ...f, frequency: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 bg-white"
              >
                <option>Très fréquent</option>
                <option>Fréquent</option>
                <option>Occasionnel</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="action"
                checked={form.action_required}
                onChange={e => setForm(f => ({ ...f, action_required: e.target.checked }))}
                className="w-4 h-4"
              />
              <label htmlFor="action" className="text-sm text-gray-600">Action requise</label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Mots-clés (séparés par des virgules)
            </label>
            <input
              value={form.keywords.join(', ')}
              onChange={e => setForm(f => ({
                ...f,
                keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean),
              }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
              placeholder="Ex : mdph, devis, financement, pch"
            />
            <p className="text-xs text-gray-400 mt-1">
              Ces mots-clés permettent à l'IA de sélectionner ce template automatiquement.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Corps du mail type *</label>
            <textarea
              value={form.template}
              onChange={e => setForm(f => ({ ...f, template: e.target.value }))}
              rows={10}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 font-mono"
              placeholder="Bonjour [Prénom],&#10;&#10;Merci pour votre message…"
            />
            <p className="text-xs text-gray-400 mt-1">
              Utilisez [Prénom], [nom bénéficiaire], [référence] comme variables.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Notes internes (pour l'IA)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400"
              placeholder="Règles spécifiques à ce type de demande, ce que l'IA doit savoir…"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={save}
              disabled={saving || !form.title || !form.category || !form.template}
              className="px-5 py-2.5 text-sm text-white font-medium rounded-lg disabled:opacity-40"
              style={{ backgroundColor: '#0066CC' }}
            >
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button
              onClick={cancel}
              className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Réponses type</h1>
          <p className="text-sm text-gray-500 mt-0.5">{templates.length} template{templates.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openNew}
          className="px-4 py-2.5 text-sm text-white font-medium rounded-lg"
          style={{ backgroundColor: '#0066CC' }}
        >
          + Nouveau template
        </button>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Rechercher par titre ou catégorie…"
        className="w-full max-w-sm px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none mb-5 focus:border-blue-400"
      />

      {loading ? (
        <p className="text-sm text-gray-400">Chargement…</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                  <span className="shrink-0 text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                    {t.client_type}
                  </span>
                  <span className="shrink-0 text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                    {t.frequency}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{t.category}</p>
                {t.keywords.length > 0 && (
                  <p className="text-xs text-gray-300 mt-1">
                    {t.keywords.slice(0, 5).join(' · ')}
                  </p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => openEdit(t)}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Modifier
                </button>
                <button
                  onClick={() => remove(t.id)}
                  className="px-3 py-1.5 text-xs border border-red-200 rounded-lg text-red-500 hover:bg-red-50"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 py-4">Aucun résultat.</p>
          )}
        </div>
      )}
    </div>
  )
}
