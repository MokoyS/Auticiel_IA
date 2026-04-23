'use client'

import { useAuth } from '../layout'
import { useEffect, useState } from 'react'
import type { Product } from '@/lib/kv'

const EMPTY: Omit<Product, 'id'> = {
  name: '', code: '', category: '', price_ht: 0, price_ttc: 0,
  tva: 20, mdph_eligible: false, description: '', notes: '', priority: 'Secondaire',
}

const CATEGORIES = ['Pack AMIKEO', 'Licence AMIKEOAPPS', 'Service / Formation', 'Accessoire', 'Expédition']

export default function ProductsPage() {
  const { password } = useAuth()
  const headers = { 'Content-Type': 'application/json', 'x-admin-password': password }

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<Omit<Product, 'id'>>(EMPTY)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/products', { headers })
    if (res.ok) setProducts(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() { setForm(EMPTY); setEditing(null); setCreating(true) }
  function openEdit(p: Product) { setForm({ ...p }); setEditing(p); setCreating(false) }
  function cancel() { setEditing(null); setCreating(false) }

  async function save() {
    setSaving(true)
    const method = creating ? 'POST' : 'PUT'
    const body = creating
      ? { ...form, id: crypto.randomUUID() }
      : { ...form, id: editing!.id }
    await fetch('/api/admin/products', { method, headers, body: JSON.stringify(body) })
    await load(); cancel(); setSaving(false)
  }

  async function remove(id: string) {
    if (!confirm('Supprimer ce produit ?')) return
    await fetch('/api/admin/products', { method: 'DELETE', headers, body: JSON.stringify({ id }) })
    await load()
  }

  if (editing || creating) {
    return (
      <div className="p-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={cancel} className="text-sm text-gray-500 hover:text-gray-700">← Retour</button>
          <h1 className="text-lg font-semibold text-gray-900">{creating ? 'Nouveau produit' : 'Modifier le produit'}</h1>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nom *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Code Odoo *</label>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Catégorie</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 bg-white">
                <option value="">Sélectionner…</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Prix HT (€)</label>
              <input type="number" value={form.price_ht} onChange={e => setForm(f => ({ ...f, price_ht: +e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Prix TTC (€)</label>
              <input type="number" value={form.price_ttc} onChange={e => setForm(f => ({ ...f, price_ttc: +e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">TVA (%)</label>
              <input type="number" value={form.tva} onChange={e => setForm(f => ({ ...f, tva: +e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Priorité devis</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 bg-white">
                <option>Coeur métier</option>
                <option>Secondaire</option>
                <option>Rare</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="mdph" checked={form.mdph_eligible}
                onChange={e => setForm(f => ({ ...f, mdph_eligible: e.target.checked }))} className="w-4 h-4" />
              <label htmlFor="mdph" className="text-sm text-gray-600">Finançable MDPH</label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description courte</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Notes internes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={saving || !form.name || !form.code}
              className="px-5 py-2.5 text-sm text-white font-medium rounded-lg disabled:opacity-40"
              style={{ backgroundColor: '#0066CC' }}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button onClick={cancel} className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
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
          <h1 className="text-xl font-semibold text-gray-900">Catalogue produits</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} produit{products.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew} className="px-4 py-2.5 text-sm text-white font-medium rounded-lg" style={{ backgroundColor: '#0066CC' }}>
          + Nouveau produit
        </button>
      </div>
      {loading ? <p className="text-sm text-gray-400">Chargement…</p> : (
        <div className="space-y-2">
          {products.map(p => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  {p.mdph_eligible && (
                    <span className="shrink-0 text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full">MDPH</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-xs text-gray-400 font-mono">{p.code}</p>
                  <p className="text-xs text-gray-500 font-medium">{p.price_ht} € HT / {p.price_ttc} € TTC</p>
                </div>
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
