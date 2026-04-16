'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

const EXAMPLES = ['Borraccia termica 500ml', 'Portafoglio minimalista in pelle', 'Cuscino ergonomico da viaggio', 'LED desk lamp con USB']
const CATEGORIES = ['Casa e cucina', 'Sport e outdoor', 'Elettronica', 'Moda', 'Beauty', 'Pet', 'Altro']

interface ProductInputProps {
  onSearch: (query: string, category?: string) => void
  isLoading: boolean
}

export default function ProductInput({ onSearch, isLoading }: ProductInputProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | undefined>()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && !isLoading) onSearch(query.trim(), category)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative flex items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Descrivi il prodotto che vuoi vendere…"
            disabled={isLoading}
            autoFocus
            className="w-full h-14 pl-5 pr-44 text-lg rounded-xl border border-border bg-background
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
                Analisi…
              </span>
            ) : 'Analizza →'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Badge key={cat} variant={category === cat ? 'default' : 'secondary'}
              className="cursor-pointer select-none transition text-base px-3 py-1"
              onClick={() => setCategory(category === cat ? undefined : cat)}>
              {cat}
            </Badge>
          ))}
        </div>
      </form>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-base text-muted-foreground/55">Prova con:</span>
        {EXAMPLES.map((ex) => (
          <button key={ex} onClick={() => setQuery(ex)}
            className="text-base text-muted-foreground hover:text-foreground transition underline underline-offset-2 decoration-border/60">
            {ex}
          </button>
        ))}
      </div>
    </div>
  )
}
