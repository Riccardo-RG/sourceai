'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { createClient } from '@/lib/supabase'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signInWithGoogle, loading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const { error } = await signIn(email, password)
    if (error) {
      setError(error)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-foreground flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-background">
              <path d="M10 2L3 6v8l7 4 7-4V6L10 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M10 2v12M3 6l7 4 7-4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Accedi a SourceAI</h1>
            <p className="text-sm text-muted-foreground mt-1">Bentornato</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-7 shadow-card space-y-5">

          {/* Google */}
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted/60 transition text-sm font-medium"
          >
            <GoogleIcon />
            Continua con Google
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">oppure</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition"
                placeholder="tu@esempio.com"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground" htmlFor="password">Password</label>
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) { setError('Inserisci prima la tua email'); return }
                    const sb = createClient()
                    await sb.auth.resetPasswordForEmail(email, {
                      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
                    })
                    setResetSent(true)
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition"
                >
                  Password dimenticata?
                </button>
              </div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
            {resetSent && <p className="text-sm text-green-600 dark:text-green-400">Email inviata! Controlla la tua casella.</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? 'Accesso…' : 'Accedi'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Non hai un account?{' '}
          <Link href="/signup" className="font-semibold text-foreground hover:underline">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  )
}
