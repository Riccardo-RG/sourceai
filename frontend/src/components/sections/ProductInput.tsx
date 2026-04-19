'use client'

import { useState } from 'react'
import { useT } from '@/hooks/useT'

const MARKETS = [
  { code: 'GLOBAL',        flag: '🌍', label: 'Global'         },
  { code: 'EUROPE',        flag: '🇪🇺', label: 'Europe'         },
  { code: 'GB',            flag: '🇬🇧', label: 'United Kingdom' },
  { code: 'NORTH_AMERICA', flag: '🌎', label: 'North America'  },
  { code: 'LATAM',         flag: '🌎', label: 'Latin America'  },
  { code: 'ASIA_PACIFIC',  flag: '🌏', label: 'Asia Pacific'   },
  { code: 'MIDDLE_EAST',   flag: '🌍', label: 'Middle East'    },
]

interface ProductInputProps {
  onSearch: (query: string, category?: string, market?: string) => void
  isLoading: boolean
}

export default function ProductInput({ onSearch, isLoading }: ProductInputProps) {
  const t = useT()
  const [query, setQuery] = useState('')
  const [market, setMarket] = useState('GLOBAL')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && !isLoading) onSearch(query.trim(), undefined, market)
  }

  const selectedMarket = MARKETS.find((m) => m.code === market) ?? MARKETS[0]

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit}>
        {/* Command bar */}
        <div className="flex items-stretch rounded-md border border-border bg-background focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/40 transition-all overflow-hidden">
          {/* Market selector */}
          <div className="relative shrink-0 border-r border-border">
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              disabled={isLoading}
              className="h-full pl-3 pr-7 text-xs font-medium bg-muted/40 text-foreground
                focus:outline-none disabled:opacity-50 appearance-none cursor-pointer"
            >
              {MARKETS.map((m) => (
                <option key={m.code} value={m.code}>{m.flag} {m.label}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px]">▾</span>
          </div>

          {/* Query input */}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.input_placeholder.replace('{market}', selectedMarket.label)}
            disabled={isLoading}
            autoFocus
            className="flex-1 h-12 px-4 text-sm bg-transparent placeholder:text-muted-foreground/40
              focus:outline-none disabled:opacity-50"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="px-5 h-12 bg-primary text-primary-foreground text-xs font-semibold
              disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/90
              active:scale-[0.98] transition-all shrink-0 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                {t.input_analyzing}
              </>
            ) : t.input_analyze}
          </button>
        </div>
      </form>

    </div>
  )
}
