'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { useT } from '@/hooks/useT'

const MARKETS = [
  { code: 'US', flag: '🇺🇸', label: 'USA' },
  { code: 'GB', flag: '🇬🇧', label: 'UK' },
  { code: 'DE', flag: '🇩🇪', label: 'Germany' },
  { code: 'FR', flag: '🇫🇷', label: 'France' },
  { code: 'IT', flag: '🇮🇹', label: 'Italy' },
  { code: 'ES', flag: '🇪🇸', label: 'Spain' },
  { code: 'JP', flag: '🇯🇵', label: 'Japan' },
  { code: 'AU', flag: '🇦🇺', label: 'Australia' },
  { code: 'CA', flag: '🇨🇦', label: 'Canada' },
  { code: 'BR', flag: '🇧🇷', label: 'Brazil' },
  { code: 'MX', flag: '🇲🇽', label: 'Mexico' },
  { code: 'NL', flag: '🇳🇱', label: 'Netherlands' },
  { code: 'SE', flag: '🇸🇪', label: 'Sweden' },
  { code: 'PL', flag: '🇵🇱', label: 'Poland' },
  { code: 'IN', flag: '🇮🇳', label: 'India' },
  { code: 'AE', flag: '🇦🇪', label: 'UAE' },
  { code: 'TR', flag: '🇹🇷', label: 'Turkey' },
]

interface ProductInputProps {
  onSearch: (query: string, category?: string, market?: string) => void
  isLoading: boolean
}

export default function ProductInput({ onSearch, isLoading }: ProductInputProps) {
  const t = useT()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | undefined>()
  const [market, setMarket] = useState('US')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && !isLoading) onSearch(query.trim(), category, market)
  }

  const selectedMarket = MARKETS.find((m) => m.code === market) ?? MARKETS[0]

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-2">
          {/* Market selector */}
          <div className="relative shrink-0">
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              disabled={isLoading}
              className="h-14 pl-3 pr-8 text-base rounded-xl border border-border bg-background
                shadow-card focus:outline-none focus:ring-2 focus:ring-foreground/12
                disabled:opacity-55 appearance-none cursor-pointer"
            >
              {MARKETS.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.flag} {m.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">▾</span>
          </div>

          {/* Query input */}
          <div className="relative flex-1 flex items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.input_placeholder.replace('{market}', selectedMarket.label)}
              disabled={isLoading}
              autoFocus
              className="w-full h-14 pl-5 pr-40 text-lg rounded-xl border border-border bg-background
                shadow-card placeholder:text-muted-foreground/45 focus:outline-none focus:ring-2
                focus:ring-foreground/12 disabled:opacity-55 transition-shadow"
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="absolute right-2 h-10 px-6 bg-foreground text-background text-base font-semibold
                rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-82
                active:scale-[0.98] transition-all duration-100 whitespace-nowrap shadow-sm"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  {t.input_analyzing}
                </span>
              ) : t.input_analyze}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {t.categories.map((cat) => (
            <Badge key={cat} variant={category === cat ? 'default' : 'secondary'}
              className="cursor-pointer select-none transition text-base px-3 py-1"
              onClick={() => setCategory(category === cat ? undefined : cat)}>
              {cat}
            </Badge>
          ))}
        </div>
      </form>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-base text-muted-foreground/55">{t.input_try}</span>
        {t.examples.map((ex) => (
          <button key={ex} onClick={() => setQuery(ex)}
            className="text-base text-muted-foreground hover:text-foreground transition underline underline-offset-2 decoration-border/60">
            {ex}
          </button>
        ))}
      </div>
    </div>
  )
}
