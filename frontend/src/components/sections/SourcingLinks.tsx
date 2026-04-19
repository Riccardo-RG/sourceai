'use client'

import { SourcingLink } from '@/types'
import { useT } from '@/hooks/useT'
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

export default function SourcingLinks({ links, query }: { links: SourcingLink[]; query: string }) {
  const t = useT()
  const { save, remove, isSaved, suppliers } = useSavedSuppliersStore()

  const toggleSave = (link: SourcingLink, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isSaved(link.url)) {
      const existing = suppliers.find((s) => s.url === link.url)
      if (existing) remove(existing.id)
    } else {
      save({
        platform: link.platform,
        url: link.url,
        label: link.label,
        description: link.description,
        query,
      })
    }
  }

  return (
    <div className="space-y-3">
      <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
        {t.sl_title} — {t.sl_subtitle}
      </div>

      <div className="rounded-md border border-border overflow-hidden divide-y divide-border">
        {links.map((link) => {
          const description = t.sl_platforms[link.platform] ?? link.description
          const saved = isSaved(link.url)
          return (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-4 py-3 bg-background hover:bg-muted/40 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{link.platform}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <button
                onClick={(e) => toggleSave(link, e)}
                title={saved ? 'Remove from saved' : 'Save supplier'}
                className={`shrink-0 p-1 rounded transition-colors ${
                  saved ? 'text-primary' : 'text-muted-foreground/30 hover:text-primary'
                }`}
              >
                {saved ? (
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M5 3h14a1 1 0 0 1 1 1v17l-7-3-7 3V4a1 1 0 0 1 1-1z"/></svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-3-7 3V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1z"/></svg>
                )}
              </button>
              <span className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all text-xs shrink-0">→</span>
            </a>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground/60">
        {t.sl_footer.replace('{query}', query)}
      </p>
    </div>
  )
}
