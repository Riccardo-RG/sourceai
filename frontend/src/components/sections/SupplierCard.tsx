'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { Supplier } from '@/types'
import { useMarginStore } from '@/store/marginStore'
import { useOutreachStore } from '@/store/outreachStore'

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  dropshipping: { label: 'Dropshipping', color: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' },
  stock:        { label: 'Stock',         color: 'bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800' },
  both:         { label: 'Drop + Stock',  color: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
}

function ScoreDots({ score }: { score: number }) {
  const filled = Math.round(score)
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < filled ? 'bg-foreground' : 'bg-muted-foreground/20'}`} />
      ))}
      <span className="ml-1.5 text-base text-muted-foreground tabular-nums">{score.toFixed(1)}</span>
    </div>
  )
}

function OutreachModal({ supplier, query, open, onClose }: { supplier: Supplier; query: string; open: boolean; onClose: () => void }) {
  const draft = `Oggetto: Richiesta preventivo — ${query}\n\nGentile team di ${supplier.name},\n\nvi contatto per richiedere un preventivo per il seguente prodotto:\n\nProdotto: ${query}\nQuantità di interesse: ${supplier.moq} – ${supplier.moq * 5} unità\nModalità: ${supplier.type === 'dropshipping' ? 'Dropshipping' : supplier.type === 'stock' ? 'Acquisto stock' : 'Dropshipping o stock, da valutare'}\n\nPotreste indicarmi:\n1. Prezzo unitario per le quantità indicate\n2. Tempi di produzione e spedizione verso l'Europa\n3. Possibilità di campionatura e relativo costo\n4. Certificazioni disponibili (CE, RoHS, ecc.)\n\nRimango in attesa di un vostro riscontro.\n\nCordiali saluti`

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Richiesta preventivo</DialogTitle>
          <p className="text-base text-muted-foreground">{supplier.name}</p>
        </DialogHeader>
        <div className="space-y-4">
          <textarea defaultValue={draft} rows={16}
            className="w-full text-base p-4 rounded-xl border bg-muted/30 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-foreground/10 leading-relaxed" />
          <div className="flex gap-2 justify-end">
            <button onClick={onClose} className="px-4 h-11 text-base text-muted-foreground hover:text-foreground transition rounded-lg">Annulla</button>
            <a href={`mailto:?subject=Richiesta preventivo — ${encodeURIComponent(query)}&body=${encodeURIComponent(draft)}`}
              className="px-5 h-11 text-base bg-foreground text-background rounded-lg font-semibold hover:opacity-85 transition flex items-center shadow-sm">
              Apri nel client email
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface SupplierCardProps { supplier: Supplier; query: string; selected: boolean; onToggleSelect: (id: string) => void }

export default function SupplierCard({ supplier, query, selected, onToggleSelect }: SupplierCardProps) {
  const [showOutreach, setShowOutreach] = useState(false)
  const { setInput } = useMarginStore()
  const { addEntry } = useOutreachStore()

  const cfg = TYPE_CONFIG[supplier.type]

  return (
    <>
      <div className={`rounded-2xl border bg-card card-lift overflow-hidden ${selected ? 'ring-2 ring-foreground shadow-card-md' : ''}`}>
        <div className="p-6 space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg font-semibold leading-tight">{supplier.name}</h3>
                {supplier.verified && (
                  <Tooltip>
                    <TooltipTrigger className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full cursor-default select-none dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                      ✓ Verificato
                    </TooltipTrigger>
                    <TooltipContent>Fornitore verificato dalla piattaforma</TooltipContent>
                  </Tooltip>
                )}
              </div>
              <div className="flex items-center gap-3 text-base text-muted-foreground flex-wrap">
                <span>{supplier.source}</span>
                {supplier.years_on_platform && <span>· {supplier.years_on_platform} anni</span>}
                <span className="flex items-center gap-1">
                  · risponde {supplier.response_rate}%
                  <InfoTooltip text="Percentuale di richieste di preventivo a cui questo supplier ha risposto storicamente. Sopra 85% è ottimo." />
                </span>
              </div>
            </div>
            <span className={`text-sm font-semibold px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>

          <p className="text-base text-muted-foreground leading-relaxed">{supplier.description}</p>

          <Separator />

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-1">
                <p className="metric-label">Prezzo/unità</p>
                <InfoTooltip text="Range di prezzo per unità. Usa 'Usa nel calcolatore' per inserirlo nel margin calculator." />
              </div>
              <p className="text-lg font-bold tabular-nums">€{supplier.price_min} – €{supplier.price_max}</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-1">
                <p className="metric-label">MOQ</p>
                <InfoTooltip text="Quantità minima per ordine. MOQ = 1 significa dropshipping puro, zero stock da tenere." />
              </div>
              <p className="text-lg font-bold tabular-nums">{supplier.moq === 1 ? 'Nessuno' : `${supplier.moq} u`}</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-1">
                <p className="metric-label">Spedizione</p>
                <InfoTooltip text="Giorni lavorativi stimati dalla spedizione alla consegna al cliente finale." />
              </div>
              <p className="text-lg font-bold tabular-nums">{supplier.shipping_days_min}–{supplier.shipping_days_max}gg</p>
            </div>
          </div>

          {/* Certifications + score */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {supplier.certifications.map((c) => (
                <Badge key={c} variant="secondary" className="text-base px-2.5 py-0.5 font-medium">{c}</Badge>
              ))}
              {supplier.certifications.length > 0 && (
                <InfoTooltip text="CE = conforme al mercato europeo · RoHS = materiali non pericolosi · FDA = mercato USA food/cosmetics." />
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <InfoTooltip text="Score 0–5 basato su completezza profilo, certificazioni, anni sulla piattaforma e tasso di risposta." />
              <ScoreDots score={supplier.score} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1 flex-wrap">
            <button onClick={() => { setShowOutreach(true); addEntry(supplier.id, supplier.name, query) }}
              className="flex-1 h-11 text-base font-semibold bg-foreground text-background rounded-xl hover:opacity-85 transition shadow-sm">
              Richiedi preventivo
            </button>
            <button onClick={() => setInput('unit_cost', supplier.price_min)}
              className="flex-1 h-11 text-base font-medium border rounded-xl hover:bg-muted/50 transition">
              Usa nel calcolatore
            </button>
            <Tooltip>
              <TooltipTrigger onClick={() => onToggleSelect(supplier.id)}
                className={`h-11 px-4 text-base font-medium rounded-xl border transition ${selected ? 'bg-foreground text-background border-foreground' : 'hover:bg-muted/50'}`}>
                {selected ? '✓ Selezionato' : 'Confronta'}
              </TooltipTrigger>
              <TooltipContent>Aggiungi al confronto (max 3)</TooltipContent>
            </Tooltip>
            <a href={supplier.url} target="_blank" rel="noopener noreferrer"
              className="h-11 px-4 text-base font-medium border rounded-xl hover:bg-muted/50 transition flex items-center text-muted-foreground hover:text-foreground">
              ↗
            </a>
          </div>
        </div>
      </div>

      <OutreachModal supplier={supplier} query={query} open={showOutreach} onClose={() => setShowOutreach(false)} />
    </>
  )
}
