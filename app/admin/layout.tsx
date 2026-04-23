'use client'

import { useState, createContext, useContext, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const AuthContext = createContext<{ password: string; logout: () => void }>({
  password: '',
  logout: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

const NAV = [
  { href: '/admin', label: 'Tableau de bord', icon: '⊞' },
  { href: '/admin/templates', label: 'Réponses type', icon: '✉' },
  { href: '/admin/products', label: 'Produits', icon: '📦' },
  { href: '/admin/processes', label: 'Process', icon: '⚙' },
  { href: '/admin/editorial', label: 'Ligne éditoriale', icon: '✏' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState('')
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_pw')
    if (saved) setPassword(saved)
  }, [])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (input.length > 0) {
      sessionStorage.setItem('admin_pw', input)
      setPassword(input)
      setError(false)
    }
  }

  function logout() {
    sessionStorage.removeItem('admin_pw')
    setPassword('')
    setInput('')
  }

  if (!password) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm p-8 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900 mb-1">Auticiel — Base de connaissance</h1>
          <p className="text-sm text-gray-500 mb-6">Accès réservé à l'équipe Auticiel</p>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              value={input}
              onChange={e => { setInput(e.target.value); setError(false) }}
              placeholder="Mot de passe"
              autoFocus
              className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none ${
                error ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {error && <p className="text-red-500 text-xs">Mot de passe incorrect</p>}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: '#0066CC' }}
            >
              Accéder
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ password, logout }}>
      <div className="min-h-screen flex bg-gray-50">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
          <div className="px-5 py-5 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Auticiel IA</p>
            <p className="text-xs text-gray-400 mt-0.5">Base de connaissance</p>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {NAV.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="px-3 py-4 border-t border-gray-100">
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthContext.Provider>
  )
}
