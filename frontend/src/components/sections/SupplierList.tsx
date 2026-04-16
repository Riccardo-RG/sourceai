'use client'

import { useState } from 'react'
import { Supplier } from '@/types'
import SupplierCard from './SupplierCard'
import SupplierComparison from './SupplierComparison'
import { Badge } from '@/components/ui/badge'

type FilterType = 'all' | 'dropshipping' | 'stock' | 'both'

export default function SupplierList({ suppliers, query }: { suppliers: Supplier[]; query: string }) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [selected, setSelected] = useState<string[]>([])
  const [showComparison, setShowComparison] = useState(false)

  const filtered = filter === 'all' ? suppliers : suppliers.filter((s) => s.type === filter)

  const toggleSelect = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-lg font-semibold">{filtered.length} supplier</p>
          <p className="text-base text-muted-foreground">per &ldquo;{query}&rdquo;</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'dropshipping', 'stock', 'both'] as FilterType[]).map((f) => (
            <Badge key={f} variant={filter === f ? 'default' : 'secondary'}
              className="cursor-pointer select-none text-base px-3 py-1"
              onClick={() => setFilter(f)}>
              {f === 'all' ? 'Tutti' : f === 'both' ? 'Drop + Stock' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Badge>
          ))}
        </div>
      </div>

      {/* Compare bar */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between px-5 py-4 rounded-xl border bg-card shadow-card">
          <p className="text-base font-medium">
            <span className="font-bold">{selected.length}</span> supplier selezionati
          </p>
          <div className="flex gap-3">
            <button onClick={() => setSelected([])} className="text-base text-muted-foreground hover:text-foreground transition">Cancella</button>
            <button onClick={() => setShowComparison(true)} disabled={selected.length < 2}
              className="px-4 h-10 text-base font-semibold bg-foreground text-background rounded-lg hover:opacity-85 transition disabled:opacity-30">
              Confronta →
            </button>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="space-y-4">
        {filtered.map((s) => (
          <SupplierCard key={s.id} supplier={s} query={query}
            selected={selected.includes(s.id)} onToggleSelect={toggleSelect} />
        ))}
      </div>

      {showComparison && (
        <SupplierComparison suppliers={suppliers.filter((s) => selected.includes(s.id))}
          query={query} onClose={() => setShowComparison(false)} />
      )}
    </div>
  )
}
