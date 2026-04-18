'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from './ThemeProvider'
import { useAuthStore } from '@/store/authStore'

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function AuthSection() {
  const router = useRouter()
  const { user, initialized, signOut } = useAuthStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Still loading — show placeholder to avoid layout shift
  if (!initialized) {
    return <div className="w-9 h-9 rounded-xl bg-muted animate-pulse" />
  }

  // Not logged in — show Accedi + Registrati
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="px-3.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition"
        >
          Accedi
        </Link>
        <Link
          href="/signup"
          className="px-3.5 py-1.5 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition"
        >
          Registrati
        </Link>
      </div>
    )
  }

  // Logged in — avatar with dropdown
  const initials = user.email?.slice(0, 2).toUpperCase() ?? 'U'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-9 h-9 rounded-xl bg-muted border border-border flex items-center justify-center text-sm font-semibold text-foreground hover:bg-muted/80 transition"
        aria-label="Menu utente"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-56 rounded-2xl border border-border bg-card shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-border mb-1">
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <button
            onClick={async () => {
              setOpen(false)
              await signOut()
              router.push('/login')
            }}
            className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted/60 transition"
          >
            Esci
          </button>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const { theme, toggle } = useTheme()
  const { initialize, initialized } = useAuthStore()

  useEffect(() => {
    if (!initialized) initialize()
  }, [initialize, initialized])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-card/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center shrink-0 shadow-sm">
            <svg viewBox="0 0 20 20" fill="none" className="w-4.5 h-4.5 text-background">
              <path d="M10 2L3 6v8l7 4 7-4V6L10 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M10 2v12M3 6l7 4 7-4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-lg tracking-tight">SourceAI</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border tracking-wide">
              BETA
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <p className="text-base text-muted-foreground hidden sm:block">
            AI Sourcing per seller online
          </p>
          <button
            onClick={toggle}
            aria-label="Cambia tema"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <AuthSection />
        </div>
      </div>
    </header>
  )
}
