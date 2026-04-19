'use client'

import { useState } from 'react'
import { useSavedSuppliersStore } from '@/store/savedSuppliersStore'

const PLATFORM_ICONS: Record<string, string> = {
  Alibaba: '🏭',
  AliExpress: '📦',
  'Made-in-China': '🇨🇳',
  Europages: '🇪🇺',
  Spocket: '🚀',
  DHgate: '🏪',
  Ankorstore: '🎨',
  Faire: '✦',
}

export default function SavedSuppliers() {
  const { suppliers, remove } = useSavedSuppliersStore()
  const [open, setOpen] = useState(true)

  if (suppliers.length === 0) return null

  return (
    <div className="fixed bottom-0 left-4 z-50 w-72 flex flex-col rounded-t-xl border border-border bg-background shadow-2xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 cursor-pointer select-none border-b border-border bg-muted/40 shrink-0"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 fill-current text-primary" viewBox="0 0 24 24">
            <path d="M5 3h14a1 1 0 0 1 1 1v17l-7-3-7 3V4a1 1 0 0 1 1-1z"/>
          </svg>
          <span className="text-sm font-semibold text-foreground">Supplier salvati</span>
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
            {suppliers.length}
          </span>
        </div>
        <span className="text-muted-foreground text-xs">{open ? '▼' : '▲'}</span>
      </div>

      {/* List */}
      {open && (
        <div className="overflow-y-auto max-h-72 divide-y divide-border">
          {suppliers.map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-3 py-3 hover:bg-muted/30 transition-colors group">
              <span className="text-xl shrink-0">{PLATFORM_ICONS[s.platform] ?? '🔗'}</span>
              <div className="flex-1 min-w-0">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate block"
                >
                  {s.platform}
                </a>
                <p className="text-xs text-muted-foreground truncate">per: {s.query}</p>
              </div>
              <button
                onClick={() => remove(s.id)}
                title="Rimuovi"
                className="shrink-0 p-1 rounded text-muted-foreground/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors opacity-0 group-hover:opacity-100"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
