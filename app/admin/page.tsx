'use client'

import { useAuth } from './layout'
import { useState } from 'react'
import Link from 'next/link'

const SECTIONS = [
  {
    href: '/admin/templates',
    label: 'Réponses type',
    description: 'Emails types par catégorie avec mots-clés de déclenchement',
    icon: '✉',
    color: 'bg-blue-50 text-blue-700',
  },
  {
    href: '/admin/products',
    label: 'Catalogue produits',
    description: 'Prix, codes Odoo, éligibilité MDPH, notes internes',
    icon: '📦',
    color: 'bg-green-50 text-green-700',
  },
  {
    href: '/admin/processes',
    label: 'Process internes',
    description: 'MDPH, SAV, commandes, paiements — étapes exactes',
    icon: '⚙',
    color: 'bg-orange-50 text-orange-700',
  },
  {
    href: '/admin/editorial',
    label: 'Ligne éditoriale',
    description: 'Ton, signature, règles absolues, FAQ technique rapide',
    icon: '✏',
    color: 'bg-purple-50 text-purple-700',
  },
]

export default function AdminDashboard() {
  const { password } = useAuth()
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')

  async function handleSeed() {
    if (!confirm('Réinitialiser la base avec les données par défaut ? Les modifications existantes seront écrasées.')) return
    setSeeding(true)
    setSeedMsg('')
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      setSeedMsg(res.ok ? '✓ Base initialisée avec succès.' : `Erreur : ${data.error}`)
    } catch {
      setSeedMsg('Erreur réseau.')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Tableau de bord</h1>
      <p className="text-sm text-gray-500 mb-8">
        Gérez la base de connaissance utilisée par l'IA pour répondre aux tickets Zendesk.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-10">
        {SECTIONS.map(s => (
          <Link
            key={s.href}
            href={s.href}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-xl mb-3 ${s.color}`}>
              {s.icon}
            </div>
            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 mb-1">{s.label}</p>
            <p className="text-xs text-gray-500">{s.description}</p>
          </Link>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <p className="text-sm font-medium text-gray-700 mb-2">Initialisation</p>
        <p className="text-xs text-gray-500 mb-3">
          À faire une seule fois au premier déploiement pour charger les données dans Vercel KV.
        </p>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {seeding ? 'Initialisation…' : 'Initialiser la base de données'}
        </button>
        {seedMsg && (
          <p className={`mt-2 text-xs ${seedMsg.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
            {seedMsg}
          </p>
        )}
      </div>
    </div>
  )
}
