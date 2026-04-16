'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Supplier } from '@/types'

interface Props {
  suppliers: Supplier[]
  query: string
  onClose: () => void
}

const ROWS = [
  { label: 'Tipo', key: (s: Supplier) => s.type === 'both' ? 'Drop + Stock' : s.type === 'dropshipping' ? 'Dropshipping' : 'Stock' },
  { label: 'Prezzo unitario', key: (s: Supplier) => `€${s.price_min} – €${s.price_max}` },
  { label: 'MOQ', key: (s: Supplier) => s.moq === 1 ? 'Nessuno' : `${s.moq} unità` },
  { label: 'Spedizione', key: (s: Supplier) => `${s.shipping_days_min}–${s.shipping_days_max} giorni` },
  { label: 'Score', key: (s: Supplier) => `${s.score.toFixed(1)} / 5` },
  { label: 'Risposta', key: (s: Supplier) => `${s.response_rate}%` },
  { label: 'Certificazioni', key: (s: Supplier) => s.certifications.join(', ') || '—' },
  { label: 'Verificato', key: (s: Supplier) => s.verified ? 'Sì' : 'No' },
]

// For each row, find the "best" value index to highlight
function getBestIndex(row: typeof ROWS[number], suppliers: Supplier[]): number | null {
  // Only highlight for numeric comparisons
  const label = row.label
  if (label === 'Score' || label === 'Risposta') {
    const vals = suppliers.map((s) => parseFloat(row.key(s)))
    const max = Math.max(...vals)
    return vals.indexOf(max)
  }
  if (label === 'Prezzo unitario') {
    const vals = suppliers.map((s) => s.price_min)
    const min = Math.min(...vals)
    return vals.indexOf(min)
  }
  if (label === 'MOQ') {
    const vals = suppliers.map((s) => s.moq)
    const min = Math.min(...vals)
    return vals.indexOf(min)
  }
  if (label === 'Spedizione') {
    const vals = suppliers.map((s) => s.shipping_days_min)
    const min = Math.min(...vals)
    return vals.indexOf(min)
  }
  return null
}

export default function SupplierComparison({ suppliers, query, onClose }: Props) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-x-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Confronto supplier</DialogTitle>
          <p className="text-sm text-muted-foreground">Prodotto: {query}</p>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left py-2 pr-4 text-xs text-muted-foreground font-medium w-32"></th>
                {suppliers.map((s) => (
                  <th key={s.id} className="text-left py-2 px-3 font-semibold text-xs leading-tight">
                    <div>{s.name.split(' ').slice(0, 3).join(' ')}</div>
                    <Badge variant="outline" className="text-[10px] mt-1 font-normal">{s.source}</Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => {
                const bestIdx = getBestIndex(row, suppliers)
                return (
                  <tr key={row.label} className="border-t border-border/50">
                    <td className="py-2.5 pr-4 text-xs text-muted-foreground font-medium">{row.label}</td>
                    {suppliers.map((s, i) => (
                      <td
                        key={s.id}
                        className={`py-2.5 px-3 text-xs ${bestIdx === i ? 'text-emerald-600 font-semibold dark:text-emerald-400' : ''}`}
                      >
                        {row.key(s)}
                        {bestIdx === i && <span className="ml-1 text-[10px]">✓</span>}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-2 border-t text-xs text-muted-foreground">
          I valori in verde indicano il migliore per quella metrica.
        </div>
      </DialogContent>
    </Dialog>
  )
}
