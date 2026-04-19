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
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 px-5 py-3">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          <strong>{t.sl_title}</strong> — {t.sl_subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {links.map((link) => {
          const description = t.sl_platforms[link.platform] ?? link.description
          const icon = PLATFORM_ICONS[link.platform] ?? '🔗'
          const saved = isSaved(link.url)
          return (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-4 p-5 rounded-2xl border bg-card shadow-card hover:border-foreground/30 hover:shadow-md transition-all duration-200"
            >
              <span className="text-3xl shrink-0">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-foreground">{link.platform}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              {/* Save bookmark button */}
              <button
                onClick={(e) => toggleSave(link, e)}
                title={saved ? 'Remove from saved' : 'Save supplier'}
                className={`shrink-0 p-1.5 rounded-lg transition-colors ${
                  saved
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground/40 hover:text-primary hover:bg-primary/10'
                }`}
              >
                {saved ? (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M5 3h14a1 1 0 0 1 1 1v17l-7-3-7 3V4a1 1 0 0 1 1-1z"/></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-3-7 3V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1z"/></svg>
                )}
              </button>
              <span className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0">
                →
              </span>
            </a>
          )
        })}
      </div>

      <p className="text-sm text-muted-foreground text-center">
        {t.sl_footer.replace('{query}', query)}
      </p>
    </div>
  )
}
