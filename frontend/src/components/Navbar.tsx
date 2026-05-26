'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from './ThemeProvider'
import { useAuthStore } from '@/store/authStore'
import { useLangStore } from '@/store/langStore'
import { useT } from '@/hooks/useT'
import type { Lang } from '@/lib/translations'

const LANG_OPTIONS: { code: Lang; flag: string; label: string }[] = [
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'it', flag: '🇮🇹', label: 'IT' },
  { code: 'es', flag: '🇪🇸', label: 'ES' },
]

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

function LangSwitcher() {
  const { lang, setLang } = useLangStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = LANG_OPTIONS.find((o) => o.code === lang)!

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-8 px-2 flex items-center gap-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-28 rounded-md border border-border bg-popover shadow-md py-1 z-50">
          {LANG_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              onClick={() => { setLang(opt.code); setOpen(false) }}
              className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-muted transition-colors
                ${lang === opt.code ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
            >
              <span>{opt.flag}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function AuthSection() {
  const router = useRouter()
  const { user, initialized, signOut } = useAuthStore()
  const t = useT()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!initialized) {
    return <div className="w-8 h-8 rounded-md bg-muted animate-pulse" />
  }

  if (!user) {
    return (
      <div className="flex items-center gap-1">
        <Link
          href="/login"
          className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {t.nav_login}
        </Link>
        <Link
          href="/signup"
          className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          {t.nav_signup}
        </Link>
      </div>
    )
  }

  const initials = user.email?.slice(0, 2).toUpperCase() ?? 'U'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-md bg-muted border border-border flex items-center justify-center text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors"
        aria-label="User menu"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-52 rounded-md border border-border bg-popover shadow-md py-1.5 z-50">
          <div className="px-3 py-1.5 border-b border-border mb-1">
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <button
            onClick={async () => {
              setOpen(false)
              await signOut()
              router.push('/login')
            }}
            className="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
          >
            {t.nav_logout}
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
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 shrink-0 text-primary">
            <path d="M10 2L3 6v8l7 4 7-4V6L10 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M10 2v12M3 6l7 4 7-4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
          <span className="font-semibold text-sm tracking-tight text-foreground">SourceAI</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary tracking-wider">
            BETA
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <LangSwitcher />
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <AuthSection />
        </div>
      </div>
    </header>
  )
}
