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
      <div className="flex items-center gap-2 px-4 py-3 rounded-md border border-dashed border-border text-xs text-muted-foreground">
        <span className="text-muted-foreground/40">○</span>
        <span>
          Nessun fornitore trovato.{' '}
          <span className="font-medium text-foreground">Raffina la query con Miriam</span>{' '}
          per risultati più specifici.
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
          Supplier — {suppliers.length} trovati
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
          Dato indicativo
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
    <div className="flex flex-col gap-2.5 p-3.5 rounded-md border border-border bg-background hover:border-primary/30 transition-colors duration-150">
      {/* Platform + link */}
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${badgeClass}`}>
          {s.platform}
        </span>
        <a
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-muted-foreground/30 hover:text-primary transition-colors"
          title="Apri sito"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </a>
      </div>

      {/* Name + description */}
      <div className="min-w-0">
        <a
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-foreground hover:text-primary transition-colors leading-snug line-clamp-1 block"
        >
          {s.name}
        </a>
        {s.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-0.5">
            {s.description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/40">
        <button
          onClick={handleOutreach}
          disabled={isAlreadyTracked || outreachDone}
          className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded border transition-colors disabled:cursor-default
            ${isAlreadyTracked || outreachDone
              ? 'text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30'
              : 'text-muted-foreground border-border hover:text-primary hover:border-primary/40 hover:bg-primary/5'}`}
        >
          {isAlreadyTracked || outreachDone ? '✓ Tracciato' : '+ Outreach'}
        </button>
        <button
          onClick={handleEmail}
          className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded border transition-colors
            ${emailCopied
              ? 'text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30'
              : 'text-muted-foreground border-border hover:text-primary hover:border-primary/40 hover:bg-primary/5'}`}
        >
          {emailCopied ? '✓ Copiata!' : '↗ Email'}
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
