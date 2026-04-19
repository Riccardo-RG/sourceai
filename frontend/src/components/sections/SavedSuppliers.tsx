'use client'

import { useState } from 'react'
import { useSavedSuppliersStore } from '@/store/savedSuppliersStore'
import { useT } from '@/hooks/useT'

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
  const t = useT()
  const { suppliers, remove } = useSavedSuppliersStore()
  const [open, setOpen] = useState(true)

  if (suppliers.length === 0) return null

  return (
    <div className="fixed bottom-0 left-4 z-50 w-72 flex flex-col rounded-t-lg border border-border bg-background shadow-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 cursor-pointer select-none border-b border-border bg-muted/20 shrink-0"
        style={{ height: 44 }}
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <svg className="w-3 h-3 fill-current text-primary" viewBox="0 0 24 24">
            <path d="M5 3h14a1 1 0 0 1 1 1v17l-7-3-7 3V4a1 1 0 0 1 1-1z"/>
          </svg>
          <span className="text-xs font-semibold text-foreground tracking-wide">{t.ss_title}</span>
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
            {suppliers.length}
          </span>
        </div>
        <span className="text-muted-foreground/40 text-[10px]">{open ? '▼' : '▲'}</span>
      </div>

      {/* List */}
      {open && (
        <div className="overflow-y-auto max-h-64 divide-y divide-border">
          {suppliers.map((s) => (
            <div key={s.id} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/30 transition-colors group">
              <span className="text-base shrink-0">{PLATFORM_ICONS[s.platform] ?? '🔗'}</span>
              <div className="flex-1 min-w-0">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-foreground hover:text-primary transition-colors truncate block"
                >
                  {s.platform}
                </a>
                <p className="text-[10px] text-muted-foreground truncate">
                  {t.ss_for.replace('{query}', s.query)}
                </p>
              </div>
              <button
                onClick={() => remove(s.id)}
                title={t.ss_remove}
                className="shrink-0 p-1 rounded text-muted-foreground/30 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
