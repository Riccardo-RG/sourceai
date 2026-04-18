'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) { setError('Le password non coincidono'); return }
    if (password.length < 6) { setError('Minimo 6 caratteri'); return }
    setLoading(true)
    const sb = createClient()
    const { error } = await sb.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    setDone(true)
    setTimeout(() => router.push('/'), 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Nuova password</h1>
          <p className="text-sm text-muted-foreground mt-1">Scegli una password sicura</p>
        </div>

        {done ? (
          <div className="bg-card border border-border rounded-2xl p-7 text-center space-y-2">
            <p className="text-sm font-semibold text-green-600 dark:text-green-400">Password aggiornata!</p>
            <p className="text-sm text-muted-foreground">Reindirizzamento in corso…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-7 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="pw">Nuova password</label>
              <input
                id="pw" type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition"
                placeholder="min. 6 caratteri"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="confirm">Conferma</label>
              <input
                id="confirm" type="password" required value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? 'Salvataggio…' : 'Aggiorna password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
