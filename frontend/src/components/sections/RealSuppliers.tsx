'use client'

import { useState } from 'react'
import type { RealSupplier } from '@/types'
import { useOutreachStore } from '@/store/outreachStore'

const PLATFORM_ICONS: Record<string, string> = {
  'Alibaba': '🏭',
  'Europages': '🇪🇺',
  'Made-in-China': '🇨🇳',
  'Ankorstore': '🎨',
  'Faire': '✦',
  'Web': '🔗',
}

const PLATFORM_COLORS: Record<string, string> = {
  'Alibaba': 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800',
  'Europages': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
  'Made-in-China': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800',
  'Ankorstore': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800',
  'Faire': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
  'Web': 'bg-muted text-muted-foreground border-border',
}

interface Props {
  suppliers: RealSupplier[]
  query: string
  market?: string
}

export default function RealSuppliers({ suppliers, query, market = 'Global' }: Props) {
  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
        <span className="text-base shrink-0">🔍</span>
        <span>
          Nessun fornitore trovato per questa ricerca.{' '}
          <span className="font-medium text-foreground">Prova a raffinare la query con Miriam</span>{' '}
          per ottenere risultati più specifici.
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">
          Supplier trovati
        </span>
        <span className="text-xs text-muted-foreground/40">•</span>
        <span className="text-xs text-muted-foreground/50">{suppliers.length} risultati</span>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full ml-1">
          🟡 Dato indicativo
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {suppliers.map((s, i) => (
          <SupplierCard key={i} supplier={s} query={query} market={market} />
        ))}
      </div>
    </div>
  )
}

function SupplierCard({ supplier: s, query, market }: { supplier: RealSupplier; query: string; market: string }) {
  const { addEntry, entries } = useOutreachStore()
  const [outreachDone, setOutreachDone] = useState(false)
  const [emailCopied, setEmailCopied] = useState(false)

  const icon = PLATFORM_ICONS[s.platform] ?? '🔗'
  const badgeClass = PLATFORM_COLORS[s.platform] ?? PLATFORM_COLORS['Web']

  const isAlreadyTracked = entries.some(
    (e) => e.supplier_id === s.url && e.product_query === query,
  )

  const handleOutreach = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isAlreadyTracked || outreachDone) return
    await addEntry(s.url, s.name, query)
    setOutreachDone(true)
    setTimeout(() => setOutreachDone(false), 3000)
  }

  const handleEmail = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const template = buildEmailTemplate(s.name, query, market)
    navigator.clipboard.writeText(template).then(() => {
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 2500)
    })
  }

  return (
    <div className="group flex flex-col gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-150">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0">{icon}</span>
          <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${badgeClass} shrink-0`}>
            {s.platform}
          </span>
        </div>
        <a
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-muted-foreground/40 hover:text-primary transition-colors shrink-0 mt-0.5"
          title="Apri sito"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </a>
      </div>

      {/* Name + description */}
      <div className="space-y-1 min-w-0">
        <a
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-foreground hover:text-primary transition-colors leading-snug line-clamp-1 block"
        >
          {s.name}
        </a>
        {s.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {s.description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto pt-1 border-t border-border/50">
        <button
          onClick={handleOutreach}
          disabled={isAlreadyTracked || outreachDone}
          className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md border border-border hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-default"
        >
          {isAlreadyTracked || outreachDone
            ? <><span>✓</span> Tracciato</>
            : <><span>+</span> Outreach</>}
        </button>
        <button
          onClick={handleEmail}
          className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md border border-border hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
        >
          {emailCopied
            ? <><span>✓</span> Copiata!</>
            : <><span>📋</span> Email</>}
        </button>
      </div>
    </div>
  )
}

function buildEmailTemplate(supplierName: string, product: string, market: string): string {
  return `Subject: Request for quote — ${product}

Dear ${supplierName} team,

I am interested in sourcing "${product}" for my e-commerce store targeting the ${market} market.

Could you please provide the following information?
- Minimum order quantity (MOQ)
- Unit price (at various volume tiers, if possible)
- Lead time and shipping options
- Available certifications or quality standards

I look forward to your response.

Best regards,
[Your name]
[Company / Store name]`
}
