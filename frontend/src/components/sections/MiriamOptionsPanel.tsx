'use client'

import { useState } from 'react'
import { useT } from '@/hooks/useT'
import type { SearchOptions, SearchContext } from '@/types'

const POSITIONING_ICONS: Record<string, string> = {
  mass_market: '📦',
  premium: '✦',
  artisanal: '🎨',
  dropshipping: '🚀',
}

const MARKET_FLAGS: Record<string, string> = {
  GLOBAL: '🌍', EUROPE: '🇪🇺', NORTH_AMERICA: '🌎', LATAM: '🌎',
  ASIA_PACIFIC: '🌏', MIDDLE_EAST: '🌍', GB: '🇬🇧', IT: '🇮🇹',
  DE: '🇩🇪', FR: '🇫🇷', ES: '🇪🇸', JP: '🇯🇵', AU: '🇦🇺',
  CA: '🇨🇦', MX: '🇲🇽', BR: '🇧🇷',
}

const CHANNEL_ICONS: Record<string, string> = {
  online: '🛒',
  store: '🏪',
  dropshipping: '🚀',
}

function getChoiceIcon(groupId: string, value: string): string | undefined {
  if (groupId === 'positioning') return POSITIONING_ICONS[value]
  if (groupId === 'market') return MARKET_FLAGS[value]
  if (groupId === 'channel') return CHANNEL_ICONS[value]
  return undefined
}

interface Props {
  options: SearchOptions | null
  loading: boolean
  initialMarket?: string
  onConfirm: (refinedQuery: string, market: string, ctx: SearchContext) => void
  onCancel: () => void
}

export default function MiriamOptionsPanel({
  options,
  loading,
  initialMarket = 'GLOBAL',
  onConfirm,
  onCancel,
}: Props) {
  const t = useT()
  const [selections, setSelections] = useState<Record<string, string>>({
    market: initialMarket,
  })

  const select = (groupId: string, value: string) =>
    setSelections((s) => ({ ...s, [groupId]: value }))

  const canConfirm = !!(options && selections['positioning'])

  const handleConfirm = () => {
    if (!options || !selections['positioning']) return
    const market = (selections['market'] || initialMarket).toUpperCase()
    const ctx: SearchContext = {
      refined_query: options.refined_query,
      positioning: selections['positioning'] as SearchContext['positioning'],
      market,
      channel: (selections['channel'] as SearchContext['channel']) || 'online',
      target_customer: selections['target_customer'] || '',
      supplier_context: '',
    }
    onConfirm(options.refined_query, market, ctx)
  }

  if (loading) return <SkeletonPanel />
  if (!options) return null

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-400 rounded-lg border border-border bg-card overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-muted/20">
        <span className="text-primary text-sm font-bold leading-none shrink-0">✦</span>
        <span className="text-xs font-semibold text-foreground tracking-wide shrink-0">Miriam</span>
        <span className="text-xs text-muted-foreground leading-snug">{options.intro}</span>
      </div>

      {/* Option groups */}
      <div className="px-4 py-5 space-y-6">
        {options.groups.map((group) => (
          <div key={group.id} className="space-y-2.5">
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground/60 uppercase">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.choices.map((choice) => {
                const selected = selections[group.id] === choice.value
                const icon = getChoiceIcon(group.id, choice.value)
                return (
                  <button
                    key={choice.value}
                    onClick={() => select(group.id, choice.value)}
                    className={`
                      flex items-start gap-2 px-3 py-2 rounded-md border text-left transition-all
                      ${selected
                        ? 'border-primary/60 bg-primary/10 text-foreground ring-1 ring-primary/20'
                        : 'border-border bg-background hover:border-primary/30 hover:bg-muted/40 text-foreground'
                      }
                    `}
                  >
                    {icon && (
                      <span className="text-sm shrink-0 mt-px leading-none">{icon}</span>
                    )}
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold leading-snug ${selected ? 'text-primary' : ''}`}>
                        {choice.label}
                      </p>
                      {choice.desc && (
                        <p className="text-[10px] text-muted-foreground/60 leading-snug mt-0.5">
                          {choice.desc}
                        </p>
                      )}
                    </div>
                    {selected && (
                      <span className="ml-1.5 shrink-0 text-primary text-[10px] font-bold self-center">✓</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
        <button
          onClick={onCancel}
          className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          {t.options_cancel}
        </button>
        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold
            disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-[0.98] transition-all"
        >
          {t.options_confirm}
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function SkeletonPanel() {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden animate-pulse">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-muted/20">
        <div className="w-3 h-3 rounded-full bg-muted shrink-0" />
        <div className="h-3 w-14 bg-muted rounded shrink-0" />
        <div className="h-3 w-52 bg-muted/50 rounded" />
      </div>
      <div className="px-4 py-5 space-y-6">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-2.5">
            <div className="h-2.5 w-24 bg-muted rounded" />
            <div className="flex gap-2 flex-wrap">
              {[0, 1, 2, 3].map((j) => (
                <div key={j} className="h-14 w-28 bg-muted/60 rounded-md" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end px-4 py-3 border-t border-border">
        <div className="h-8 w-40 bg-muted rounded-md" />
      </div>
    </div>
  )
}
