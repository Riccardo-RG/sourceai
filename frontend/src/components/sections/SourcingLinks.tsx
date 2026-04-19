'use client'

import { SourcingLink } from '@/types'
import { useT } from '@/hooks/useT'

const PLATFORM_ICONS: Record<string, string> = {
  Alibaba: '🏭',
  AliExpress: '📦',
  'Made-in-China': '🇨🇳',
  Europages: '🇪🇺',
}

export default function SourcingLinks({ links, query }: { links: SourcingLink[]; query: string }) {
  const t = useT()

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
          return (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-5 rounded-2xl border bg-card shadow-card hover:border-foreground/30 hover:shadow-md transition-all duration-200"
            >
              <span className="text-3xl shrink-0">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-foreground">{link.platform}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
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
