'use client'

import { useState } from 'react'
import type { RealSupplier } from '@/types'
import { useOutreachStore } from '@/store/outreachStore'
import { useT } from '@/hooks/useT'

const PLATFORM_COLORS: Record<string, string> = {
  'Alibaba':       'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'Europages':     'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  'Made-in-China': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'Ankorstore':    'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  'Faire':         'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'Global Sources':'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  'Spocket':       'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'Web':           'bg-muted text-muted-foreground',
}

interface Props {
  suppliers: RealSupplier[]
  query: string
  market?: string
}

export default function RealSuppliers({ suppliers, query, market = 'Global' }: Props) {
  const t = useT()

  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-md border border-dashed border-border text-xs text-muted-foreground">
        <span className="text-muted-foreground/40">○</span>
        <span>{t.rs_no_suppliers} <span className="font-medium text-foreground">{t.rs_refine}</span> →</span>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2.5">
        <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
          {t.rs_found.replace('{n}', String(suppliers.length))}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
          <span className="w-1 h-1 rounded-full bg-amber-400" />
          {t.rs_indicative}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
        {suppliers.map((s, i) => (
          <SupplierCard key={i} supplier={s} query={query} market={market} />
        ))}
      </div>
    </div>
  )
}

function SupplierCard({ supplier: s, query, market }: { supplier: RealSupplier; query: string; market: string }) {
  const t = useT()
  const { addEntry, entries } = useOutreachStore()
  const [outreachDone, setOutreachDone] = useState(false)
  const [emailCopied, setEmailCopied] = useState(false)

  const badgeClass = PLATFORM_COLORS[s.platform] ?? PLATFORM_COLORS['Web']
  const isTracked = entries.some((e) => e.supplier_id === s.url && e.product_query === query)

  const handleOutreach = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (isTracked || outreachDone) return
    await addEntry(s.url, s.name, query)
    setOutreachDone(true)
    setTimeout(() => setOutreachDone(false), 3000)
  }

  const handleEmail = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    navigator.clipboard.writeText(buildEmailTemplate(s.name, query, market)).then(() => {
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 2500)
    })
  }

  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-md border border-border bg-card hover:border-primary/40 hover:bg-muted/20 transition-colors group">
      {/* Name + platform */}
      <div className="flex-1 min-w-0">
        <a
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm font-bold text-foreground hover:text-primary transition-colors truncate leading-tight"
          title={s.name}
        >
          {s.name}
        </a>
        <span className={`inline-block mt-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded ${badgeClass}`}>
          {s.platform}
        </span>
      </div>

      {/* Icon actions */}
      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Outreach tracker */}
        <button
          onClick={handleOutreach}
          disabled={isTracked || outreachDone}
          title={isTracked || outreachDone ? t.rs_tracked : t.rs_outreach_add}
          className={`p-1.5 rounded transition-colors ${
            isTracked || outreachDone
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-muted-foreground/40 hover:text-primary hover:bg-primary/10'
          }`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            {isTracked || outreachDone
              ? <path d="M20 6L9 17l-5-5" />
              : <path d="M12 5v14M5 12h14" />
            }
          </svg>
        </button>
        {/* Copy email */}
        <button
          onClick={handleEmail}
          title={emailCopied ? t.rs_copied : t.rs_email}
          className={`p-1.5 rounded transition-colors ${
            emailCopied
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-muted-foreground/40 hover:text-primary hover:bg-primary/10'
          }`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            {emailCopied
              ? <path d="M20 6L9 17l-5-5" />
              : <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" /></>
            }
          </svg>
        </button>
        {/* Open link */}
        <a
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          title={t.rs_open_site}
          className="p-1.5 rounded text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </a>
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
